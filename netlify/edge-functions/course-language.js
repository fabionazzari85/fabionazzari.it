export default async function courseLanguage(request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return;
  }

  const url = new URL(request.url);
  const isCoursePage = url.pathname === "/corsi-online" || url.pathname === "/corsi-online/";

  if (!isCoursePage) {
    return;
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  const firstLanguage = acceptLanguage.split(",")[0].trim().toLowerCase();
  const primaryLanguage = firstLanguage.split("-")[0];

  if (primaryLanguage && primaryLanguage !== "it") {
    return Response.redirect(new URL("/en/corsi-online/", request.url), 302);
  }
}

export const config = {
  path: ["/corsi-online", "/corsi-online/"],
};
