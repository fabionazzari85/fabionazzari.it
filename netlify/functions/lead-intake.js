"use strict";

const DASHBOARD_LEADS_ENDPOINT = process.env.DASHBOARD_LEADS_ENDPOINT || "https://dashboard.fabionazzari.it/api/webhook/site-lead";
const DASHBOARD_LEADS_TOKEN = process.env.DASHBOARD_LEADS_TOKEN || "";
const LEAD_SCHEMA_VERSION = "site_lead.v1";

const REQUEST_TYPES = new Set([
  "ordine_b2b",
  "rivenditore",
  "consulenza",
  "corso_formazione",
  "shop_online",
  "collaborazione",
  "generica"
]);

const ACTIVITY_TYPES = new Set([
  "pasticceria",
  "ristorante",
  "hotel",
  "negozio",
  "laboratorio",
  "azienda",
  "privato",
  "altro"
]);

const VOLUME_TYPES = new Set(["basso", "medio", "alto"]);

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const json = (statusCode, body) => ({
  statusCode,
  headers: responseHeaders,
  body: JSON.stringify(body)
});

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

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const normalizePhone = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }
  const hasPlus = rawValue.startsWith("+");
  const digits = rawValue.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return `${hasPlus ? "+" : ""}${digits}`;
};

const normalizeWebsite = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }
  return /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;
};

const normalizeInstagram = (value) => String(value || "").trim().replace(/^@+/, "").toLowerCase();

const getLeadSourcePayload = (payload = {}) => {
  if (payload && typeof payload === "object" && payload.lead && typeof payload.lead === "object") {
    return payload.lead;
  }
  return payload || {};
};

const getLeadContextPayload = (payload = {}) => {
  if (payload && typeof payload === "object" && payload.context && typeof payload.context === "object") {
    return payload.context;
  }
  return payload || {};
};

const normalizeLead = (payload = {}) => {
  const leadPayload = getLeadSourcePayload(payload);
  const contextPayload = getLeadContextPayload(payload);
  return {
    nome: String(leadPayload.nome || "").trim(),
    cognome: String(leadPayload.cognome || "").trim(),
    azienda_attivita: String(leadPayload.azienda_attivita || "").trim(),
    email: normalizeEmail(leadPayload.email),
    telefono: normalizePhone(leadPayload.telefono),
    citta: String(leadPayload.citta || "").trim(),
    country: String(leadPayload.country || "").trim() || "Italia",
    indirizzo: String(leadPayload.indirizzo || "").trim(),
    sito_web: normalizeWebsite(leadPayload.sito_web),
    instagram: normalizeInstagram(leadPayload.instagram),
    tipo_richiesta: String(leadPayload.tipo_richiesta || "").trim(),
    tipo_attivita: String(leadPayload.tipo_attivita || "").trim(),
    volume_interesse: String(leadPayload.volume_interesse || "").trim(),
    messaggio: String(leadPayload.messaggio || "").trim(),
    consenso_contatto: Boolean(leadPayload.consenso_contatto),
    source_page: String(contextPayload.source_page || payload.source_page || "").trim() || "contatti",
    source_cta: String(contextPayload.source_cta || payload.source_cta || "").trim() || "contact_form",
    form_variant: String(contextPayload.form_variant || payload.form_variant || "").trim() || "generale",
    client_segment: String(contextPayload.client_segment || payload.client_segment || "").trim(),
    product_line: String(contextPayload.product_line || payload.product_line || "").trim(),
    page_url: String(contextPayload.page_url || payload.page_url || "").trim(),
    page_path: String(contextPayload.page_path || payload.page_path || "").trim()
  };
};

const buildDashboardLeadPayload = (lead, timestamp, rawPayload = {}) => ({
  schema_version: rawPayload.schema_version || LEAD_SCHEMA_VERSION,
  submitted_at: rawPayload.submitted_at || timestamp,
  source: "sito",
  status: "nuovo",
  lead: {
    nome: lead.nome,
    cognome: lead.cognome,
    azienda_attivita: lead.azienda_attivita,
    email: lead.email,
    telefono: lead.telefono,
    citta: lead.citta,
    country: lead.country,
    indirizzo: lead.indirizzo,
    sito_web: lead.sito_web,
    instagram: lead.instagram,
    tipo_richiesta: lead.tipo_richiesta,
    tipo_attivita: lead.tipo_attivita,
    volume_interesse: lead.volume_interesse,
    messaggio: lead.messaggio,
    consenso_contatto: lead.consenso_contatto
  },
  context: {
    source_page: lead.source_page,
    source_cta: lead.source_cta,
    form_variant: lead.form_variant,
    client_segment: lead.client_segment,
    product_line: lead.product_line,
    page_url: lead.page_url,
    page_path: lead.page_path
  },
  dedupe_keys: {
    email: lead.email,
    telefono: lead.telefono
  },
  operational_hints: {
    can_map: Boolean(lead.citta || lead.indirizzo),
    candidate_for_follow_up: true,
    candidate_for_shopify_link: true
  }
});

const validateLead = (lead) => {
  const errors = {};

  if (!lead.nome) {
    errors.nome = "Inserisci il nome.";
  }
  if (!lead.cognome) {
    errors.cognome = "Inserisci il cognome.";
  }
  if (!lead.azienda_attivita) {
    errors.azienda_attivita = "Inserisci azienda o attivita.";
  }
  if (!lead.email) {
    errors.email = "Inserisci l'email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    errors.email = "Controlla il formato dell'email.";
  }
  if (!lead.telefono) {
    errors.telefono = "Inserisci il telefono.";
  } else if (lead.telefono.replace(/\D/g, "").length < 6) {
    errors.telefono = "Inserisci un telefono valido.";
  }
  if (!lead.citta) {
    errors.citta = "Inserisci la citta.";
  }
  if (!lead.country) {
    errors.country = "Inserisci il paese.";
  }
  if (!lead.tipo_richiesta || !REQUEST_TYPES.has(lead.tipo_richiesta)) {
    errors.tipo_richiesta = "Seleziona il tipo di richiesta.";
  }
  if (lead.tipo_attivita && !ACTIVITY_TYPES.has(lead.tipo_attivita)) {
    errors.tipo_attivita = "Tipo attivita non valido.";
  }
  if (lead.volume_interesse && !VOLUME_TYPES.has(lead.volume_interesse)) {
    errors.volume_interesse = "Volume interesse non valido.";
  }
  if (lead.sito_web) {
    try {
      new URL(lead.sito_web);
    } catch (error) {
      errors.sito_web = "Controlla il sito web.";
    }
  }
  if (!lead.consenso_contatto) {
    errors.consenso_contatto = "Il consenso e necessario per ricontattarti.";
  }

  return errors;
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, {
      ok: false,
      code: "method_not_allowed",
      message: "Metodo non consentito."
    });
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    return json(400, {
      ok: false,
      code: "invalid_json",
      message: "Payload non valido."
    });
  }

  const lead = normalizeLead(payload);
  const errors = validateLead(lead);

  if (Object.keys(errors).length) {
    return json(422, {
      ok: false,
      code: "validation_error",
      message: "Controlla i campi evidenziati e riprova.",
      errors
    });
  }

  const timestamp = new Date().toISOString();
  const normalizedLead = buildDashboardLeadPayload(lead, timestamp, payload);

  if (!DASHBOARD_LEADS_ENDPOINT) {
    return json(503, {
      ok: false,
      code: "dashboard_not_configured",
      message: "Lead validato, ma collegamento dashboard non ancora configurato."
    });
  }

  if (!DASHBOARD_LEADS_TOKEN) {
    return json(503, {
      ok: false,
      code: "dashboard_token_missing",
      message: "Lead validato, ma token dashboard non configurato."
    });
  }

  try {
    const response = await fetch(DASHBOARD_LEADS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DASHBOARD_LEADS_TOKEN}`,
        "x-webhook-secret": DASHBOARD_LEADS_TOKEN
      },
      body: JSON.stringify(normalizedLead)
    });

    const responseData = await readJson(response);

    if (!response.ok) {
      return json(response.status, {
        ok: false,
        code: responseData.code || "dashboard_error",
        message: responseData.message || "La dashboard non ha accettato il lead.",
        errors: responseData.errors || null
      });
    }

    return json(200, {
      ok: true,
      code: responseData.code || "success",
      message: responseData.message || "Lead inviato correttamente.",
      lead_id: responseData.lead_id || responseData.id || null,
      match_status: responseData.match_status || null
    });
  } catch (error) {
    return json(502, {
      ok: false,
      code: "dashboard_unreachable",
      message: "Non sono riuscito a collegarmi alla dashboard."
    });
  }
};
