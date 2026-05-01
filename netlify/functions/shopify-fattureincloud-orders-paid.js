"use strict";

const crypto = require("node:crypto");

const SHOPIFY_API_VERSION = process.env.SHOPIFY_ADMIN_API_VERSION || "2026-04";
const SHOPIFY_STORE_DOMAIN = String(process.env.SHOPIFY_STORE_DOMAIN || "")
  .trim()
  .replace(/^https?:\/\//i, "")
  .replace(/\/$/, "");
const SHOPIFY_ADMIN_API_TOKEN = String(process.env.SHOPIFY_ADMIN_API_TOKEN || "").trim();
const SHOPIFY_WEBHOOK_SECRET = String(process.env.SHOPIFY_WEBHOOK_SECRET || "").trim();

const FIC_BASE_URL = String(process.env.FIC_BASE_URL || "https://api-v2.fattureincloud.it")
  .trim()
  .replace(/\/$/, "");
const FIC_ACCESS_TOKEN = String(process.env.FIC_ACCESS_TOKEN || "").trim();
const FIC_COMPANY_ID = String(process.env.FIC_COMPANY_ID || "").trim();
const FIC_DEFAULT_VAT_ID = String(process.env.FIC_DEFAULT_VAT_ID || "").trim();
const FIC_DEFAULT_COUNTRY = String(process.env.FIC_DEFAULT_COUNTRY || "Italia").trim();
const FIC_DEFAULT_COUNTRY_ISO = String(process.env.FIC_DEFAULT_COUNTRY_ISO || "IT").trim().toUpperCase();
const FIC_PAYMENT_ACCOUNT_ID = String(process.env.FIC_PAYMENT_ACCOUNT_ID || "").trim();
const FIC_PAYMENT_METHOD_ID = String(process.env.FIC_PAYMENT_METHOD_ID || "").trim();
const FIC_TEMPLATE_ID = String(process.env.FIC_TEMPLATE_ID || "").trim();
const FIC_EI_PAYMENT_METHOD = String(process.env.FIC_EI_PAYMENT_METHOD || "").trim();
const FIC_DEFAULT_EI_CODE = String(process.env.FIC_DEFAULT_EI_CODE || "").trim();
const FIC_DOCUMENT_LANGUAGE_CODE = String(process.env.FIC_DOCUMENT_LANGUAGE_CODE || "it").trim();
const FIC_DOCUMENT_LANGUAGE_NAME = String(process.env.FIC_DOCUMENT_LANGUAGE_NAME || "Italiano").trim();
const FIC_CREATE_CLIENTS = /^(1|true|yes|on)$/i.test(String(process.env.FIC_CREATE_CLIENTS || "").trim());
const FIC_ENABLE_E_INVOICE = /^(1|true|yes|on)$/i.test(String(process.env.FIC_ENABLE_E_INVOICE || "").trim());

const SHOPIFY_FIC_METAFIELD_NAMESPACE = String(process.env.SHOPIFY_FIC_METAFIELD_NAMESPACE || "custom").trim();
const SHOPIFY_FIC_METAFIELD_KEY = String(process.env.SHOPIFY_FIC_METAFIELD_KEY || "fatture_in_cloud_invoice_id").trim();
const SHOPIFY_FIC_METAFIELD_NUMBER_KEY = String(process.env.SHOPIFY_FIC_METAFIELD_NUMBER_KEY || "fatture_in_cloud_invoice_number").trim();

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const json = (statusCode, body) => ({
  statusCode,
  headers: responseHeaders,
  body: JSON.stringify(body)
});

const roundCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const parseJsonEnv = (value, fallback = {}) => {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("FIC_VAT_MAP non e un JSON valido, uso il fallback.");
  }

  return fallback;
};

const FIC_VAT_MAP = parseJsonEnv(process.env.FIC_VAT_MAP, {});

const getMissingConfig = () => {
  const missing = [];

  if (!SHOPIFY_STORE_DOMAIN) missing.push("SHOPIFY_STORE_DOMAIN");
  if (!SHOPIFY_ADMIN_API_TOKEN) missing.push("SHOPIFY_ADMIN_API_TOKEN");
  if (!SHOPIFY_WEBHOOK_SECRET) missing.push("SHOPIFY_WEBHOOK_SECRET");
  if (!FIC_ACCESS_TOKEN) missing.push("FIC_ACCESS_TOKEN");
  if (!FIC_COMPANY_ID) missing.push("FIC_COMPANY_ID");
  if (!FIC_DEFAULT_VAT_ID) missing.push("FIC_DEFAULT_VAT_ID");

  return missing;
};

const readJson = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
};

const getHeader = (event, name) => {
  const headers = event && event.headers ? event.headers : {};
  const target = String(name || "").toLowerCase();

  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() === target) {
      return value;
    }
  }

  return "";
};

const getRawBodyBuffer = (event) => {
  if (!event || !event.body) {
    return Buffer.from("");
  }

  return event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : Buffer.from(event.body, "utf8");
};

const parseJsonBuffer = (buffer) => {
  if (!buffer || buffer.length === 0) {
    return {};
  }

  try {
    return JSON.parse(buffer.toString("utf8"));
  } catch (error) {
    throw new Error("Body JSON non valido.");
  }
};

const verifyShopifyHmac = (rawBodyBuffer, receivedSignature) => {
  if (!SHOPIFY_WEBHOOK_SECRET || !receivedSignature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(rawBodyBuffer)
    .digest("base64");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(String(receivedSignature), "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "");

const compactObject = (input) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

const parseNumericId = (value) => {
  const normalized = Number.parseInt(String(value || "").trim(), 10);
  return Number.isFinite(normalized) ? normalized : null;
};

const parseDecimal = (value, fallback = 0) => {
  const normalized = Number.parseFloat(String(value ?? "").trim());
  return Number.isFinite(normalized) ? normalized : fallback;
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const pickFirst = (...values) => {
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
};

const toIsoDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
};

const buildShopifyOrderGid = (orderId) => `gid://shopify/Order/${orderId}`;

const shopifyRest = async (path, init = {}) => {
  const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}${path}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
      ...(init.headers || {})
    }
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const error = new Error(`Shopify REST API error (${response.status}).`);
    error.details = payload;
    throw error;
  }

  return payload;
};

const shopifyGraphql = async (query, variables = {}) => {
  const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await readJson(response);

  if (!response.ok || payload.errors) {
    const error = new Error(`Shopify GraphQL API error (${response.status}).`);
    error.details = payload;
    throw error;
  }

  return payload.data;
};

const ficRequest = async (path, init = {}) => {
  const response = await fetch(`${FIC_BASE_URL}${path}`, {
    method: "GET",
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${FIC_ACCESS_TOKEN}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {})
    }
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const error = new Error(`Fatture in Cloud API error (${response.status}).`);
    error.statusCode = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
};

const getOrderInvoiceMetafield = async (orderGid) => {
  const data = await shopifyGraphql(
    `
      query OrderInvoiceMetafield($id: ID!, $namespace: String!, $key: String!) {
        order(id: $id) {
          id
          name
          metafield(namespace: $namespace, key: $key) {
            value
          }
        }
      }
    `,
    {
      id: orderGid,
      namespace: SHOPIFY_FIC_METAFIELD_NAMESPACE,
      key: SHOPIFY_FIC_METAFIELD_KEY
    }
  );

  return data && data.order && data.order.metafield ? String(data.order.metafield.value || "").trim() : "";
};

const setOrderInvoiceMetafields = async (orderGid, invoiceId, invoiceNumber) => {
  const data = await shopifyGraphql(
    `
      mutation SetInvoiceMetafields($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            namespace
            key
            value
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    {
      metafields: [
        {
          ownerId: orderGid,
          namespace: SHOPIFY_FIC_METAFIELD_NAMESPACE,
          key: SHOPIFY_FIC_METAFIELD_KEY,
          type: "single_line_text_field",
          value: String(invoiceId)
        },
        {
          ownerId: orderGid,
          namespace: SHOPIFY_FIC_METAFIELD_NAMESPACE,
          key: SHOPIFY_FIC_METAFIELD_NUMBER_KEY,
          type: "single_line_text_field",
          value: String(invoiceNumber || invoiceId)
        }
      ]
    }
  );

  const result = data && data.metafieldsSet ? data.metafieldsSet : null;

  if (result && Array.isArray(result.userErrors) && result.userErrors.length > 0) {
    const error = new Error("Impossibile salvare il riferimento fattura nei metafield Shopify.");
    error.details = result.userErrors;
    throw error;
  }

  return result;
};

const fetchShopifyOrder = async (orderId) => {
  const payload = await shopifyRest(`/orders/${orderId}.json`);
  if (!payload || !payload.order) {
    throw new Error("Ordine Shopify non trovato.");
  }
  return payload.order;
};

const getOrderNotesMap = (order) => {
  const entries = safeArray(order && order.note_attributes);
  const notes = {};

  for (const entry of entries) {
    const key = normalizeKey(entry && (entry.name || entry.key || entry.label));
    const value = String(entry && (entry.value || entry.val || "")).trim();

    if (key && value) {
      notes[key] = value;
    }
  }

  return notes;
};

const getPrimaryAddress = (order, notes) => {
  const billing = order && order.billing_address ? order.billing_address : {};
  const shipping = order && order.shipping_address ? order.shipping_address : {};
  const fallback = order && order.customer && order.customer.default_address ? order.customer.default_address : {};

  return {
    firstName: pickFirst(notes.first_name, notes.nome, billing.first_name, shipping.first_name, fallback.first_name),
    lastName: pickFirst(notes.last_name, notes.cognome, billing.last_name, shipping.last_name, fallback.last_name),
    company: pickFirst(
      notes.company_name,
      notes.company,
      notes.ragione_sociale,
      billing.company,
      shipping.company,
      fallback.company
    ),
    address1: pickFirst(notes.address_street, notes.indirizzo, billing.address1, shipping.address1, fallback.address1),
    address2: pickFirst(notes.address_extra, billing.address2, shipping.address2, fallback.address2),
    postalCode: pickFirst(notes.address_postal_code, notes.cap, billing.zip, shipping.zip, fallback.zip),
    city: pickFirst(notes.address_city, notes.citta, billing.city, shipping.city, fallback.city),
    province: pickFirst(notes.address_province, notes.provincia, billing.province_code, shipping.province_code, fallback.province_code),
    country: pickFirst(notes.country, billing.country, shipping.country, fallback.country, FIC_DEFAULT_COUNTRY),
    countryIso: pickFirst(notes.country_iso, billing.country_code, shipping.country_code, fallback.country_code, FIC_DEFAULT_COUNTRY_ISO).toUpperCase(),
    phone: pickFirst(notes.phone, notes.telefono, billing.phone, shipping.phone, order && order.phone, order && order.customer && order.customer.phone)
  };
};

const getVatNumber = (notes) =>
  pickFirst(notes.vat_number, notes.partita_iva, notes.partitaiva, notes.p_iva);

const getTaxCode = (notes) =>
  pickFirst(notes.tax_code, notes.codice_fiscale, notes.codicefiscale);

const getEiCode = (notes) =>
  pickFirst(notes.ei_code, notes.sdi_code, notes.codice_destinatario, notes.sdi, FIC_DEFAULT_EI_CODE);

const getPec = (notes) =>
  pickFirst(notes.certified_email, notes.pec);

const buildOrderEntity = (order) => {
  const notes = getOrderNotesMap(order);
  const address = getPrimaryAddress(order, notes);
  const companyName = address.company;
  const personName = pickFirst(
    notes.full_name,
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    [order && order.customer && order.customer.first_name, order && order.customer && order.customer.last_name]
      .filter(Boolean)
      .join(" "),
    order && order.contact_email,
    order && order.email
  );
  const vatNumber = getVatNumber(notes);
  const taxCode = getTaxCode(notes);
  const eiCode = getEiCode(notes);
  const pec = getPec(notes);

  const entity = compactObject({
    name: companyName || personName || `Cliente Shopify ${order && (order.name || order.id)}`,
    vat_number: vatNumber,
    tax_code: taxCode,
    email: pickFirst(order && order.email, order && order.contact_email),
    certified_email: pec,
    phone: address.phone,
    address_street: address.address1,
    address_postal_code: address.postalCode,
    address_city: address.city,
    address_province: address.province,
    address_extra: address.address2,
    country: address.country,
    country_iso: address.countryIso
  });

  if (FIC_ENABLE_E_INVOICE) {
    if (!eiCode) {
      throw new Error("E-fattura attiva ma manca il codice SDI/ei_code. Inseriscilo nell'ordine o imposta FIC_DEFAULT_EI_CODE.");
    }

    entity.e_invoice = true;
    entity.ei_code = eiCode;
  }

  return {
    entity,
    clientType: companyName || vatNumber ? "company" : "person"
  };
};

const normalizeRateKey = (rate) => {
  const rounded = Math.round(parseDecimal(rate, 0) * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

const getLineVatRate = (line, fallbackTaxLines = []) => {
  const sourceTaxLine = safeArray(line && line.tax_lines)[0] || safeArray(fallbackTaxLines)[0];
  if (!sourceTaxLine) {
    return 0;
  }
  return roundCurrency(parseDecimal(sourceTaxLine.rate, 0) * 100);
};

const resolveVatId = (vatRate) => {
  const rateKey = normalizeRateKey(vatRate);
  const mappedValue = FIC_VAT_MAP[rateKey];
  const resolved = mappedValue !== undefined && mappedValue !== null && String(mappedValue).trim() !== ""
    ? mappedValue
    : FIC_DEFAULT_VAT_ID;

  const vatId = parseNumericId(resolved);

  if (vatId === null) {
    throw new Error(`VAT id non valido per aliquota ${rateKey}. Controlla FIC_DEFAULT_VAT_ID o FIC_VAT_MAP.`);
  }

  return vatId;
};

const getDiscountedUnitPrice = (line) => {
  const quantity = Math.max(1, parseDecimal(line && line.quantity, 1));
  const unitPrice = parseDecimal(line && line.price, 0);
  const totalDiscount = parseDecimal(line && line.total_discount, 0);
  return roundCurrency(unitPrice - totalDiscount / quantity);
};

const grossToNet = (grossAmount, vatRate) => {
  const divisor = 1 + parseDecimal(vatRate, 0) / 100;
  if (divisor <= 0) {
    return roundCurrency(grossAmount);
  }
  return roundCurrency(grossAmount / divisor);
};

const buildItemsList = (order) => {
  const items = [];
  const fallbackTaxLines = safeArray(order && order.tax_lines);
  const taxesIncluded = Boolean(order && order.taxes_included);

  for (const line of safeArray(order && order.line_items)) {
    const quantity = Math.max(1, parseDecimal(line && line.quantity, 1));
    const vatRate = getLineVatRate(line, fallbackTaxLines);
    const discountedUnitPrice = getDiscountedUnitPrice(line);
    const netPrice = taxesIncluded ? grossToNet(discountedUnitPrice, vatRate) : roundCurrency(discountedUnitPrice);
    const variantTitle = pickFirst(line && line.variant_title);
    const title = pickFirst(line && line.title, line && line.name, `Articolo ${line && line.id}`);

    items.push(
      compactObject({
        code: pickFirst(line && line.sku),
        name: variantTitle && variantTitle.toLowerCase() !== "default title" ? `${title} - ${variantTitle}` : title,
        qty: quantity,
        net_price: netPrice,
        discount: 0,
        vat: {
          id: resolveVatId(vatRate)
        }
      })
    );
  }

  for (const shippingLine of safeArray(order && order.shipping_lines)) {
    const vatRate = getLineVatRate(shippingLine, fallbackTaxLines);
    const grossAmount = parseDecimal(shippingLine && shippingLine.price, 0);

    if (grossAmount <= 0) {
      continue;
    }

    items.push({
      name: `Spedizione${shippingLine && shippingLine.title ? ` - ${shippingLine.title}` : ""}`,
      qty: 1,
      net_price: taxesIncluded ? grossToNet(grossAmount, vatRate) : roundCurrency(grossAmount),
      discount: 0,
      vat: {
        id: resolveVatId(vatRate)
      }
    });
  }

  return items;
};

const buildPaymentsList = (order, invoiceDate) => {
  const paymentAccountId = parseNumericId(FIC_PAYMENT_ACCOUNT_ID);

  if (!paymentAccountId) {
    return [];
  }

  const totalPrice = roundCurrency(parseDecimal(order && order.total_price, 0));

  if (totalPrice <= 0) {
    return [];
  }

  return [
    {
      amount: totalPrice,
      due_date: invoiceDate,
      paid_date: invoiceDate,
      status: "paid",
      payment_account: {
        id: paymentAccountId
      }
    }
  ];
};

const buildInvoicePayload = (order, clientId) => {
  const invoiceDate = toIsoDate(order && (order.processed_at || order.created_at));
  const { entity } = buildOrderEntity(order);
  const itemsList = buildItemsList(order);
  const paymentsList = buildPaymentsList(order, invoiceDate);
  const currencyCode = pickFirst(order && order.currency, "EUR");

  if (clientId) {
    entity.id = clientId;
  }

  if (!Array.isArray(itemsList) || itemsList.length === 0) {
    throw new Error("L'ordine Shopify non contiene righe fatturabili.");
  }

  const payload = {
    data: compactObject({
      type: "invoice",
      entity,
      date: invoiceDate,
      subject: `Ordine Shopify ${pickFirst(order && order.name, order && order.order_number, order && order.id)}`,
      visible_subject: `Ordine ${pickFirst(order && order.name, order && order.order_number, order && order.id)}`,
      currency: {
        id: currencyCode
      },
      language: {
        code: FIC_DOCUMENT_LANGUAGE_CODE,
        name: FIC_DOCUMENT_LANGUAGE_NAME
      },
      items_list: itemsList,
      payments_list: paymentsList.length > 0 ? paymentsList : undefined,
      payment_method: parseNumericId(FIC_PAYMENT_METHOD_ID)
        ? {
            id: parseNumericId(FIC_PAYMENT_METHOD_ID)
          }
        : undefined,
      show_payment_method: Boolean(parseNumericId(FIC_PAYMENT_METHOD_ID)),
      template: parseNumericId(FIC_TEMPLATE_ID)
        ? {
            id: parseNumericId(FIC_TEMPLATE_ID)
          }
        : undefined,
      e_invoice: FIC_ENABLE_E_INVOICE || undefined,
      ei_data: FIC_ENABLE_E_INVOICE && FIC_EI_PAYMENT_METHOD
        ? {
            payment_method: FIC_EI_PAYMENT_METHOD
          }
        : undefined
    })
  };

  return payload;
};

const buildClientPayload = (order) => {
  const { entity, clientType } = buildOrderEntity(order);

  return {
    data: compactObject({
      type: clientType,
      name: entity.name,
      vat_number: entity.vat_number,
      tax_code: entity.tax_code,
      ei_code: entity.ei_code,
      email: entity.email,
      certified_email: entity.certified_email,
      phone: entity.phone,
      address_street: entity.address_street,
      address_postal_code: entity.address_postal_code,
      address_city: entity.address_city,
      address_province: entity.address_province,
      address_extra: entity.address_extra,
      country: entity.country,
      country_iso: entity.country_iso
    })
  };
};

const isClientAlreadyPresentError = (error) => {
  if (!error || (error.statusCode !== 409 && error.statusCode !== 422)) {
    return false;
  }

  const details = JSON.stringify(error.details || {}).toLowerCase();

  return (
    details.includes("already") ||
    details.includes("exist") ||
    details.includes("unique") ||
    details.includes("duplic")
  );
};

const maybeCreateClient = async (order) => {
  if (!FIC_CREATE_CLIENTS) {
    return null;
  }

  try {
    const payload = await ficRequest(`/c/${FIC_COMPANY_ID}/entities/clients`, {
      method: "POST",
      body: JSON.stringify(buildClientPayload(order))
    });

    return payload && payload.data && payload.data.id ? payload.data.id : null;
  } catch (error) {
    const details = JSON.stringify(error.details || {});

    if (isClientAlreadyPresentError(error)) {
      console.warn("Creazione cliente saltata per vincolo di unicita.", details);
      return null;
    }

    throw error;
  }
};

const createInvoice = async (order, clientId) => {
  const payload = buildInvoicePayload(order, clientId);
  const response = await ficRequest(`/c/${FIC_COMPANY_ID}/issued_documents`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const invoice = response && response.data ? response.data : {};
  const invoiceId = pickFirst(invoice.id, invoice.document_id);
  const invoiceNumber = pickFirst(invoice.number, invoice.numeration, invoice.id);

  if (!invoiceId) {
    const error = new Error("Fatture in Cloud non ha restituito l'id della fattura.");
    error.details = response;
    throw error;
  }

  return {
    id: invoiceId,
    number: invoiceNumber,
    raw: invoice
  };
};

const processOrderPaid = async (orderId) => {
  const order = await fetchShopifyOrder(orderId);
  const orderGid = buildShopifyOrderGid(order.id);
  const existingInvoiceId = await getOrderInvoiceMetafield(orderGid);

  if (existingInvoiceId) {
    return {
      ok: true,
      created: false,
      reason: "already_synced",
      orderId: String(order.id),
      orderName: order.name,
      invoiceId: existingInvoiceId
    };
  }

  const clientId = await maybeCreateClient(order);
  const invoice = await createInvoice(order, clientId);

  await setOrderInvoiceMetafields(orderGid, invoice.id, invoice.number);

  return {
    ok: true,
    created: true,
    orderId: String(order.id),
    orderName: order.name,
    invoiceId: String(invoice.id),
    invoiceNumber: String(invoice.number || "")
  };
};

exports.handler = async (event) => {
  const missingConfig = getMissingConfig();

  if (event.httpMethod === "GET") {
    return json(200, {
      ok: missingConfig.length === 0,
      service: "shopify-fattureincloud-orders-paid",
      configured: missingConfig.length === 0,
      missing: missingConfig,
      webhookPath: "/api/shopify/orders-paid"
    });
  }

  if (event.httpMethod !== "POST") {
    return json(405, {
      ok: false,
      code: "method_not_allowed",
      message: "Metodo non consentito."
    });
  }

  if (missingConfig.length > 0) {
    return json(500, {
      ok: false,
      code: "missing_config",
      message: "Configurazione incompleta.",
      missing: missingConfig
    });
  }

  const rawBody = getRawBodyBuffer(event);
  const signature = getHeader(event, "x-shopify-hmac-sha256");
  const topic = String(getHeader(event, "x-shopify-topic") || "").trim();
  const webhookId = String(getHeader(event, "x-shopify-webhook-id") || "").trim();

  if (!verifyShopifyHmac(rawBody, signature)) {
    return json(401, {
      ok: false,
      code: "invalid_signature",
      message: "Firma webhook Shopify non valida."
    });
  }

  if (topic !== "orders/paid") {
    return json(202, {
      ok: true,
      ignored: true,
      topic
    });
  }

  try {
    const payload = parseJsonBuffer(rawBody);
    const orderId = payload && payload.id ? payload.id : null;

    if (!orderId) {
      return json(400, {
        ok: false,
        code: "missing_order_id",
        message: "Il webhook non contiene l'id ordine Shopify."
      });
    }

    const result = await processOrderPaid(orderId);

    return json(200, {
      ok: true,
      topic,
      webhookId,
      result
    });
  } catch (error) {
    console.error("Errore sync Shopify -> Fatture in Cloud", {
      topic,
      webhookId,
      message: error.message,
      details: error.details || null
    });

    return json(500, {
      ok: false,
      code: "sync_failed",
      message: error.message,
      details: error.details || null
    });
  }
};
