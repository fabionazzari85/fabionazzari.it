export const siteUrl = "https://www.fabionazzari.it";
export const defaultImage = "/assets/photos/fabio-ritratto-grissini.jpeg";
export const fabioId = `${siteUrl}/#fabio-nazzari`;
export const websiteId = `${siteUrl}/#website`;

export const sameAs = [
  "https://instagram.com/fabionazzari",
  "https://www.facebook.com/fabionazzari.pastry",
  "https://www.youtube.com/c/FabioNazzari",
  "https://www.linkedin.com/in/fabio-nazzari-52912a19/"
];

export const person = {
  "@type": "Person",
  "@id": fabioId,
  name: "Fabio Nazzari",
  url: `${siteUrl}/fabio-nazzari`,
  image: `${siteUrl}${defaultImage}`,
  jobTitle: [
    "Pastry chef",
    "Consulente gluten free",
    "Formatore professionale"
  ],
  description:
    "Fabio Nazzari e pastry chef, consulente e formatore specializzato nel senza glutine, con attivita di consulenza, sviluppo prodotto, formazione e R&D per pasticcerie, bakery, laboratori, horeca e aziende alimentari.",
  knowsAbout: [
    "gluten free pastry",
    "pasticceria senza glutine",
    "panificazione senza glutine",
    "product development",
    "pastry R&D",
    "formazione professionale",
    "production scaling",
    "laboratory setup",
    "Officina Intollerante"
  ],
  sameAs
};

export const website = {
  "@type": "WebSite",
  "@id": websiteId,
  name: "Fabio Nazzari",
  url: siteUrl,
  inLanguage: ["it-IT", "en"],
  author: { "@id": fabioId },
  publisher: { "@id": fabioId }
};

export const absoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export const imageUrl = (path = defaultImage) => absoluteUrl(path);

export const personRef = () => ({ "@id": fabioId });

export const graph = (...nodes) => ({
  "@context": "https://schema.org",
  "@graph": [person, website, ...nodes]
});

export const breadcrumb = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path)
  }))
});

export const professionalService = {
  "@type": "Service",
  "@id": `${siteUrl}/consulenza#service`,
  name: "Consulenza professionale gluten free",
  serviceType: [
    "Gluten-free pastry consulting",
    "Product development",
    "Pastry R&D",
    "Professional training",
    "Laboratory setup"
  ],
  provider: personRef(),
  areaServed: ["Italia", "Europe", "International"],
  url: `${siteUrl}/consulenza`
};

export const bakeryBusiness = {
  "@type": "Bakery",
  "@id": `${siteUrl}/negozio#bakery`,
  name: "Fabio Nazzari Patisserie Chocolaterie",
  url: `${siteUrl}/negozio`,
  image: [
    `${siteUrl}/assets/photos/fotonegozio/negozio-1.jpeg`,
    `${siteUrl}/assets/photos/fotonegozio/negozio-3.jpeg`
  ],
  telephone: "+39 347 117 6944",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Iseo",
    addressRegion: "BS",
    addressCountry: "IT"
  }
};
