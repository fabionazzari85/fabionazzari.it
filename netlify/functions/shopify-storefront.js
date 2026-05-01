"use strict";

const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-04";
const STORE_DOMAIN = (process.env.SHOPIFY_STORE_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || "";

const MONEY_FIELDS = `
  amount
  currencyCode
`;

const IMAGE_FIELDS = `
  url
  altText
`;

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      ${MONEY_FIELDS}
    }
    totalAmount {
      ${MONEY_FIELDS}
    }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          price {
            ${MONEY_FIELDS}
          }
          compareAtPrice {
            ${MONEY_FIELDS}
          }
          image {
            ${IMAGE_FIELDS}
          }
          product {
            id
            title
            handle
            featuredImage {
              ${IMAGE_FIELDS}
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  tags
  featuredImage {
    ${IMAGE_FIELDS}
  }
  images(first: 6) {
    nodes {
      ${IMAGE_FIELDS}
    }
  }
  variants(first: 10) {
    nodes {
      id
      title
      availableForSale
      price {
        ${MONEY_FIELDS}
      }
      compareAtPrice {
        ${MONEY_FIELDS}
      }
      image {
        ${IMAGE_FIELDS}
      }
    }
  }
`;

const CATALOG_QUERY = `
  query StorefrontCatalog($first: Int!) {
    products(first: $first) {
      nodes {
        ${PRODUCT_FIELDS}
      }
    }
  }
`;

const CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FIELDS}
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
      warnings {
        code
        message
      }
    }
  }
`;

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const json = (statusCode, body) => ({
  statusCode,
  headers: responseHeaders,
  body: JSON.stringify(body)
});

const isConfigured = () => Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);

const readAction = (event, payload) => {
  if (event.httpMethod === "GET") {
    return event.queryStringParameters && event.queryStringParameters.action ? event.queryStringParameters.action : "status";
  }
  return payload && payload.action ? payload.action : "";
};

const parseBody = (event) => {
  if (!event.body) {
    return {};
  }
  try {
    return JSON.parse(event.body);
  } catch (error) {
    throw new Error("Body JSON non valido.");
  }
};

const getMutationCart = (result, key) => {
  const payload = result && result[key];
  if (!payload) {
    throw new Error("Risposta Shopify incompleta.");
  }
  const messages = [
    ...(payload.userErrors || []).map((item) => item.message),
    ...(payload.warnings || []).map((item) => item.message)
  ].filter(Boolean);
  if (messages.length) {
    throw new Error(messages.join(" "));
  }
  return payload.cart;
};

const storefrontRequest = async (query, variables = {}) => {
  if (!isConfigured()) {
    throw new Error("Shopify non e configurato.");
  }
  const response = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
    },
    body: JSON.stringify({ query, variables })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.errors && data.errors[0] ? data.errors[0].message : "Shopify ha risposto con un errore.");
  }
  if (data.errors && data.errors.length) {
    throw new Error(data.errors[0].message || "Errore Storefront API.");
  }
  return data.data || {};
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: responseHeaders, body: "" };
  }
  try {
    const payload = event.httpMethod === "POST" ? parseBody(event) : {};
    const action = readAction(event, payload);

    if (action === "status") {
      return json(200, {
        configured: isConfigured(),
        apiVersion: API_VERSION
      });
    }

    if (!isConfigured()) {
      return json(503, {
        error: "Shopify non configurato. Imposta SHOPIFY_STORE_DOMAIN e SHOPIFY_STOREFRONT_TOKEN."
      });
    }

    if (action === "catalog") {
      const first = Math.min(Math.max(Number(payload.first) || 24, 1), 50);
      const data = await storefrontRequest(CATALOG_QUERY, { first });
      return json(200, {
        products: data.products && Array.isArray(data.products.nodes) ? data.products.nodes : []
      });
    }

    if (action === "cart") {
      if (!payload.cartId) {
        return json(400, { error: "cartId mancante." });
      }
      const data = await storefrontRequest(CART_QUERY, { cartId: payload.cartId });
      return json(200, { cart: data.cart || null });
    }

    if (action === "cartCreate") {
      const data = await storefrontRequest(CART_CREATE_MUTATION, {
        lines: Array.isArray(payload.lines) ? payload.lines : []
      });
      return json(200, {
        cart: getMutationCart(data, "cartCreate")
      });
    }

    if (action === "cartLinesAdd") {
      if (!payload.cartId) {
        return json(400, { error: "cartId mancante." });
      }
      const data = await storefrontRequest(CART_LINES_ADD_MUTATION, {
        cartId: payload.cartId,
        lines: Array.isArray(payload.lines) ? payload.lines : []
      });
      return json(200, {
        cart: getMutationCart(data, "cartLinesAdd")
      });
    }

    if (action === "cartLinesUpdate") {
      if (!payload.cartId) {
        return json(400, { error: "cartId mancante." });
      }
      const data = await storefrontRequest(CART_LINES_UPDATE_MUTATION, {
        cartId: payload.cartId,
        lines: Array.isArray(payload.lines) ? payload.lines : []
      });
      return json(200, {
        cart: getMutationCart(data, "cartLinesUpdate")
      });
    }

    if (action === "cartLinesRemove") {
      if (!payload.cartId) {
        return json(400, { error: "cartId mancante." });
      }
      const data = await storefrontRequest(CART_LINES_REMOVE_MUTATION, {
        cartId: payload.cartId,
        lineIds: Array.isArray(payload.lineIds) ? payload.lineIds : []
      });
      return json(200, {
        cart: getMutationCart(data, "cartLinesRemove")
      });
    }

    return json(400, {
      error: `Azione non supportata: ${action || "sconosciuta"}.`
    });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Errore interno Shopify storefront."
    });
  }
};
