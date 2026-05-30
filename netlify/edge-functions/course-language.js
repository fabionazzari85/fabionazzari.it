function contactOptOutScript(isEnglish) {
  const optOutText = isEnglish
    ? "I do not want to receive updates about future online courses."
    : "Non voglio ricevere aggiornamenti sui corsi online futuri.";
  const professionalValue = isEnglish ? "Professional" : "Professionista";
  const enthusiastValue = isEnglish ? "Enthusiast" : "Appassionato";

  return `<script>
(() => {
  const optOutText = ${JSON.stringify(optOutText)};
  const professionalValue = ${JSON.stringify(professionalValue)};
  const enthusiastValue = ${JSON.stringify(enthusiastValue)};
  if (typeof form === "undefined" || typeof appassionatoExtra === "undefined" || typeof liveExtra === "undefined" || typeof contattiExtra === "undefined" || typeof professionistaExtra === "undefined" || typeof aggiornamenti === "undefined" || typeof email === "undefined") return;

  aggiornamenti.name = "no_aggiornamenti";
  aggiornamenti.value = "Si";
  const labelText = aggiornamenti.closest("label")?.querySelector("span");
  if (labelText) labelText.textContent = optOutText;

  syncConditionalFields = function syncConditionalFields() {
    const profilo = selected("profilo");
    const formato = selected("formato_preferito");
    const noUpdates = aggiornamenti.checked;

    appassionatoExtra.classList.toggle("hidden", profilo !== enthusiastValue);
    liveExtra.classList.toggle("hidden", formato !== "Live");
    contattiExtra.classList.toggle("hidden", noUpdates);
    professionistaExtra.classList.toggle("hidden", noUpdates || profilo !== professionalValue);

    email.required = !noUpdates;
    setRequired('input[name="preferenza_orario_live"]', formato === "Live");
    setRequired('input[name="stato_senza_glutine"]', !noUpdates && profilo === professionalValue);
  };

  syncConditionalFields();
})();
</script>`;
}

export default async function courseLanguage(request, context) {
  const url = new URL(request.url);
  const isItalianCoursePage = url.pathname === "/corsi-online" || url.pathname === "/corsi-online/";
  const isEnglishCoursePage = url.pathname === "/en/corsi-online" || url.pathname === "/en/corsi-online/";

  if (!isItalianCoursePage && !isEnglishCoursePage) {
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return;
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  const firstLanguage = acceptLanguage.split(",")[0].trim().toLowerCase();
  const primaryLanguage = firstLanguage.split("-")[0];

  if (isItalianCoursePage && primaryLanguage && primaryLanguage !== "it") {
    return Response.redirect(new URL("/en/corsi-online/", request.url), 302);
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const script = contactOptOutScript(isEnglishCoursePage);
  const bodyClose = "</body>";
  const updatedHtml = html.includes(bodyClose)
    ? html.replace(bodyClose, `${script}\n${bodyClose}`)
    : `${html}\n${script}`;

  return new Response(updatedHtml, response);
}

export const config = {
  path: ["/corsi-online", "/corsi-online/", "/en/corsi-online", "/en/corsi-online/"],
};
