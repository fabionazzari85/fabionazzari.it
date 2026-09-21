import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  absoluteUrl,
  bakeryBusiness,
  breadcrumb,
  defaultImage,
  graph,
  personRef,
  professionalService,
  siteUrl
} from "./seo-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const coreLastmod = "2026-09-21";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const linkList = (items) =>
  `<ul>${items.map((item) => `<li><a href="${escapeHtml(item.href)}" rel="noopener" target="_blank">${escapeHtml(item.label)}</a></li>`).join("")}</ul>`;

const pages = [
  {
    file: "index.html",
    path: "/",
    title: "Fabio Nazzari | Consulente e pastry chef specializzato nel senza glutine",
    description:
      "Consulenza, formazione e sviluppo prodotto gluten free per pasticcerie, laboratori e aziende. Fabio Nazzari, pastry chef e formatore con base a Iseo.",
    alternates: { it: "/", en: "/en/", "x-default": "/" },
    h1: "Fabio Nazzari. Consulente e pastry chef specializzato nel gluten free",
    fallback:
      '<p>Fabio Nazzari e pastry chef, consulente e formatore specializzato nel gluten free. Lavora su consulenza, formazione e sviluppo prodotto per pasticcerie, laboratori, bakery, horeca e aziende.</p><p><a href="/fabio-nazzari">Profilo di Fabio Nazzari</a> · <a href="/consulenza">Consulenza professionale gluten free</a> · <a href="/case-study">Case study</a></p>',
    schema: graph({
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: "Fabio Nazzari",
      description:
        "Consulenza, formazione e sviluppo prodotto gluten free per pasticcerie, laboratori e aziende.",
      about: personRef(),
      author: personRef()
    })
  },
  {
    file: "en/index.html",
    path: "/en/",
    title: "Fabio Nazzari | Gluten-Free Pastry Consultant & Trainer",
    description:
      "Gluten-free pastry consulting, product development and professional training for bakeries, pastry labs and food companies in Italy and Europe.",
    alternates: { it: "/", en: "/en/", "x-default": "/" },
    h1: "Fabio Nazzari. Gluten-Free Pastry Consultant & Trainer",
    fallback:
      '<p>Fabio Nazzari is an Italian gluten-free pastry chef, consultant and trainer working on product development, pastry R&D and professional training for bakeries, pastry laboratories and food companies.</p><p><a href="/en/fabio-nazzari">Fabio Nazzari profile</a> · <a href="/en/consulting">Gluten-free pastry consulting</a> · <a href="/en/case-studies">Case studies</a></p>',
    schema: graph({
      "@type": "WebPage",
      "@id": `${siteUrl}/en/#webpage`,
      url: `${siteUrl}/en/`,
      name: "Fabio Nazzari",
      description:
        "Gluten-free pastry consulting, product development and professional training for bakeries, pastry labs and food companies.",
      about: personRef(),
      author: personRef()
    })
  },
  {
    file: "consulenza/index.html",
    path: "/consulenza",
    title: "Consulenza pasticceria senza glutine | Fabio Nazzari",
    description:
      "Consulenza professionale gluten free per pasticcerie, laboratori e industrie: formulazione, sviluppo prodotto, formazione team, scaling e setup di laboratorio.",
    alternates: { it: "/consulenza", en: "/en/consulting", "x-default": "/consulenza" },
    h1: "Consulenza pasticceria senza glutine. Fabio Nazzari",
    image: "/assets/photos/fabio-laboratorio.jpeg",
    fallback:
      '<p>Consulenza professionale gluten free per pasticcerie, bakery, laboratori, hotel, horeca, scuole, aziende alimentari e produttori di ingredienti o miscele.</p><h2>Tre pilastri</h2><ul><li>Formulazione & Ricerca</li><li>Training & Demo Day</li><li>Setup & Compliance</li></ul><h2>Ambiti di intervento</h2><ul><li>gluten-free pastry</li><li>bakery e bread</li><li>croissant, viennoiserie e grandi lievitati</li><li>product formulation e R&D</li><li>production scaling, team training e laboratory setup</li></ul><p><a href="/fabio-nazzari">Fabio Nazzari</a> · <a href="/case-study">Case study</a></p>',
    schema: graph(
      professionalService,
      breadcrumb([{ name: "Home", path: "/" }, { name: "Consulenza", path: "/consulenza" }])
    )
  },
  {
    file: "en/consulting/index.html",
    path: "/en/consulting",
    title: "Gluten-Free Pastry Consultant in Italy & Europe | Fabio Nazzari",
    description:
      "Professional gluten-free pastry consulting, product development, R&D and team training for bakeries, pastry labs, hospitality businesses and food companies.",
    alternates: { it: "/consulenza", en: "/en/consulting", "x-default": "/consulenza" },
    h1: "Gluten-Free Pastry Consulting. Fabio Nazzari",
    image: "/assets/photos/fabio-laboratorio.jpeg",
    fallback:
      "<p>Fabio Nazzari is an Italian gluten-free pastry consultant and trainer working with bakeries, pastry laboratories, hospitality businesses and food companies on product development, R&D and professional training in Italy, Europe and international projects.</p><ul><li>gluten-free pastry consultant</li><li>gluten-free bakery consultant</li><li>product development and pastry R&D</li><li>professional training for teams</li></ul><p><a href=\"/en/fabio-nazzari\">Fabio Nazzari profile</a> · <a href=\"/en/case-studies\">Case studies</a></p>",
    schema: graph(
      { ...professionalService, "@id": `${siteUrl}/en/consulting#service`, url: `${siteUrl}/en/consulting`, name: "Gluten-free pastry consulting" },
      breadcrumb([{ name: "Home", path: "/en/" }, { name: "Consulting", path: "/en/consulting" }])
    )
  },
  {
    file: "negozio/index.html",
    path: "/negozio",
    title: "Negozio e pasticceria senza glutine a Iseo | Fabio Nazzari",
    description:
      "Il negozio Fabio Nazzari Patisserie Chocolaterie a Iseo: punto vendita gluten free, dolci artigianali, informazioni di contatto e collegamento alla consulenza professionale.",
    alternates: { it: "/negozio", en: "/en/pastry-shop", "x-default": "/negozio" },
    h1: "Negozio gluten free a Iseo. Fabio Nazzari Patisserie Chocolaterie",
    image: "/assets/photos/fotonegozio/negozio-3.jpeg",
    fallback:
      '<p>Il negozio Fabio Nazzari Patisserie Chocolaterie a Iseo e il punto vendita collegato al mondo Fabio Nazzari e Officina Intollerante. Per progetti professionali, consulenza e formazione resta disponibile la pagina consulenza.</p><p><a href="/consulenza">Consulenza professionale gluten free</a> · <a href="/contatti">Contatti</a></p>',
    schema: graph(
      bakeryBusiness,
      breadcrumb([{ name: "Home", path: "/" }, { name: "Negozio", path: "/negozio" }])
    )
  }
];

const staticPages = [
  {
    file: "fabio-nazzari/index.html",
    path: "/fabio-nazzari",
    title: "Fabio Nazzari | Pastry chef, consulente e formatore gluten free",
    description:
      "Fabio Nazzari e pastry chef, consulente e formatore specializzato nel senza glutine: consulenza, formazione, R&D e sviluppo prodotto per laboratori e aziende.",
    lang: "it",
    alternates: { it: "/fabio-nazzari", en: "/en/fabio-nazzari", "x-default": "/fabio-nazzari" },
    h1: "Fabio Nazzari<br><span>Pastry chef, consulente e formatore specializzato nel senza glutine</span>",
    content:
      '<section><h2>Profilo professionale</h2><p>Fabio Nazzari lavora sulla pasticceria e panificazione senza glutine come pastry chef, consulente e formatore. Il suo lavoro unisce esperienza di laboratorio, sviluppo prodotto, R&D, formazione team e organizzazione di processi produttivi gluten free.</p></section><section><h2>Ambiti</h2><ul><li>pasticceria senza glutine</li><li>panificazione e bakery gluten free</li><li>croissant, viennoiserie e grandi lievitati</li><li>product development e R&D</li><li>scaling produttivo</li><li>formazione professionale</li><li>progettazione e organizzazione laboratorio</li></ul></section><section><h2>Fonti esterne</h2>' +
      linkList([{ href: "https://www.davidacademy.it/maestri/fabio-nazzari/", label: "Profilo docente DAVID Academy" }, { href: "https://www.giornaledibrescia.it/cucina/laboratorio-gluten-free-e-accademia-il-dolce-mondo-di-fabio-nazzari-qumo7zxt", label: "Giornale di Brescia" }]) +
      '</section>',
    schema: graph(
      { "@type": "ProfilePage", "@id": `${siteUrl}/fabio-nazzari#webpage`, url: `${siteUrl}/fabio-nazzari`, name: "Fabio Nazzari", about: personRef(), mainEntity: personRef() },
      breadcrumb([{ name: "Home", path: "/" }, { name: "Fabio Nazzari", path: "/fabio-nazzari" }])
    )
  },
  {
    file: "en/fabio-nazzari/index.html",
    path: "/en/fabio-nazzari",
    title: "Fabio Nazzari | Gluten-Free Pastry Chef, Consultant & Trainer",
    description:
      "Fabio Nazzari is an Italian gluten-free pastry chef, consultant and trainer working on product development, pastry R&D and professional training.",
    lang: "en",
    alternates: { it: "/fabio-nazzari", en: "/en/fabio-nazzari", "x-default": "/fabio-nazzari" },
    h1: "Fabio Nazzari<br><span>Gluten-Free Pastry Chef, Consultant & Trainer</span>",
    content:
      "<section><h2>Professional profile</h2><p>Fabio Nazzari works in gluten-free pastry and bakery as a pastry chef, consultant and professional trainer. His work connects laboratory experience, product development, R&D, team training and production workflows.</p></section>",
    schema: graph(
      { "@type": "ProfilePage", "@id": `${siteUrl}/en/fabio-nazzari#webpage`, url: `${siteUrl}/en/fabio-nazzari`, name: "Fabio Nazzari", about: personRef(), mainEntity: personRef() },
      breadcrumb([{ name: "Home", path: "/en/" }, { name: "Fabio Nazzari", path: "/en/fabio-nazzari" }])
    )
  },
  {
    file: "case-study/index.html",
    path: "/case-study",
    title: "Case study consulenza gluten free | Fabio Nazzari",
    description:
      "Case study e collaborazioni professionali documentabili di Fabio Nazzari nella consulenza gluten free, formazione, sviluppo prodotto e R&D.",
    lang: "it",
    alternates: { it: "/case-study", en: "/en/case-studies", "x-default": "/case-study" },
    h1: "Case study<br><span>Consulenza gluten free Fabio Nazzari</span>",
    content:
      '<section><h2>Progetti pubblicati</h2><p><a href="/case-study/origini">Origini, Reggio Calabria</a>: masterclass di due giorni per formare lo staff su croissant e pasticceria gluten free.</p><p><a href="/case-study/gli-imperfetti">Gli Imperfetti</a>: progetto di laboratorio gluten free che cita pubblicamente anche la consulenza di Fabio Nazzari nell\'avvio.</p></section><section><h2>Collaborazioni professionali</h2><p>Tra le fonti pubbliche consultate compaiono Molino Merano, GSI Lab, DAVID Academy e Artebianca.</p>' +
      linkList([{ href: "https://www.davidacademy.it/maestri/fabio-nazzari/", label: "DAVID Academy" }, { href: "https://www.artebianca.it/eventilab/", label: "Artebianca EventiLab" }, { href: "https://business.meranermuehle.it/sigep", label: "Molino Merano / SIGEP" }]) +
      '</section>',
    schema: graph({ "@type": "CollectionPage", "@id": `${siteUrl}/case-study#webpage`, url: `${siteUrl}/case-study`, name: "Case study Fabio Nazzari", about: personRef() }, breadcrumb([{ name: "Home", path: "/" }, { name: "Case study", path: "/case-study" }]))
  },
  {
    file: "en/case-studies/index.html",
    path: "/en/case-studies",
    title: "Gluten-Free Pastry Case Studies | Fabio Nazzari",
    description:
      "Documented case studies and professional collaborations connected with Fabio Nazzari's gluten-free pastry consulting, training and product development work.",
    lang: "en",
    alternates: { it: "/case-study", en: "/en/case-studies", "x-default": "/case-study" },
    h1: "Case studies<br><span>Fabio Nazzari gluten-free consulting</span>",
    content:
      "<section><h2>Published projects</h2><p>Origini, Reggio Calabria: a two-day masterclass focused on staff training for gluten-free croissants and pastry methodology.</p><p>Gli Imperfetti: a gluten-free laboratory project that publicly mentions Fabio Nazzari's consultancy during its start-up phase.</p></section>",
    schema: graph({ "@type": "CollectionPage", "@id": `${siteUrl}/en/case-studies#webpage`, url: `${siteUrl}/en/case-studies`, name: "Fabio Nazzari case studies", about: personRef() }, breadcrumb([{ name: "Home", path: "/en/" }, { name: "Case studies", path: "/en/case-studies" }]))
  },
  {
    file: "case-study/origini/index.html",
    path: "/case-study/origini",
    title: "Origini Reggio Calabria | Case study gluten free Fabio Nazzari",
    description:
      "Case study documentabile: masterclass di due giorni da Origini a Reggio Calabria con Fabio Nazzari per formare lo staff su croissant e pasticceria gluten free.",
    lang: "it",
    alternates: { it: "/case-study/origini", "x-default": "/case-study/origini" },
    h1: "Origini, Reggio Calabria<br><span>Masterclass gluten free con Fabio Nazzari</span>",
    content:
      '<section><h2>Contesto ed esigenza</h2><p>Origini, a Reggio Calabria, ha inserito una masterclass di due giorni nel percorso di sviluppo della propria offerta senza glutine. La fonte pubblica CityNow documenta Fabio Nazzari come chef pasticcere ingaggiato per formare lo staff.</p></section><section><h2>Tipo di intervento</h2><ul><li>Formazione staff</li><li>Metodologie per croissant senza glutine e pasticceria gluten free</li><li>Trasferimento tecnico al team</li></ul></section><section><h2>Fonte</h2>' +
      linkList([{ href: "https://www.citynow.it/reggio-calabria-laboratorio-senza-glutine-origini-evento-gluten-free-chef-fabio-nazzari/", label: "CityNow: Origini accoglie l'evento gluten free con Fabio Nazzari" }]) +
      '</section>',
    schema: graph({ "@type": "Article", "@id": `${siteUrl}/case-study/origini#article`, headline: "Origini Reggio Calabria: masterclass gluten free con Fabio Nazzari", author: personRef(), publisher: personRef(), mainEntityOfPage: `${siteUrl}/case-study/origini`, datePublished: coreLastmod, dateModified: coreLastmod }, breadcrumb([{ name: "Home", path: "/" }, { name: "Case study", path: "/case-study" }, { name: "Origini", path: "/case-study/origini" }]))
  },
  {
    file: "case-study/gli-imperfetti/index.html",
    path: "/case-study/gli-imperfetti",
    title: "Gli Imperfetti | Case study consulenza Fabio Nazzari",
    description:
      "Case study breve e documentabile sul progetto Gli Imperfetti, che indica pubblicamente anche la consulenza di Fabio Nazzari nell'avvio del laboratorio.",
    lang: "it",
    alternates: { it: "/case-study/gli-imperfetti", "x-default": "/case-study/gli-imperfetti" },
    h1: "Gli Imperfetti<br><span>Case study consulenza gluten free</span>",
    content:
      '<section><h2>Contesto</h2><p>Gli Imperfetti e un progetto di laboratorio gluten free. La fonte pubblica Valeria Gluten Free documenta che, per l\'avvio del progetto, il laboratorio si e avvalso anche della consulenza di Fabio Nazzari.</p></section><section><h2>Attivita documentabile</h2><p>Non sono stati aggiunti KPI, risultati economici o dettagli non presenti nelle fonti pubbliche.</p></section><section><h2>Fonte</h2>' +
      linkList([{ href: "https://valeriaglutenfree.com/gli-imperfetti/", label: "Valeria Gluten Free: Gli Imperfetti" }]) +
      '</section>',
    schema: graph({ "@type": "Article", "@id": `${siteUrl}/case-study/gli-imperfetti#article`, headline: "Gli Imperfetti: case study consulenza gluten free Fabio Nazzari", author: personRef(), publisher: personRef(), mainEntityOfPage: `${siteUrl}/case-study/gli-imperfetti`, datePublished: coreLastmod, dateModified: coreLastmod }, breadcrumb([{ name: "Home", path: "/" }, { name: "Case study", path: "/case-study" }, { name: "Gli Imperfetti", path: "/case-study/gli-imperfetti" }]))
  }
];

const metaBlock = (page) => {
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image || defaultImage);
  const alternates = Object.entries(page.alternates)
    .map(([hreflang, href]) => `    <link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(absoluteUrl(href))}" />`)
    .join("\n");
  return `    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Fabio Nazzari">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(page.description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(page.title)}">
    <meta name="twitter:description" content="${escapeHtml(page.description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <link rel="canonical" href="${escapeHtml(canonical)}" />
${alternates}
    <script>document.documentElement.classList.add("js");</script>
    ${jsonLd(page.schema)}`;
};

const seoStyle = `<style id="seo-fallback-style">
        html.js #seo-fallback { display: none !important; }
        #seo-fallback { max-width: 1080px; margin: 0 auto; padding: 32px 24px 72px; color: #1A1A18; }
        #seo-fallback h1 { font-size: clamp(2.5rem, 7vw, 5.5rem); line-height: .95; margin: 0 0 18px; letter-spacing: -0.05em; }
        #seo-fallback h2 { margin-top: 32px; font-size: clamp(1.6rem, 3vw, 2.7rem); letter-spacing: -0.04em; }
        #seo-fallback p, #seo-fallback li { color: #5f5648; max-width: 780px; }
        #seo-fallback a { color: #8B5E3C; }
    </style>`;

const fallbackBlock = (page) => `<main id="seo-fallback" aria-label="Contenuto principale">
      <h1>${page.h1}</h1>
      ${page.fallback}
    </main>`;

const patchReactHtml = async (page) => {
  const filePath = path.join(rootDir, page.file);
  let html = await readFile(filePath, "utf8");
  html = html.replace(/    <title>[\s\S]*?<\/script>\n\n    <!-- Tailwind CSS via CDN -->/, `${metaBlock(page)}\n\n    <!-- Tailwind CSS via CDN -->`);
  html = html.replace(/<style id="seo-fallback-style">[\s\S]*?<\/style>/, "");
  html = html.replace(/<\/head>/, `${seoStyle}\n</head>`);
  html = html.replace(/<div id="root"><\/div>\s*(?:<main id="seo-fallback"[\s\S]*?<\/main>)?/, `<div id="root"></div>\n    ${fallbackBlock(page)}`);
  html = html.replace(/pasticceria: "\/pasticceria"/g, 'pasticceria: "/negozio"');
  html = html.replace(/\/pasticceria"/g, '/negozio"');
  html = html.replace(/\/pasticceria'/g, "/negozio'");
  await writeFile(filePath, html, "utf8");
};

const staticPage = (page) => {
  const alternateLinks = Object.entries(page.alternates)
    .map(([hreflang, href]) => `  <link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(absoluteUrl(href))}">`)
    .join("\n");
  return `<!doctype html>
<html lang="${page.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${escapeHtml(absoluteUrl(page.path))}">
${alternateLinks}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Fabio Nazzari">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${escapeHtml(absoluteUrl(page.path))}">
  <meta property="og:image" content="${escapeHtml(absoluteUrl(defaultImage))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(absoluteUrl(defaultImage))}">
  ${jsonLd(page.schema)}
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; font-family: Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #FAF8F5; color: #1A1A18; line-height: 1.65; }
    header, main, footer { max-width: 1080px; margin: 0 auto; padding: 24px; }
    nav { display: flex; gap: 14px; flex-wrap: wrap; }
    a { color: #8B5E3C; }
    h1, h2 { letter-spacing: -0.05em; line-height: .98; }
    h1 { font-size: clamp(3rem, 7vw, 6rem); }
    h2 { margin-top: 42px; font-size: clamp(2rem, 4vw, 3.4rem); }
    p, li { color: #5f5648; max-width: 780px; }
  </style>
</head>
<body>
  <header><a href="${page.lang === "en" ? "/en/" : "/"}">fabionazzari</a></header>
  <main>
    <h1>${page.h1}</h1>
    <p>${escapeHtml(page.description)}</p>
    ${page.content}
  </main>
  <footer><nav><a href="/fabio-nazzari">Fabio Nazzari</a><a href="/consulenza">Consulenza</a><a href="/case-study">Case study</a><a href="/negozio">Negozio</a></nav></footer>
</body>
</html>`;
};

const writeStaticPage = async (page) => {
  const outputPath = path.join(rootDir, page.file);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, staticPage(page), "utf8");
};

const buildSitemap = async () => {
  const urls = [
    ...pages.map((page) => page.path),
    ...staticPages.map((page) => page.path),
    "/b2b",
    "/contatti",
    "/privacy",
    "/bio",
    "/dentro-officina/01-il-pane/",
    "/dentro-officina/pani-speciali-pizza-focaccia/",
    "/en/b2b",
    "/en/contact",
    "/en/pastry-shop",
    "/en/privacy",
    "/en/bio"
  ];
  const uniqueUrls = [...new Set(urls)].map((urlPath) => `  <url>
    <loc>${absoluteUrl(urlPath)}</loc>
    <lastmod>${coreLastmod}</lastmod>
  </url>`);
  await writeFile(
    path.join(rootDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.join("\n")}
</urlset>
`,
    "utf8"
  );
};

for (const page of pages) {
  await patchReactHtml(page);
}
for (const page of staticPages) {
  await writeStaticPage(page);
}
await buildSitemap();

console.log(`Patched ${pages.length} React pages without changing the visual app and built ${staticPages.length} SEO pages.`);
