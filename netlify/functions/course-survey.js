"use strict";

const { getStore } = require("@netlify/blobs");

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const json = (statusCode, body) => ({
  statusCode,
  headers: responseHeaders,
  body: JSON.stringify(body)
});

const requiredFields = [
  "profilo",
  "interesse_corsi",
  "argomento",
  "formato_preferito",
  "durata_preferita",
  "budget_live",
  "budget_registrato"
];

const hasValue = (value) => String(value || "").trim().length > 0;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, message: "Metodo non consentito." });
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    return json(400, { ok: false, message: "Payload non valido." });
  }

  const answers = payload.answers && typeof payload.answers === "object" ? payload.answers : {};
  const missingFields = requiredFields.filter((field) => !hasValue(answers[field]));

  if (answers.formato_preferito === "Live" && !hasValue(answers.preferenza_orario_live)) {
    missingFields.push("preferenza_orario_live");
  }
  if (answers.aggiornamenti === "Si" && !hasValue(answers.email)) {
    missingFields.push("email");
  }
  if (
    answers.profilo === "Professionista" &&
    answers.aggiornamenti === "Si" &&
    !hasValue(answers.stato_senza_glutine)
  ) {
    missingFields.push("stato_senza_glutine");
  }

  if (missingFields.length) {
    return json(422, {
      ok: false,
      message: "Compila i campi obbligatori.",
      errors: missingFields
    });
  }

  const submittedAt = new Date().toISOString();
  const id = `${submittedAt.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id,
    submitted_at: submittedAt,
    source: "corsi-online",
    page_url: payload.page_url || "",
    answers
  };

  try {
    const store = getStore("corsi-online");
    await store.setJSON(`${id}.json`, record);
  } catch (error) {
    console.error("Course survey blob write failed", error);
    return json(500, { ok: false, message: "Non sono riuscito a salvare la risposta." });
  }

  console.info("Course survey received", {
    id,
    profilo: answers.profilo,
    formato_preferito: answers.formato_preferito,
    email: answers.email || null
  });

  return json(200, { ok: true, id, message: "Risposta ricevuta." });
};
