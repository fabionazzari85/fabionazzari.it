import {
  createAdminToken,
  isAdminConfigured,
  jsonResponse,
  verifyAdminPassword
} from "./_bio-data.mjs";

export default async (request) => {
  if (request.method !== "POST") {
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

  if (!verifyAdminPassword(payload?.password)) {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_credentials",
        message: "Password non valida."
      },
      {status: 401}
    );
  }

  const session = createAdminToken();
  return jsonResponse({
    ok: true,
    token: session.token,
    expiresAt: session.expiresAt
  });
};
