import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  absoluteUrl,
  bakeryBusiness,
  breadcrumb,
  defaultImage,
  graph,
  imageUrl,
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

const renderJsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const nav = (lang = "it") => {
  const labels =
    lang === "en"
      ? [
          ["/en/fabio-nazzari", "Fabio Nazzari"],
          ["/en/consulting", "Consulting"],
          ["/en/case-studies", "Case studies"],
          ["/ricette", "Technical content"],
          ["/negozio", "Store"]
        ]
      : [
          ["/fabio-nazzari", "Fabio Nazzari"],
          ["/consulenza", "Consulenza"],
          ["/case-study", "Case study"],
          ["/ricette", "Contenuti tecnici"],
          ["/negozio", "Negozio"]
        ];
  return labels.map(([href, label]) => `<a href="${href}">${label}</a>`).join("");
};

const basePage = ({
  lang = "it",
  path: pagePath,
  title,
  description,
  h1,
  eyebrow = "Fabio Nazzari",
  image = defaultImage,
  type = "website",
  alternates = {},
  jsonLd,
  body
}) => {
  const canonical = absoluteUrl(pagePath);
  const alternateLinks = Object.entries(alternates)
    .map(([hreflang, href]) => `  <link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(absoluteUrl(href))}">`)
    .join("\n");
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
${alternateLinks ? `${alternateLinks}\n` : ""}  <meta property="og:type" content="${escapeHtml(type)}">
  <meta property="og:site_name" content="Fabio Nazzari">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(imageUrl(image))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl(image))}">
  <link rel="preload" as="image" href="${escapeHtml(image)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ${renderJsonLd(jsonLd)}
  <style>
    :root { --cream:#faf8f5; --paper:#f5f3ef; --ink:#1a1a18; --muted:#665d52; --line:rgba(26,26,24,.1); --accent:#8b5e3c; --green:#2f6f73; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:Manrope,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:var(--cream); color:var(--ink); line-height:1.65; }
    body::before { content:""; position:fixed; inset:0; pointer-events:none; z-index:-1; background:radial-gradient(circle at top right, rgba(160,144,112,.16), transparent 34%), radial-gradient(circle at bottom left, rgba(46,205,176,.08), transparent 28%); }
    a { color:inherit; }
    .site-header, .site-footer { max-width:1180px; margin:0 auto; padding:24px; display:flex; justify-content:space-between; gap:24px; align-items:center; }
    .brand { text-decoration:none; font-weight:800; letter-spacing:-.04em; font-size:1.4rem; }
    nav { display:flex; flex-wrap:wrap; gap:14px; color:var(--muted); font-size:.9rem; }
    nav a { text-decoration:none; }
    main { max-width:1180px; margin:0 auto; padding:16px 24px 72px; }
    .hero { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(280px,.8fr); gap:34px; align-items:center; padding:34px; border:1px solid var(--line); border-radius:28px; background:rgba(255,255,255,.72); box-shadow:0 24px 60px rgba(26,26,24,.07); }
    .eyebrow, .kicker { margin:0 0 14px; color:var(--accent); text-transform:uppercase; letter-spacing:.22em; font-size:.75rem; font-weight:800; }
    h1, h2, h3 { letter-spacing:-.055em; line-height:.98; }
    h1 { margin:0 0 22px; font-size:clamp(3rem,7vw,6.5rem); }
    h2 { margin:54px 0 18px; font-size:clamp(2rem,4vw,3.8rem); }
    h3 { margin:0 0 10px; font-size:1.25rem; }
    .intro { max-width:760px; color:#342f29; font-size:clamp(1.08rem,2vw,1.38rem); }
    .hero img { width:100%; aspect-ratio:4/5; object-fit:cover; border-radius:24px; }
    .grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
    .grid.two { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .card { padding:24px; border:1px solid var(--line); border-radius:16px; background:rgba(255,255,255,.72); }
    .card p, li, .muted { color:var(--muted); }
    .list { margin:0; padding-left:1.1rem; }
    .cta { display:flex; flex-wrap:wrap; gap:12px; margin-top:26px; }
    .btn { display:inline-flex; align-items:center; justify-content:center; border-radius:999px; padding:.9rem 1.15rem; background:var(--ink); color:white; text-decoration:none; font-size:.78rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
    .btn.secondary { background:white; color:var(--ink); border:1px solid var(--line); }
    .source-list a { color:var(--green); }
    .site-footer { border-top:1px solid var(--line); color:var(--muted); font-size:.9rem; }
    @media (max-width:820px) { .site-header,.site-footer { display:block; } nav { margin-top:14px; } .hero,.grid,.grid.two { grid-template-columns:1fr; } .hero { padding:22px; } }
  </style>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="${lang === "en" ? "/en/" : "/"}">fabionazzari</a>
    <nav aria-label="Navigazione principale">${nav(lang)}</nav>
  </header>
  <main>
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${h1}</h1>
        <p class="intro">${escapeHtml(description)}</p>
        ${body.heroCta || ""}
      </div>
      <img src="${escapeHtml(image)}" alt="Fabio Nazzari in laboratorio gluten free">
    </section>
    ${body.content}
  </main>
  <footer class="site-footer">
    <p>© 2026 Fabio Nazzari. Pasticceria, consulenza e formazione professionale gluten free.</p>
    <nav aria-label="Link footer">${nav(lang)}</nav>
  </footer>
</body>
</html>`;
};

const card = (title, text) => `<article class="card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`;
const list = (items) => `<ul class="list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
const linkList = (items) =>
  `<ul class="list source-list">${items.map((item) => `<li><a href="${escapeHtml(item.href)}" rel="noopener" target="_blank">${escapeHtml(item.label)}</a></li>`).join("")}</ul>`;

const pages = [
  {
    path: "/",
    file: "index.html",
    lang: "it",
    title: "Fabio Nazzari | Consulente e pastry chef specializzato nel senza glutine",
    description:
      "Consulenza, formazione e sviluppo prodotto gluten free per pasticcerie, laboratori e aziende. Fabio Nazzari, pastry chef e formatore con base a Iseo.",
    h1: "Fabio Nazzari<br><span>Consulente e pastry chef specializzato nel gluten free</span>",
    alternates: { it: "/", en: "/en/", "x-default": "/" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/consulenza">Consulenza professionale</a><a class="btn secondary" href="/fabio-nazzari">Profilo di Fabio</a></div>',
      content: `<section><h2>Gluten free professionale, dalla ricetta al laboratorio</h2><div class="grid">${card("Consulenza", "Formulazione, R&D, scaling e organizzazione per pasticcerie, bakery, laboratori, horeca e aziende alimentari.")}${card("Formazione", "Training professionale per team che devono rendere replicabili prodotti e processi senza glutine.")}${card("Officina Intollerante", "Il laboratorio e il progetto nato attorno alla pasticceria senza glutine, con base a Iseo e vocazione tecnica.")}</div></section><section><h2>Percorsi principali</h2><div class="grid two">${card("Per aziende e laboratori", "Sviluppo prodotto, setup di laboratorio, demo day e trasferimento metodo.")}${card("Per lettori e professionisti", "Ricette e contenuti tecnici collegati alla pasticceria e produzione gluten free.")}</div><div class="cta"><a class="btn" href="/case-study">Vedi case study</a><a class="btn secondary" href="/ricette">Leggi contenuti tecnici</a></div></section>`
    },
    jsonLd: graph({
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
    path: "/en/",
    file: "en/index.html",
    lang: "en",
    title: "Fabio Nazzari | Gluten-Free Pastry Consultant & Trainer",
    description:
      "Gluten-free pastry consulting, product development and professional training for bakeries, pastry labs and food companies in Italy and Europe.",
    h1: "Fabio Nazzari<br><span>Gluten-Free Pastry Consultant & Trainer</span>",
    alternates: { it: "/", en: "/en/", "x-default": "/" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/en/consulting">Consulting</a><a class="btn secondary" href="/en/fabio-nazzari">Fabio Nazzari profile</a></div>',
      content: `<section><h2>Professional gluten-free pastry work</h2><div class="grid">${card("Consulting", "Product development, pastry R&D, scaling and laboratory organisation for bakeries, pastry labs, hospitality and food companies.")}${card("Training", "Professional team training focused on repeatable methods, recipes and workflows.")}${card("Italy and Europe", "Based in Iseo, Fabio works with Italian and international projects in the gluten-free pastry field.")}</div></section>`
    },
    jsonLd: graph({
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
    path: "/fabio-nazzari",
    file: "fabio-nazzari/index.html",
    lang: "it",
    title: "Fabio Nazzari | Pastry chef, consulente e formatore gluten free",
    description:
      "Fabio Nazzari e pastry chef, consulente e formatore specializzato nel senza glutine: consulenza, formazione, R&D e sviluppo prodotto per laboratori e aziende.",
    h1: "Fabio Nazzari<br><span>Pastry chef, consulente e formatore specializzato nel senza glutine</span>",
    alternates: { it: "/fabio-nazzari", en: "/en/fabio-nazzari", "x-default": "/fabio-nazzari" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/consulenza">Parla di un progetto</a><a class="btn secondary" href="/case-study">Case study</a></div>',
      content: `<section><h2>Profilo professionale</h2><p class="intro">Fabio Nazzari lavora sulla pasticceria e panificazione senza glutine come pastry chef, consulente e formatore. Il suo lavoro unisce esperienza di laboratorio, sviluppo prodotto, R&D, formazione team e organizzazione di processi produttivi gluten free.</p><div class="grid">${card("Consulenza", "Affianca pasticcerie, bakery, laboratori, hotel, horeca e aziende alimentari su formulazione, scaling e setup di laboratorio.")}${card("Formazione", "Trasferisce metodo e competenze a team professionali con demo, training e giornate operative.")}${card("Officina Intollerante", "Il progetto e laboratorio gluten free collegato alla sua attivita professionale e alla produzione specialistica.")}</div></section><section><h2>Ambiti</h2>${list(["pasticceria senza glutine", "panificazione e bakery gluten free", "croissant, viennoiserie e grandi lievitati", "product development e R&D", "scaling produttivo", "formazione professionale", "progettazione e organizzazione laboratorio"])}</section><section><h2>Fonti esterne</h2>${linkList([{ href: "https://www.davidacademy.it/maestri/fabio-nazzari/", label: "Profilo docente DAVID Academy" }, { href: "https://www.giornaledibrescia.it/cucina/laboratorio-gluten-free-e-accademia-il-dolce-mondo-di-fabio-nazzari-qumo7zxt", label: "Giornale di Brescia: laboratorio gluten free e accademia" }])}</section>`
    },
    jsonLd: graph(
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/fabio-nazzari#webpage`,
        url: `${siteUrl}/fabio-nazzari`,
        name: "Fabio Nazzari",
        about: personRef(),
        mainEntity: personRef()
      },
      breadcrumb([{ name: "Home", path: "/" }, { name: "Fabio Nazzari", path: "/fabio-nazzari" }])
    )
  },
  {
    path: "/en/fabio-nazzari",
    file: "en/fabio-nazzari/index.html",
    lang: "en",
    title: "Fabio Nazzari | Gluten-Free Pastry Chef, Consultant & Trainer",
    description:
      "Fabio Nazzari is an Italian gluten-free pastry chef, consultant and trainer working on product development, pastry R&D and professional training.",
    h1: "Fabio Nazzari<br><span>Gluten-Free Pastry Chef, Consultant & Trainer</span>",
    alternates: { it: "/fabio-nazzari", en: "/en/fabio-nazzari", "x-default": "/fabio-nazzari" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/en/consulting">Consulting</a><a class="btn secondary" href="/en/case-studies">Case studies</a></div>',
      content: `<section><h2>Professional profile</h2><p class="intro">Fabio Nazzari works in gluten-free pastry and bakery as a pastry chef, consultant and professional trainer. His work connects laboratory experience, product development, R&D, team training and production workflows.</p><div class="grid">${card("Consulting", "Support for bakeries, pastry labs, hospitality businesses and food companies on formulation, scaling and laboratory setup.")}${card("Training", "Professional training and demo days for teams that need repeatable gluten-free pastry methods.")}${card("Officina Intollerante", "The gluten-free laboratory and project connected with Fabio's professional research and production work.")}</div></section>`
    },
    jsonLd: graph(
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/en/fabio-nazzari#webpage`,
        url: `${siteUrl}/en/fabio-nazzari`,
        name: "Fabio Nazzari",
        about: personRef(),
        mainEntity: personRef()
      },
      breadcrumb([{ name: "Home", path: "/en/" }, { name: "Fabio Nazzari", path: "/en/fabio-nazzari" }])
    )
  },
  {
    path: "/consulenza",
    file: "consulenza/index.html",
    lang: "it",
    title: "Consulenza pasticceria senza glutine | Fabio Nazzari",
    description:
      "Consulenza professionale gluten free per pasticcerie, laboratori e industrie: formulazione, sviluppo prodotto, formazione team, scaling e setup di laboratorio.",
    h1: "Consulenza pasticceria senza glutine<br><span>Fabio Nazzari</span>",
    alternates: { it: "/consulenza", en: "/en/consulting", "x-default": "/consulenza" },
    image: "/assets/photos/fabio-laboratorio.jpeg",
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/contatti">Richiedi una consulenza</a><a class="btn secondary" href="/case-study">Guarda case study</a></div>',
      content: `<section><h2>Tre pilastri di lavoro</h2><div class="grid">${card("Formulazione & Ricerca", "Sviluppo ricette, bilanciamento, test e miglioramento di prodotti gluten free per produzione reale.")}${card("Training & Demo Day", "Formazione team, trasferimento metodo e giornate operative in laboratorio.")}${card("Setup & Compliance", "Organizzazione laboratorio, flussi, contaminazioni, processi e standardizzazione operativa.")}</div></section><section><h2>Per chi lavoro</h2>${list(["pasticcerie", "bakery", "laboratori artigianali", "hotel e horeca", "scuole professionali", "aziende alimentari", "produttori di ingredienti e miscele"])}</section><section><h2>Ambiti di intervento</h2>${list(["gluten-free pastry", "bakery", "bread", "viennoiserie e croissant", "large leavened products", "product formulation", "R&D", "production scaling", "team training", "laboratory setup"])}</section>`
    },
    jsonLd: graph(professionalService, breadcrumb([{ name: "Home", path: "/" }, { name: "Consulenza", path: "/consulenza" }]))
  },
  {
    path: "/en/consulting",
    file: "en/consulting/index.html",
    lang: "en",
    title: "Gluten-Free Pastry Consultant in Italy & Europe | Fabio Nazzari",
    description:
      "Professional gluten-free pastry consulting, product development, R&D and team training for bakeries, pastry labs, hospitality businesses and food companies.",
    h1: "Gluten-Free Pastry Consulting<br><span>Fabio Nazzari</span>",
    alternates: { it: "/consulenza", en: "/en/consulting", "x-default": "/consulenza" },
    image: "/assets/photos/fabio-laboratorio.jpeg",
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/en/contact">Start a project</a><a class="btn secondary" href="/en/case-studies">Case studies</a></div>',
      content: `<section><h2>Consulting for professional gluten-free pastry</h2><p class="intro">Fabio Nazzari is an Italian gluten-free pastry consultant and trainer working with bakeries, pastry laboratories, hospitality businesses and food companies on product development, R&D and professional training in Italy, Europe and international projects.</p><div class="grid">${card("Product development", "Gluten-free pastry and bakery formulation, testing and improvement for real production contexts.")}${card("Pastry R&D", "Research and development for croissants, bread, viennoiserie, large leavened products and professional pastry.")}${card("Professional training", "Team training, demo days and operational support for repeatable gluten-free workflows.")}</div></section>`
    },
    jsonLd: graph(
      { ...professionalService, "@id": `${siteUrl}/en/consulting#service`, url: `${siteUrl}/en/consulting`, name: "Gluten-free pastry consulting" },
      breadcrumb([{ name: "Home", path: "/en/" }, { name: "Consulting", path: "/en/consulting" }])
    )
  },
  {
    path: "/negozio",
    file: "negozio/index.html",
    lang: "it",
    title: "Negozio e pasticceria senza glutine a Iseo | Fabio Nazzari",
    description:
      "Il negozio Fabio Nazzari Patisserie Chocolaterie a Iseo: punto vendita gluten free, dolci artigianali, informazioni di contatto e collegamento alla consulenza professionale.",
    h1: "Negozio gluten free a Iseo<br><span>Fabio Nazzari Patisserie Chocolaterie</span>",
    alternates: { it: "/negozio", en: "/en/pastry-shop", "x-default": "/negozio" },
    image: "/assets/photos/fotonegozio/negozio-3.jpeg",
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/contatti">Contatti</a><a class="btn secondary" href="/consulenza">Consulenza professionale</a></div>',
      content: `<section><h2>Punto vendita</h2><p class="intro">La pasticceria di Iseo e il punto vendita collegato al mondo Fabio Nazzari e Officina Intollerante. Questa pagina mantiene il focus locale separato dalla consulenza professionale, che resta il percorso principale per aziende e laboratori.</p><div class="grid two">${card("Iseo", "Pasticceria e cioccolateria artigianale nel cuore di Iseo, con prodotti gluten free e dolci firmati Fabio Nazzari.")}${card("Contatti", "Per richieste negozio, ordini e informazioni usa la pagina contatti o i riferimenti ufficiali presenti sul sito.")}</div></section>`
    },
    jsonLd: graph(bakeryBusiness, breadcrumb([{ name: "Home", path: "/" }, { name: "Negozio", path: "/negozio" }]))
  },
  {
    path: "/case-study",
    file: "case-study/index.html",
    lang: "it",
    title: "Case study consulenza gluten free | Fabio Nazzari",
    description:
      "Case study e collaborazioni professionali documentabili di Fabio Nazzari nella consulenza gluten free, formazione, sviluppo prodotto e R&D.",
    h1: "Case study<br><span>Consulenza gluten free Fabio Nazzari</span>",
    alternates: { it: "/case-study", en: "/en/case-studies", "x-default": "/case-study" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/case-study/origini">Origini</a><a class="btn secondary" href="/case-study/gli-imperfetti">Gli Imperfetti</a></div>',
      content: `<section><h2>Progetti pubblicati</h2><div class="grid two">${card("Origini, Reggio Calabria", "Masterclass di due giorni per formare lo staff su croissant e pasticceria gluten free.")}${card("Gli Imperfetti", "Progetto di laboratorio gluten free che ha indicato pubblicamente anche la consulenza di Fabio Nazzari nell'avvio.")}</div></section><section><h2>Collaborazioni professionali</h2><p class="intro">Le collaborazioni vanno lette con precisione: alcune sono consulenze o formazione, altre attivita tecniche, academy, eventi o contesti pubblici. Tra le fonti pubbliche consultate compaiono Molino Merano, GSI Lab, DAVID Academy e Artebianca.</p>${linkList([{ href: "https://www.davidacademy.it/maestri/fabio-nazzari/", label: "DAVID Academy" }, { href: "https://www.artebianca.it/eventilab/", label: "Artebianca EventiLab" }, { href: "https://business.meranermuehle.it/sigep", label: "Molino Merano / SIGEP" }])}</section>`
    },
    jsonLd: graph({ "@type": "CollectionPage", "@id": `${siteUrl}/case-study#webpage`, url: `${siteUrl}/case-study`, name: "Case study Fabio Nazzari", about: personRef() }, breadcrumb([{ name: "Home", path: "/" }, { name: "Case study", path: "/case-study" }]))
  },
  {
    path: "/en/case-studies",
    file: "en/case-studies/index.html",
    lang: "en",
    title: "Gluten-Free Pastry Case Studies | Fabio Nazzari",
    description:
      "Documented case studies and professional collaborations connected with Fabio Nazzari's gluten-free pastry consulting, training and product development work.",
    h1: "Case studies<br><span>Fabio Nazzari gluten-free consulting</span>",
    alternates: { it: "/case-study", en: "/en/case-studies", "x-default": "/case-study" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/en/consulting">Consulting</a><a class="btn secondary" href="/en/fabio-nazzari">Profile</a></div>',
      content: `<section><h2>Published projects</h2><div class="grid two">${card("Origini, Reggio Calabria", "A two-day masterclass focused on staff training for gluten-free croissants and pastry methodology.")}${card("Gli Imperfetti", "A gluten-free laboratory project that publicly mentions Fabio Nazzari's consultancy during its start-up phase.")}</div></section>`
    },
    jsonLd: graph({ "@type": "CollectionPage", "@id": `${siteUrl}/en/case-studies#webpage`, url: `${siteUrl}/en/case-studies`, name: "Fabio Nazzari case studies", about: personRef() }, breadcrumb([{ name: "Home", path: "/en/" }, { name: "Case studies", path: "/en/case-studies" }]))
  },
  {
    path: "/case-study/origini",
    file: "case-study/origini/index.html",
    lang: "it",
    title: "Origini Reggio Calabria | Case study gluten free Fabio Nazzari",
    description:
      "Case study documentabile: masterclass di due giorni da Origini a Reggio Calabria con Fabio Nazzari per formare lo staff su croissant e pasticceria gluten free.",
    h1: "Origini, Reggio Calabria<br><span>Masterclass gluten free con Fabio Nazzari</span>",
    alternates: { it: "/case-study/origini", "x-default": "/case-study/origini" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/consulenza">Consulenza gluten free</a><a class="btn secondary" href="/case-study">Tutti i case study</a></div>',
      content: `<section><h2>Contesto ed esigenza</h2><p class="intro">Origini, a Reggio Calabria, ha inserito una masterclass di due giorni nel percorso di sviluppo della propria offerta senza glutine. La fonte pubblica CityNow documenta Fabio Nazzari come chef pasticcere ingaggiato per formare lo staff.</p></section><section><h2>Tipo di intervento</h2><div class="grid">${card("Formazione staff", "Attivita di formazione rivolta allo staff di cucina.")}${card("Metodo", "Focus sulle corrette metodologie per croissant senza glutine e pasticceria gluten free.")}${card("Competenze", "Pasticceria gluten free, croissant, laboratorio, trasferimento tecnico al team.")}</div></section><section><h2>Fonte</h2>${linkList([{ href: "https://www.citynow.it/reggio-calabria-laboratorio-senza-glutine-origini-evento-gluten-free-chef-fabio-nazzari/", label: "CityNow: Origini accoglie l'evento gluten free con Fabio Nazzari" }])}</section>`
    },
    jsonLd: graph({ "@type": "Article", "@id": `${siteUrl}/case-study/origini#article`, headline: "Origini Reggio Calabria: masterclass gluten free con Fabio Nazzari", author: personRef(), publisher: personRef(), mainEntityOfPage: `${siteUrl}/case-study/origini`, datePublished: "2026-09-21", dateModified: coreLastmod }, breadcrumb([{ name: "Home", path: "/" }, { name: "Case study", path: "/case-study" }, { name: "Origini", path: "/case-study/origini" }]))
  },
  {
    path: "/case-study/gli-imperfetti",
    file: "case-study/gli-imperfetti/index.html",
    lang: "it",
    title: "Gli Imperfetti | Case study consulenza Fabio Nazzari",
    description:
      "Case study breve e documentabile sul progetto Gli Imperfetti, che indica pubblicamente anche la consulenza di Fabio Nazzari nell'avvio del laboratorio.",
    h1: "Gli Imperfetti<br><span>Case study consulenza gluten free</span>",
    alternates: { it: "/case-study/gli-imperfetti", "x-default": "/case-study/gli-imperfetti" },
    body: {
      heroCta: '<div class="cta"><a class="btn" href="/consulenza">Consulenza gluten free</a><a class="btn secondary" href="/case-study">Tutti i case study</a></div>',
      content: `<section><h2>Contesto</h2><p class="intro">Gli Imperfetti e un progetto di laboratorio gluten free. La fonte pubblica Valeria Gluten Free documenta che, per l'avvio del progetto, il laboratorio si e avvalso anche della consulenza di Fabio Nazzari.</p></section><section><h2>Attivita documentabile</h2><p class="intro">Non sono stati aggiunti KPI, risultati economici o dettagli non presenti nelle fonti pubbliche. Il case study resta volutamente breve e concentrato sull'informazione verificabile.</p></section><section><h2>Fonte</h2>${linkList([{ href: "https://valeriaglutenfree.com/gli-imperfetti/", label: "Valeria Gluten Free: Gli Imperfetti" }])}</section>`
    },
    jsonLd: graph({ "@type": "Article", "@id": `${siteUrl}/case-study/gli-imperfetti#article`, headline: "Gli Imperfetti: case study consulenza gluten free Fabio Nazzari", author: personRef(), publisher: personRef(), mainEntityOfPage: `${siteUrl}/case-study/gli-imperfetti`, datePublished: "2026-09-21", dateModified: coreLastmod }, breadcrumb([{ name: "Home", path: "/" }, { name: "Case study", path: "/case-study" }, { name: "Gli Imperfetti", path: "/case-study/gli-imperfetti" }]))
  }
];

const sitemapStaticUrls = [
  ...pages.map((page) => page.path),
  "/b2b",
  "/contatti",
  "/privacy",
  "/bio",
  "/dentro-officina/01-il-pane/",
  "/en/b2b",
  "/en/contact",
  "/en/pastry-shop",
  "/en/privacy",
  "/en/bio"
];

const writePage = async (file, html) => {
  const outputPath = path.join(rootDir, file);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
};

const buildSitemap = async () => {
  const urls = [...new Set(sitemapStaticUrls)].map((urlPath) => `  <url>
    <loc>${absoluteUrl(urlPath)}</loc>
    <lastmod>${coreLastmod}</lastmod>
  </url>`);
  await writeFile(
    path.join(rootDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`,
    "utf8"
  );
};

for (const page of pages) {
  await writePage(page.file, basePage(page));
}
await buildSitemap();

console.log(`Built ${pages.length} core SEO pages and sitemap.`);
