import {jsonResponse, readBioData} from "./_bio-data.mjs";

export default async (request) => {
  if (request.method !== "GET") {
    return jsonResponse(
      {
        ok: false,
        code: "method_not_allowed",
        message: "Metodo non consentito."
      },
      {status: 405}
    );
  }

  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") === "en" ? "en" : "it";
    const data = await readBioData();

    return jsonResponse(
      {
        ok: true,
        locale,
        updatedAt: data.updatedAt,
        data: data.locales[locale]
      },
      {cache: "public, max-age=60, s-maxage=60, stale-while-revalidate=600"}
    );
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        code: "bio_public_unavailable",
        message: "Non sono riuscito a leggere i link pubblici."
      },
      {status: 500}
    );
  }
};
