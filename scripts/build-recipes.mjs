import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishedRecipeContents as localPublishedRecipeContents } from "../data/recipes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const siteUrl = "https://www.fabionazzari.it";
const dashboardApiBase = process.env.DASHBOARD_PUBLIC_API_BASE || "https://dashboard.fabionazzari.it";
const dashboardFetchTimeoutMs = Number(process.env.DASHBOARD_PUBLIC_API_TIMEOUT_MS || 5000);
const trackingConfig = {
  ga4MeasurementId: "G-PLXENG9EG1",
  clarityProjectId: "wkcqngt24y",
  metaPixelId: "3801594386649106",
  googleAdsId: "AW-2988631615"
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getPreloadImageHref = (href = "") => {
  if (!href) return "/assets/photos/fabio-ritratto-grissini.jpeg";
  if (href.startsWith(siteUrl)) return href.slice(siteUrl.length) || "/";
  return href;
};
const absoluteUrl = (href = "") => {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  return `${siteUrl}${href.startsWith("/") ? href : `/${href}`}`;
};

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item != null && String(item).trim() !== "");
  if (value == null || value === "") return [];
  return [value];
};

const fallbackImageForContent = (content = {}) =>
  content.type === "recipe" ? "/assets/photos/crostata-fragole.jpeg" : "/assets/photos/fabio-laboratorio.jpeg";

const getContentImage = (content = {}) => content.featuredImage || fallbackImageForContent(content);

const normalizeRecipeContent = (content = {}) => {
  const type = content.type === "blog_article" ? "technical_article" : content.type || "guide";
  const enabledSections = content.enabledSections || content.enabled_sections || content.extraFields?.enabledSections || {};
  const normalized = {
    ...content,
    id: content.id || content.slug,
    title: content.title || "Contenuto senza titolo",
    slug: content.slug || content.id,
    subtitle: content.subtitle || "",
    excerpt: content.excerpt || content.subtitle || "",
    language: content.language || "Italiano",
    category: content.category || "Pasticceria senza glutine",
    tags: asArray(content.tags),
    type,
    status: content.status || "published",
    featuredImage: content.featuredImage || null,
    imageAlt: content.imageAlt || content.title || "Fabio Nazzari - contenuto senza glutine",
    prepTime: content.prepTime || "",
    cookTime: content.cookTime || "",
    totalTime: content.totalTime || content.readTime || "",
    difficulty: content.difficulty || "",
    servings: content.servings || "",
    ingredients: asArray(content.ingredients),
    methodSteps: asArray(content.methodSteps || content.method),
    technicalNotes: asArray(content.technicalNotes),
    commonMistakes: asArray(content.commonMistakes),
    conservation: asArray(content.conservation),
    variations: asArray(content.variations),
    professionalTips: asArray(content.professionalTips),
    faq: asArray(content.faq).filter((item) => item && item.question && item.answer),
    sponsorDisclosure: content.sponsorDisclosure || "",
    recommendedProducts: asArray(content.recommendedProducts),
    seoTitle: content.seoTitle || content.title || "Blog / Ricette senza glutine | Fabio Nazzari",
    seoDescription: content.seoDescription || content.excerpt || content.subtitle || "",
    manyChatKeyword: content.manyChatKeyword || "",
    isManyChatActiveRecipe: Boolean(content.isManyChatActiveRecipe),
    ctaLabel: content.ctaLabel || "Richiedi una consulenza professionale",
    ctaHref: content.ctaHref || "https://dashboard.fabionazzari.it/apply?source=recipe_blog&intent=consulting",
    publishedAt: content.publishedAt || new Date().toISOString().slice(0, 10),
    updatedAt: content.updatedAt || content.publishedAt || new Date().toISOString().slice(0, 10),
    readTime: content.readTime || "",
    intro: content.intro || "",
    keyTakeaways: asArray(content.keyTakeaways),
    articleSections: asArray(content.articleSections).filter((item) => item && (item.title || item.body)),
    conclusion: content.conclusion || "",
    secondaryCtaLabel: content.secondaryCtaLabel || "",
    secondaryCtaHref: content.secondaryCtaHref || "",
    blocks: asArray(content.blocks).filter((item) => item && item.type),
    enabledSections,
    extraFields: content.extraFields || {}
  };

  return normalized;
};

const loadRecipeContents = async () => {
  const localItems = localPublishedRecipeContents.map(normalizeRecipeContent);
  if (process.env.DASHBOARD_RECIPES_SOURCE === "local") {
    return { items: localItems, source: "local" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), dashboardFetchTimeoutMs);

  try {
    const response = await fetch(`${dashboardApiBase.replace(/\/+$/, "")}/api/public/recipes`, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Dashboard API returned ${response.status}`);
    }
    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items.map(normalizeRecipeContent).filter((item) => item.status === "published") : [];
    if (!items.length) {
      throw new Error("Dashboard API returned no published recipes");
    }
    return { items, source: dashboardApiBase };
  } catch (error) {
    console.warn(`[recipes] Using local fallback: ${error.message}`);
    return { items: localItems, source: "local fallback" };
  } finally {
    clearTimeout(timeout);
  }
};

const isoDurationToText = (duration = "") => {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?$/i.exec(duration);
  if (!match) return duration;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  return [hours ? `${hours} h` : "", minutes ? `${minutes} min` : ""].filter(Boolean).join(" ");
};

const recipeInstructions = (steps) =>
  steps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    text: step
  }));

const articleStructuredData = (content) => ({
  "@context": "https://schema.org",
  "@type": content.type === "guide" ? "BlogPosting" : "Article",
  headline: content.title,
  description: content.seoDescription || content.excerpt,
  image: [absoluteUrl(getContentImage(content))],
  author: {
    "@type": "Person",
    name: "Fabio Nazzari"
  },
  publisher: {
    "@type": "Organization",
    name: "Fabio Nazzari"
  },
  datePublished: content.publishedAt,
  dateModified: content.updatedAt,
  mainEntityOfPage: absoluteUrl(content.canonicalPath || `/ricette/${content.slug}`)
});

const recipeStructuredData = (content) => ({
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: content.title,
  description: content.seoDescription || content.excerpt,
  image: [absoluteUrl(getContentImage(content))],
  author: {
    "@type": "Person",
    name: "Fabio Nazzari"
  },
  datePublished: content.publishedAt,
  dateModified: content.updatedAt,
  prepTime: content.prepTime,
  cookTime: content.cookTime,
  totalTime: content.totalTime,
  recipeYield: content.servings,
  recipeIngredient: content.ingredients,
  recipeInstructions: recipeInstructions(content.methodSteps),
  recipeCategory: content.category
});

const baseHead = ({ title, description, canonical, image, type = "website", structuredData }) => `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="${escapeHtml(type)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:locale" content="it_IT">
  ${image ? `<meta property="og:image" content="${escapeHtml(absoluteUrl(image))}">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="image" href="${escapeHtml(getPreloadImageHref(image || "/assets/photos/fabio-ritratto-grissini.jpeg"))}">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
  <style>
    * { font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    :root { --cream:#FAF8F5; --paper:#F5F3EF; --ink:#1A1A18; --muted:#6b6257; --accent:#8B5E3C; --accent-soft:#E8DED1; }
    body { margin:0; background:var(--cream); color:var(--ink); line-height:1.65; }
    body::before { content:''; position:fixed; inset:0; background:radial-gradient(circle at top right, rgba(160,144,112,.16), transparent 34%), radial-gradient(circle at bottom left, rgba(46,205,176,.08), transparent 28%), linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); pointer-events:none; z-index:-1; }
    h1,h2,h3 { font-weight:700; letter-spacing:-.05em; line-height:.98; }
    .section-kicker { text-transform:uppercase; letter-spacing:.22em; font-size:.72rem; font-weight:700; color:var(--accent); }
    .editorial-panel { border-radius:30px; border:1px solid rgba(26,26,24,.08); background:rgba(255,255,255,.84); padding:clamp(22px,4vw,36px); box-shadow:0 24px 55px rgba(26,26,24,.07); backdrop-filter:blur(16px); }
    .pill { display:inline-flex; align-items:center; border:1px solid rgba(26,26,24,.1); border-radius:999px; padding:.45rem .7rem; background:rgba(255,255,255,.75); font-size:.68rem; font-weight:700; letter-spacing:.13em; text-transform:uppercase; color:#3D3B35; }
    .btn { display:inline-flex; justify-content:center; align-items:center; border-radius:999px; padding:.9rem 1.2rem; background:var(--ink); color:white; font-size:.74rem; font-weight:700; text-transform:uppercase; letter-spacing:.15em; transition:.2s ease; }
    .btn:hover { background:var(--accent); }
    .nav-link { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; color:#4b4540; }
    .nav-link:hover { color:var(--accent); }
    .recipe-prose h2 { margin-top:3rem; margin-bottom:1rem; font-size:clamp(1.8rem,5vw,2.7rem); }
    .recipe-prose h3 { margin-top:2rem; margin-bottom:.7rem; font-size:1.2rem; letter-spacing:-.03em; }
    .recipe-prose p, .recipe-prose li { color:#4f4a44; }
    .recipe-prose ol, .recipe-prose ul { padding-left:1.25rem; }
    .recipe-prose li { margin:.55rem 0; }
    .soft-card { border:1px solid rgba(26,26,24,.08); background:#fff; border-radius:18px; padding:1.1rem; }
    .cookie-consent-overlay { position:fixed; inset:0; z-index:80; display:none; align-items:center; justify-content:center; padding:1rem; background:rgba(12,12,10,.62); backdrop-filter:blur(10px); }
    .cookie-consent-overlay.is-visible { display:flex; }
    .cookie-consent-card { width:min(100%,520px); border:1px solid rgba(255,255,255,.32); border-radius:24px; background:#fff; padding:1.35rem; box-shadow:0 28px 70px rgba(0,0,0,.28); }
    .cookie-consent-card p { color:#5f574f; }
    .cookie-consent-actions { display:flex; flex-wrap:wrap; gap:.7rem; margin-top:1.2rem; }
    .cookie-consent-actions button { min-height:44px; border-radius:999px; padding:.75rem 1rem; font-size:.72rem; font-weight:800; letter-spacing:.13em; text-transform:uppercase; }
    .cookie-consent-accept { background:#1A1A18; color:#fff; }
    .cookie-consent-reject { border:1px solid rgba(26,26,24,.14); background:#fff; color:#1A1A18; }
    @media (max-width:640px) { .editorial-panel { border-radius:24px; } .hide-mobile { display:none; } }
  </style>
</head>`;

const header = `<header class="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-md">
  <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
    <a href="/" class="flex items-center gap-3 text-[#1A1A18] hover:opacity-80">
      <span class="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-[0_12px_24px_rgba(26,26,24,0.05)]"><img src="/assets/logos/emblema-consulenza.png" alt="Fabio Nazzari" class="h-7 w-7"></span>
      <span class="hidden text-left sm:block"><span class="block text-[10px] uppercase tracking-[0.28em] text-gray-500">Fabio Nazzari</span><span class="block text-sm font-semibold text-[#1A1A18]">eccellenza senza glutine</span></span>
    </a>
    <nav class="flex flex-wrap justify-end gap-x-5 gap-y-2">
      <a class="nav-link" href="/consulenza">Consulenza</a>
      <a class="nav-link" href="/b2b">B2B</a>
      <a class="nav-link" href="/pasticceria">Pasticceria</a>
      <a class="nav-link" href="/ricette">Ricette</a>
      <a class="nav-link" href="/contatti">Contatti</a>
    </nav>
  </div>
</header>`;

const footer = `<footer class="mt-20 bg-[#2D2D2D] text-white">
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <a href="/" class="hover:opacity-80"><span class="block text-[1.95rem] font-semibold leading-none tracking-[-0.05em] lowercase">fabionazzari</span><span class="mt-3 block text-[11px] uppercase tracking-[0.26em] text-white/65">Eccellenza senza glutine</span></a>
      <nav class="flex flex-wrap gap-x-7 gap-y-3 text-[0.82rem] uppercase tracking-[0.16em] text-white/72">
        <a href="/consulenza" class="hover:text-white">Consulenza</a><a href="/b2b" class="hover:text-white">B2B</a><a href="/pasticceria" class="hover:text-white">Pasticceria</a><a href="/ricette" class="hover:text-white">Ricette</a><a href="/contatti" class="hover:text-white">Contatti</a><a href="/privacy" class="hover:text-white">Privacy</a>
      </nav>
      <div class="text-sm leading-7 text-white/72 lg:text-right"><a href="mailto:fabio@fabionazzari.it" class="block hover:text-white">fabio@fabionazzari.it</a><a href="tel:+393471176944" class="block hover:text-white">+39 347 117 6944</a><p>Nazzari Srl · P. IVA 03820600983</p></div>
    </div>
  </div>
</footer>`;

const trackingConsent = `<div id="cookie-consent-overlay" class="cookie-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
  <div class="cookie-consent-card">
    <p class="section-kicker mb-3">Privacy e analytics</p>
    <h2 id="cookie-consent-title" class="mb-3 text-2xl">Usiamo cookie tecnici e, solo se accetti, analytics e marketing.</h2>
    <p class="text-sm">GA4, Microsoft Clarity, Meta Pixel e Google Ads ci aiutano a capire quali ricette e guide sono piu utili e a misurare le campagne. Puoi accettare o rifiutare: senza scelta il banner resta visibile.</p>
    <div class="cookie-consent-actions">
      <button type="button" class="cookie-consent-accept" data-cookie-accept>Accetta tutto</button>
      <button type="button" class="cookie-consent-reject" data-cookie-reject>Rifiuta</button>
    </div>
  </div>
</div>
<script>
(function () {
  var storageKey = "fabio-nazzari-cookie-consent-v1";
  var config = ${JSON.stringify(trackingConfig)};
  var overlay = document.getElementById("cookie-consent-overlay");
  function readConsent() {
    try {
      var raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }
  function saveConsent(analytics, marketing) {
    var payload = {
      hasInteracted: true,
      preferences: { necessary: true, functional: true, analytics: analytics, marketing: marketing },
      updatedAt: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (error) {}
    return payload;
  }
  function injectScript(id, src, onload) {
    if (document.getElementById(id)) return;
    var script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    if (onload) script.onload = onload;
    document.head.appendChild(script);
  }
  function loadAnalytics() {
    if (config.ga4MeasurementId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      injectScript("ga4-" + config.ga4MeasurementId, "https://www.googletagmanager.com/gtag/js?id=" + config.ga4MeasurementId, function () {
        window.gtag("config", config.ga4MeasurementId, { anonymize_ip: true, allow_google_signals: false });
      });
    }
    if (config.clarityProjectId && !window.clarity) {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", config.clarityProjectId);
    }
  }
  function loadMarketing() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    if (config.googleAdsId) {
      window.gtag("js", new Date());
      injectScript("google-ads-" + config.googleAdsId, "https://www.googletagmanager.com/gtag/js?id=" + config.googleAdsId, function () {
        window.gtag("config", config.googleAdsId);
      });
    }
    if (config.metaPixelId && !window.fbq) {
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version="2.0";n.queue=[];
        t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
      }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", config.metaPixelId);
      window.fbq("consent", "grant");
      window.fbq("track", "PageView");
    }
  }
  function applyConsent(consent) {
    if (!consent || !consent.hasInteracted) {
      if (overlay) overlay.classList.add("is-visible");
      return;
    }
    if (overlay) overlay.classList.remove("is-visible");
    if (consent.preferences && consent.preferences.analytics) loadAnalytics();
    if (consent.preferences && consent.preferences.marketing) loadMarketing();
  }
  applyConsent(readConsent());
  document.querySelector("[data-cookie-accept]")?.addEventListener("click", function () {
    applyConsent(saveConsent(true, true));
  });
  document.querySelector("[data-cookie-reject]")?.addEventListener("click", function () {
    applyConsent(saveConsent(false, false));
  });
})();
</script>`;

const badgeList = (content) => [
  content.category,
  content.language,
  content.difficulty,
  content.totalTime ? isoDurationToText(content.totalTime) : ""
].filter(Boolean);

const renderIndex = (contents) => {
  const title = "Blog / Ricette senza glutine | Fabio Nazzari";
  const description = "Ricette, guide tecniche e contenuti educativi sulla pasticceria senza glutine.";
  const cards = contents.map((content) => {
    const image = getContentImage(content);
    return `
    <article class="editorial-panel flex h-full flex-col overflow-hidden !p-0">
      ${image ? `<a href="/ricette/${content.slug}" class="block aspect-[4/3] overflow-hidden"><img src="${escapeHtml(image)}" alt="${escapeHtml(content.imageAlt)}" class="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy"></a>` : ""}
      <div class="flex flex-1 flex-col p-6 sm:p-7">
        <div class="mb-4 flex flex-wrap gap-2">${badgeList(content).map((badge) => `<span class="pill">${escapeHtml(badge)}</span>`).join("")}</div>
        <h2 class="mb-3 text-2xl sm:text-3xl"><a href="/ricette/${content.slug}" class="hover:text-[#8B5E3C]">${escapeHtml(content.title)}</a></h2>
        <p class="mb-6 text-sm text-gray-600">${escapeHtml(content.excerpt)}</p>
        <a class="btn mt-auto" href="/ricette/${content.slug}">Leggi contenuto</a>
      </div>
    </article>`;
  }).join("");

  return `${baseHead({ title, description, canonical: `${siteUrl}/ricette`, image: "/assets/photos/crostata-fragole.jpeg", structuredData: articleStructuredData({ title, excerpt: description, seoDescription: description, featuredImage: "/assets/photos/crostata-fragole.jpeg", publishedAt: "2026-05-01", updatedAt: "2026-05-01", canonicalPath: "/ricette", slug: "ricette", type: "guide" }) })}
<body>
${header}
<main>
  <section class="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="editorial-panel bg-[#F3EEE6]">
        <p class="section-kicker mb-4">Blog / Ricette</p>
        <h1 class="mb-5 max-w-5xl text-4xl sm:text-6xl lg:text-7xl">Tecnica gluten-free, pronta da leggere e applicare.</h1>
        <p class="max-w-3xl text-base text-gray-650 sm:text-lg">Ricette guida, checklist e note professionali sulla pasticceria senza glutine.</p>
      </div>
    </div>
  </section>
  <section class="bg-white px-4 py-16 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-10 max-w-3xl">
        <p class="section-kicker mb-3">Contenuti pubblicati</p>
        <h2 class="text-3xl sm:text-5xl">Ricette e guide tecniche</h2>
      </div>
      <div class="grid gap-5 md:grid-cols-2">${cards}</div>
    </div>
  </section>
</main>
${footer}
${trackingConsent}
</body>
</html>`;
};

const renderListSection = (title, items, ordered = false) => {
  if (!items || !items.length) return "";
  const tag = ordered ? "ol" : "ul";
  return `<h2>${escapeHtml(title)}</h2><${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
};

const isSectionEnabled = (content, section) => {
  const enabledSections = content.enabledSections || {};
  return enabledSections[section] !== false;
};

const renderEnabledListSection = (content, section, title, items, ordered = false) =>
  isSectionEnabled(content, section) ? renderListSection(title, items, ordered) : "";

const renderArticleSections = (content, sections = []) => {
  if (!isSectionEnabled(content, "articleSections")) return "";
  if (!sections.length) return "";
  return sections.map((section) => `
          <h2>${escapeHtml(section.title || "Approfondimento")}</h2>
          ${section.body ? `<p>${escapeHtml(section.body)}</p>` : ""}
          ${section.items?.length ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}`).join("");
};

const renderBlocks = (content, blocks = []) => {
  if (!isSectionEnabled(content, "blocks")) return "";
  if (!blocks.length) return "";
  const mappedBlockTypes = new Set([
    "intro",
    "ingredients",
    "method",
    "method_steps",
    "key_takeaways",
    "article_section",
    "technical_notes",
    "common_mistakes",
    "conservation",
    "variations",
    "professional_tips",
    "faq",
    "recommended_products",
    "sponsor_disclosure",
    "conclusion"
  ]);
  return blocks.map((block) => {
    if (mappedBlockTypes.has(block.type)) return "";
    const title = block.title || (block.type === "intro" ? "Introduzione" : "Approfondimento");
    const list = block.items?.length ? `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
    return `
          <h2>${escapeHtml(title)}</h2>
          ${block.body ? `<p>${escapeHtml(block.body)}</p>` : ""}
          ${list}`;
  }).join("");
};

const renderDetail = (content) => {
  const canonical = `${siteUrl}/ricette/${content.slug}`;
  const structuredData = content.type === "recipe" ? recipeStructuredData(content) : articleStructuredData(content);
  const image = getContentImage(content);
  const summaryItems = [
    ["Preparazione", isoDurationToText(content.prepTime) || "Non applicabile"],
    ["Cottura", isoDurationToText(content.cookTime) || "Non applicabile"],
    ["Totale", isoDurationToText(content.totalTime) || "Lettura rapida"],
    ["Porzioni", content.servings || "Guida tecnica"]
  ];

  return `${baseHead({ title: content.seoTitle, description: content.seoDescription, canonical, image, type: "article", structuredData })}
<body>
${header}
<main>
  <article>
    <section class="px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div class="editorial-panel">
          <p class="section-kicker mb-4">${escapeHtml(content.category)}</p>
          <h1 class="mb-5 text-4xl sm:text-6xl lg:text-7xl">${escapeHtml(content.title)}</h1>
          <p class="mb-6 text-lg text-gray-600">${escapeHtml(content.subtitle)}</p>
          <div class="mb-8 flex flex-wrap gap-2">${badgeList(content).map((badge) => `<span class="pill">${escapeHtml(badge)}</span>`).join("")}</div>
          <a class="btn" href="#ricetta">${content.type === "recipe" ? "Vai alla ricetta" : "Vai alla guida"}</a>
        </div>
        ${image ? `<div class="overflow-hidden rounded-[30px] shadow-[0_28px_55px_rgba(40,35,28,0.16)]"><img src="${escapeHtml(image)}" alt="${escapeHtml(content.imageAlt)}" class="aspect-[4/5] h-full w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" loading="eager"></div>` : ""}
      </div>
    </section>
    <section class="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[280px_1fr]">
        <aside class="lg:sticky lg:top-28 lg:self-start">
          <div class="editorial-panel">
            <p class="section-kicker mb-4">Riepilogo</p>
            <dl class="grid gap-4">${summaryItems.map(([label, value]) => `<div><dt class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">${escapeHtml(label)}</dt><dd class="mt-1 font-semibold text-[#1A1A18]">${escapeHtml(value)}</dd></div>`).join("")}</dl>
          </div>
        </aside>
        <div id="ricetta" class="recipe-prose max-w-3xl scroll-mt-28">
          <p class="text-xl text-[#3D3B35]">${escapeHtml(content.intro || content.excerpt)}</p>
          ${renderEnabledListSection(content, "keyTakeaways", "Punti chiave", content.keyTakeaways)}
          ${isSectionEnabled(content, "sponsorDisclosure") && content.sponsorDisclosure ? `<div class="soft-card mt-8"><strong>Disclosure sponsor</strong><p>${escapeHtml(content.sponsorDisclosure)}</p></div>` : ""}
          ${renderEnabledListSection(content, "ingredients", content.type === "recipe" ? "Ingredienti" : "Aree da controllare", content.ingredients)}
          ${renderEnabledListSection(content, "methodSteps", content.type === "recipe" ? "Procedimento" : "Checklist operativa", content.methodSteps, true)}
          ${renderBlocks(content, content.blocks)}
          ${renderArticleSections(content, content.articleSections)}
          ${renderEnabledListSection(content, "technicalNotes", "Note tecniche", content.technicalNotes)}
          ${renderEnabledListSection(content, "commonMistakes", "Errori comuni", content.commonMistakes)}
          ${renderEnabledListSection(content, "conservation", "Conservazione", content.conservation)}
          ${renderEnabledListSection(content, "variations", "Varianti", content.variations)}
          ${renderEnabledListSection(content, "professionalTips", "Consigli professionali", content.professionalTips)}
          ${isSectionEnabled(content, "recommendedProducts") && content.recommendedProducts?.length ? renderListSection("Prodotti consigliati", content.recommendedProducts) : ""}
          ${isSectionEnabled(content, "conclusion") && content.conclusion ? `<h2>Conclusione</h2><p>${escapeHtml(content.conclusion)}</p>` : ""}
          ${isSectionEnabled(content, "faq") && content.faq?.length ? `<h2>FAQ</h2><div class="space-y-4">${content.faq.map((item) => `<details class="soft-card"><summary class="cursor-pointer font-semibold">${escapeHtml(item.question)}</summary><p class="mt-3">${escapeHtml(item.answer)}</p></details>`).join("")}</div>` : ""}
          <div class="editorial-panel mt-14 bg-[#F3EEE6]">
            <p class="section-kicker mb-3">Prossimo passo</p>
            <h2 class="!mt-0 mb-4 text-3xl">Porta questa tecnica dentro il tuo progetto.</h2>
            <p class="mb-6 text-gray-600">Se stai costruendo una linea, un laboratorio o un'offerta gluten-free, il metodo conta piu della singola ricetta.</p>
            <div class="flex flex-col gap-3 sm:flex-row">
              <a class="btn" href="${escapeHtml(content.ctaHref)}">${escapeHtml(content.ctaLabel)}</a>
              ${isSectionEnabled(content, "secondaryCta") && content.secondaryCtaLabel && content.secondaryCtaHref ? `<a class="btn !bg-white !text-[#1A1A18] border border-black/10 hover:!bg-[#F3EEE6]" href="${escapeHtml(content.secondaryCtaHref)}">${escapeHtml(content.secondaryCtaLabel)}</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    </section>
  </article>
</main>
${footer}
${trackingConsent}
</body>
</html>`;
};

const writePage = async (relativePath, html) => {
  const outputPath = path.join(rootDir, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
};

const updateRecipeSitemapEntries = async (contents) => {
  const sitemapPath = path.join(rootDir, "sitemap.xml");
  const existing = await readFile(sitemapPath, "utf8");
  const recipeUrls = [
    { loc: `${siteUrl}/ricette`, lastmod: new Date().toISOString().slice(0, 10) },
    ...contents.map((content) => ({
      loc: `${siteUrl}/ricette/${content.slug}`,
      lastmod: content.updatedAt || content.publishedAt || new Date().toISOString().slice(0, 10)
    }))
  ];
  const recipeXml = recipeUrls.map(({ loc, lastmod }) => `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${escapeHtml(lastmod)}</lastmod>
  </url>`).join("\n");
  const withoutRecipeUrls = existing.replace(/\n  <url>\s*\n    <loc>https:\/\/www\.fabionazzari\.it\/ricette(?:\/[^<]*)?<\/loc>\s*\n    <lastmod>[^<]*<\/lastmod>\s*\n  <\/url>/g, "");
  const updated = withoutRecipeUrls.replace("</urlset>", `${recipeXml}\n</urlset>`);
  await writeFile(sitemapPath, updated, "utf8");
};

const { items: publishedRecipeContents, source: recipeContentSource } = await loadRecipeContents();

await writePage("ricette/index.html", renderIndex(publishedRecipeContents));
for (const content of publishedRecipeContents) {
  await writePage(`ricette/${content.slug}/index.html`, renderDetail(content));
}
await updateRecipeSitemapEntries(publishedRecipeContents);

console.log(`Built ${publishedRecipeContents.length + 1} recipe pages from ${recipeContentSource}.`);
