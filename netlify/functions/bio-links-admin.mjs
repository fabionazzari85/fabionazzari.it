import {
  getBearerToken,
  isAdminConfigured,
  jsonResponse,
  readBioData,
  validateAdminToken,
  writeBioData
} from "./_bio-data.mjs";

const unauthorizedResponse = (code = "unauthorized", status = 401) =>
  jsonResponse(
    {
      ok: false,
      code,
      message: "Accesso riservato."
    },
    {status}
  );

export default async (request) => {
  if (!["GET", "PUT"].includes(request.method)) {
    return jsonResponse(
      {
        ok: false,
        code: "method_not_allowed",
        message: "Metodo non consentito."
      },
      {status: 405}
    );
  }

  if (!isAdminConfigured()) {
    return jsonResponse(
      {
        ok: false,
        code: "admin_not_configured",
        message:
          "Configura BIO_ADMIN_PASSWORD e BIO_ADMIN_SESSION_SECRET nelle environment variables di Netlify."
      },
      {status: 503}
    );
  }

  const token = getBearerToken(request);
  const validation = validateAdminToken(token);

  if (!validation.ok) {
    return unauthorizedResponse(validation.code, 401);
  }

  if (request.method === "GET") {
    try {
      const data = await readBioData();
      return jsonResponse({
        ok: true,
        data
      });
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          code: "bio_admin_read_failed",
          message: "Non sono riuscito a leggere i link."
        },
        {status: 500}
      );
    }
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_json",
        message: "Payload non valido."
      },
      {status: 400}
    );
  }

  try {
    const data = await writeBioData(payload?.data || payload || {});
    return jsonResponse({
      ok: true,
      savedAt: data.updatedAt,
      data
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        code: "bio_admin_write_failed",
        message: "Non sono riuscito a salvare i link."
      },
      {status: 500}
    );
  }
};
