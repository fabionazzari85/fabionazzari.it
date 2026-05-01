import fs from "node:fs/promises";
import path from "node:path";

const rootDir = "/tmp/officina-site-sync";
const baseHtmlPath = path.join(rootDir, "fabio-nazzari-website.html");
const basePrivacyPath = path.join(rootDir, "privacy.html");

const localeMeta = {
  it: {
    lang: "it",
    title: "Fabio Nazzari - L'eccellenza senza glutine",
    description: "Consulenza, Officina Intollerante e Pasticceria a Iseo: un unico sito per entrare subito nel mondo giusto.",
    ogLocale: "it_IT",
    privacyTitle: "Privacy | Officina Intollerante",
    privacyDescription: "Come vengono trattati i dati personali inviati tramite i form del sito Fabio Nazzari e Officina Intollerante."
  },
  en: {
    lang: "en",
    title: "Fabio Nazzari - Gluten-free excellence",
    description: "Consulting, Officina Intollerante and the pastry shop in Iseo: one site to enter the right world straight away.",
    ogLocale: "en_US",
    privacyTitle: "Privacy | Officina Intollerante",
    privacyDescription: "How personal data sent through the Fabio Nazzari and Officina Intollerante website forms is handled."
  }
};

const routeTable = {
  it: {
    home: "/",
    consulenza: "/consulenza",
    officina: "/officina",
    "officina-b2b": "/b2b",
    pasticceria: "/pasticceria",
    contatti: "/contatti",
    privacy: "/privacy"
  },
  en: {
    home: "/en",
    consulenza: "/en/consulting",
    officina: "/en/officina",
    "officina-b2b": "/en/b2b",
    pasticceria: "/en/pastry-shop",
    contatti: "/en/contact",
    privacy: "/en/privacy"
  }
};

const sitePages = ["home", "consulenza", "officina", "officina-b2b", "pasticceria", "contatti"];

const pageMetaByLocale = {
  it: {
    home: {
      title: "Fabio Nazzari - L'eccellenza senza glutine",
      description: "Consulenza, Officina Intollerante e Pasticceria a Iseo: un unico sito per entrare subito nel mondo giusto."
    },
    consulenza: {
      title: "Consulenza Intollerante | Fabio Nazzari",
      description: "Strategia, sviluppo prodotto, formazione e posizionamento per aziende che vogliono crescere nel gluten free."
    },
    officina: {
      title: "Officina Intollerante | Shop senza glutine",
      description: "Mignon, biscotteria, lievitati e dolci signature di Officina Intollerante, pronti per retail, gifting e collezione."
    },
    "officina-b2b": {
      title: "Officina B2B | Fabio Nazzari",
      description: "Catalogo B2B per horeca, rivendita, eventi e hospitality: linee senza glutine pensate per l'uso professionale."
    },
    pasticceria: {
      title: "Pasticceria Iseo | Fabio Nazzari",
      description: "Il punto vendita di Iseo, gli orari aggiornati e le informazioni utili per visitare la pasticceria di Fabio Nazzari."
    },
    contatti: {
      title: "Contatti | Fabio Nazzari",
      description: "Invia una richiesta strutturata per consulenza, B2B, shop o collaborazioni e arriva in dashboard con il contesto giusto."
    }
  },
  en: {
    home: {
      title: "Fabio Nazzari - Gluten-free excellence",
      description: "Consulting, Officina Intollerante and the pastry shop in Iseo: one site to enter the right world straight away."
    },
    consulenza: {
      title: "Intollerante Consulting | Fabio Nazzari",
      description: "Strategy, product development, training and positioning for businesses that want to grow in gluten free."
    },
    officina: {
      title: "Officina Intollerante | Gluten-free Shop",
      description: "Mignon pastries, cookies, leavened cakes and signature sweets from Officina Intollerante, ready for retail and gifting."
    },
    "officina-b2b": {
      title: "Officina B2B | Fabio Nazzari",
      description: "A B2B catalogue for horeca, resellers, events and hospitality: gluten-free lines designed for professional use."
    },
    pasticceria: {
      title: "Iseo Pastry Shop | Fabio Nazzari",
      description: "The Iseo store, updated opening hours and all the useful details to visit Fabio Nazzari's pastry shop."
    },
    contatti: {
      title: "Contact | Fabio Nazzari",
      description: "Send a structured request for consulting, B2B, shop or collaborations and land in the dashboard with the right context."
    }
  },
  de: {
    home: {
      title: "Fabio Nazzari - Glutenfreie Exzellenz",
      description: "Beratung, Officina Intollerante und die Konditorei in Iseo: eine Website, um sofort in die richtige Welt einzutreten."
    },
    consulenza: {
      title: "Intollerante Beratung | Fabio Nazzari",
      description: "Strategie, Produktentwicklung, Schulung und Positionierung für Unternehmen, die im glutenfreien Markt wachsen wollen."
    },
    officina: {
      title: "Officina Intollerante | Glutenfreier Shop",
      description: "Mignon, Kekse, große Hefeteige und Signature-Süßwaren von Officina Intollerante für Retail und Gifting."
    },
    "officina-b2b": {
      title: "Officina B2B | Fabio Nazzari",
      description: "Ein B2B-Katalog für Horeca, Wiederverkäufer, Events und Hospitality: glutenfreie Linien für den professionellen Einsatz."
    },
    pasticceria: {
      title: "Konditorei Iseo | Fabio Nazzari",
      description: "Das Geschäft in Iseo, aktuelle Öffnungszeiten und alle nützlichen Informationen für den Besuch der Konditorei von Fabio Nazzari."
    },
    contatti: {
      title: "Kontakt | Fabio Nazzari",
      description: "Sende eine strukturierte Anfrage für Beratung, B2B, Shop oder Kooperationen und lande mit dem richtigen Kontext im Dashboard."
    }
  },
  nl: {
    home: {
      title: "Fabio Nazzari - Glutenvrije excellentie",
      description: "Consultancy, Officina Intollerante en de patisserie in Iseo: één site om meteen de juiste wereld binnen te gaan."
    },
    consulenza: {
      title: "Intollerante Consultancy | Fabio Nazzari",
      description: "Strategie, productontwikkeling, training en positionering voor bedrijven die in glutenvrij willen groeien."
    },
    officina: {
      title: "Officina Intollerante | Glutenvrije Shop",
      description: "Mignons, cookies, grote gerezen cakes en signature sweets van Officina Intollerante voor retail en gifting."
    },
    "officina-b2b": {
      title: "Officina B2B | Fabio Nazzari",
      description: "Een B2B-catalogus voor horeca, resellers, events en hospitality: glutenvrije lijnen voor professioneel gebruik."
    },
    pasticceria: {
      title: "Patisserie Iseo | Fabio Nazzari",
      description: "De winkel in Iseo, bijgewerkte openingstijden en alle nuttige informatie om de patisserie van Fabio Nazzari te bezoeken."
    },
    contatti: {
      title: "Contact | Fabio Nazzari",
      description: "Stuur een gestructureerd verzoek voor consultancy, B2B, shop of samenwerkingen en kom met de juiste context in het dashboard terecht."
    }
  },
  es: {
    home: {
      title: "Fabio Nazzari - Excelencia sin gluten",
      description: "Consultoría, Officina Intollerante y la pastelería de Iseo: un solo sitio para entrar de inmediato en el mundo adecuado."
    },
    consulenza: {
      title: "Consultoría Intollerante | Fabio Nazzari",
      description: "Estrategia, desarrollo de producto, formación y posicionamiento para empresas que quieren crecer en el gluten free."
    },
    officina: {
      title: "Officina Intollerante | Tienda Sin Gluten",
      description: "Mignones, cookies, grandes fermentaciones y dulces signature de Officina Intollerante para retail y gifting."
    },
    "officina-b2b": {
      title: "Officina B2B | Fabio Nazzari",
      description: "Un catálogo B2B para horeca, reventa, eventos y hospitality: líneas sin gluten pensadas para uso profesional."
    },
    pasticceria: {
      title: "Pastelería Iseo | Fabio Nazzari",
      description: "La tienda de Iseo, los horarios actualizados y toda la información útil para visitar la pastelería de Fabio Nazzari."
    },
    contatti: {
      title: "Contacto | Fabio Nazzari",
      description: "Envía una solicitud estructurada para consultoría, B2B, tienda o colaboraciones y llega al dashboard con el contexto correcto."
    }
  },
  fr: {
    home: {
      title: "Fabio Nazzari - L'excellence sans gluten",
      description: "Conseil, Officina Intollerante et la pâtisserie d'Iseo : un seul site pour entrer tout de suite dans le bon univers."
    },
    consulenza: {
      title: "Conseil Intollerante | Fabio Nazzari",
      description: "Stratégie, développement produit, formation et positionnement pour les entreprises qui veulent grandir dans le sans gluten."
    },
    officina: {
      title: "Officina Intollerante | Boutique Sans Gluten",
      description: "Mignardises, cookies, grands levés et douceurs signature d'Officina Intollerante pour le retail et le gifting."
    },
    "officina-b2b": {
      title: "Officina B2B | Fabio Nazzari",
      description: "Un catalogue B2B pour l'horeca, les revendeurs, les événements et l'hospitality : des lignes sans gluten pensées pour un usage professionnel."
    },
    pasticceria: {
      title: "Pâtisserie Iseo | Fabio Nazzari",
      description: "La boutique d'Iseo, les horaires actualisés et toutes les informations utiles pour visiter la pâtisserie de Fabio Nazzari."
    },
    contatti: {
      title: "Contact | Fabio Nazzari",
      description: "Envoyez une demande structurée pour le conseil, le B2B, la boutique ou les collaborations et arrivez dans la dashboard avec le bon contexte."
    }
  }
};

const sortOptionsByLocale = {
  en: [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price low to high" },
    { value: "price-desc", label: "Price high to low" },
    { value: "name-asc", label: "Name A-Z" }
  ],
  de: [
    { value: "featured", label: "Im Fokus" },
    { value: "price-asc", label: "Preis aufsteigend" },
    { value: "price-desc", label: "Preis absteigend" },
    { value: "name-asc", label: "Name A-Z" }
  ],
  nl: [
    { value: "featured", label: "Uitgelicht" },
    { value: "price-asc", label: "Prijs oplopend" },
    { value: "price-desc", label: "Prijs aflopend" },
    { value: "name-asc", label: "Naam A-Z" }
  ],
  es: [
    { value: "featured", label: "Destacados" },
    { value: "price-asc", label: "Precio ascendente" },
    { value: "price-desc", label: "Precio descendente" },
    { value: "name-asc", label: "Nombre A-Z" }
  ],
  fr: [
    { value: "featured", label: "À la une" },
    { value: "price-asc", label: "Prix croissant" },
    { value: "price-desc", label: "Prix décroissant" },
    { value: "name-asc", label: "Nom A-Z" }
  ]
};

const fallbackHoursByLocale = {
  en: [
    { day: "Mon", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Tue", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Wed", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Thu", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Fri", intervals: ["07:30 - 12:30", "15:30 - 20:00"] },
    { day: "Sat", intervals: ["07:30 - 12:30", "14:30 - 22:00"] },
    { day: "Sun", intervals: ["07:30 - 12:30", "14:30 - 20:00"] }
  ],
  de: [
    { day: "Mo", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Di", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Mi", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Do", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Fr", intervals: ["07:30 - 12:30", "15:30 - 20:00"] },
    { day: "Sa", intervals: ["07:30 - 12:30", "14:30 - 22:00"] },
    { day: "So", intervals: ["07:30 - 12:30", "14:30 - 20:00"] }
  ],
  nl: [
    { day: "Ma", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Di", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Wo", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Do", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Vr", intervals: ["07:30 - 12:30", "15:30 - 20:00"] },
    { day: "Za", intervals: ["07:30 - 12:30", "14:30 - 22:00"] },
    { day: "Zo", intervals: ["07:30 - 12:30", "14:30 - 20:00"] }
  ],
  es: [
    { day: "Lun", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Mar", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Mié", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Jue", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Vie", intervals: ["07:30 - 12:30", "15:30 - 20:00"] },
    { day: "Sáb", intervals: ["07:30 - 12:30", "14:30 - 22:00"] },
    { day: "Dom", intervals: ["07:30 - 12:30", "14:30 - 20:00"] }
  ],
  fr: [
    { day: "Lun", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Mar", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Mer", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Jeu", intervals: ["07:30 - 12:30", "15:30 - 19:30"] },
    { day: "Ven", intervals: ["07:30 - 12:30", "15:30 - 20:00"] },
    { day: "Sam", intervals: ["07:30 - 12:30", "14:30 - 22:00"] },
    { day: "Dim", intervals: ["07:30 - 12:30", "14:30 - 20:00"] }
  ]
};

const pastryDefaultsByLocale = {
  en: {
    title: "Fabio Nazzari Patisserie Chocolaterie",
    address: "Piazza Giuseppe Garibaldi 15, 25049 Iseo (BS)",
    description: "Artisanal pastry and chocolate shop in the centre of Iseo.",
    phone: "+39 030 9821756",
    email: "info@nazzari-iseo.it",
    website: "https://www.nazzari-iseo.it",
    mapsUrl: "https://maps.google.com/?q=Piazza+Giuseppe+Garibaldi+15,+25049+Iseo+BS"
  },
  de: {
    title: "Fabio Nazzari Patisserie Chocolaterie",
    address: "Piazza Giuseppe Garibaldi 15, 25049 Iseo (BS)",
    description: "Handwerkliche Patisserie und Chocolaterie im Zentrum von Iseo.",
    phone: "+39 030 9821756",
    email: "info@nazzari-iseo.it",
    website: "https://www.nazzari-iseo.it",
    mapsUrl: "https://maps.google.com/?q=Piazza+Giuseppe+Garibaldi+15,+25049+Iseo+BS"
  },
  nl: {
    title: "Fabio Nazzari Patisserie Chocolaterie",
    address: "Piazza Giuseppe Garibaldi 15, 25049 Iseo (BS)",
    description: "Ambachtelijke patisserie en chocolaterie in het centrum van Iseo.",
    phone: "+39 030 9821756",
    email: "info@nazzari-iseo.it",
    website: "https://www.nazzari-iseo.it",
    mapsUrl: "https://maps.google.com/?q=Piazza+Giuseppe+Garibaldi+15,+25049+Iseo+BS"
  },
  es: {
    title: "Fabio Nazzari Patisserie Chocolaterie",
    address: "Piazza Giuseppe Garibaldi 15, 25049 Iseo (BS)",
    description: "Pastelería y chocolatería artesanal en el centro de Iseo.",
    phone: "+39 030 9821756",
    email: "info@nazzari-iseo.it",
    website: "https://www.nazzari-iseo.it",
    mapsUrl: "https://maps.google.com/?q=Piazza+Giuseppe+Garibaldi+15,+25049+Iseo+BS"
  },
  fr: {
    title: "Fabio Nazzari Patisserie Chocolaterie",
    address: "Piazza Giuseppe Garibaldi 15, 25049 Iseo (BS)",
    description: "Pâtisserie et chocolaterie artisanales au centre d'Iseo.",
    phone: "+39 030 9821756",
    email: "info@nazzari-iseo.it",
    website: "https://www.nazzari-iseo.it",
    mapsUrl: "https://maps.google.com/?q=Piazza+Giuseppe+Garibaldi+15,+25049+Iseo+BS"
  }
};

const leadRequestOptionsByLocale = {
  en: [
    { value: "ordine_b2b", label: "B2B order" },
    { value: "rivenditore", label: "Reseller" },
    { value: "consulenza", label: "Consulting" },
    { value: "corso_formazione", label: "Course / training" },
    { value: "shop_online", label: "Online shop" },
    { value: "collaborazione", label: "Collaboration" },
    { value: "generica", label: "General" }
  ],
  de: [
    { value: "ordine_b2b", label: "B2B-Bestellung" },
    { value: "rivenditore", label: "Wiederverkäufer" },
    { value: "consulenza", label: "Beratung" },
    { value: "corso_formazione", label: "Kurs / Schulung" },
    { value: "shop_online", label: "Onlineshop" },
    { value: "collaborazione", label: "Kooperation" },
    { value: "generica", label: "Allgemein" }
  ],
  nl: [
    { value: "ordine_b2b", label: "B2B-bestelling" },
    { value: "rivenditore", label: "Wederverkoper" },
    { value: "consulenza", label: "Consultancy" },
    { value: "corso_formazione", label: "Cursus / training" },
    { value: "shop_online", label: "Online shop" },
    { value: "collaborazione", label: "Samenwerking" },
    { value: "generica", label: "Algemeen" }
  ],
  es: [
    { value: "ordine_b2b", label: "Pedido B2B" },
    { value: "rivenditore", label: "Distribuidor" },
    { value: "consulenza", label: "Consultoría" },
    { value: "corso_formazione", label: "Curso / formación" },
    { value: "shop_online", label: "Tienda online" },
    { value: "collaborazione", label: "Colaboración" },
    { value: "generica", label: "General" }
  ],
  fr: [
    { value: "ordine_b2b", label: "Commande B2B" },
    { value: "rivenditore", label: "Revendeur" },
    { value: "consulenza", label: "Conseil" },
    { value: "corso_formazione", label: "Cours / formation" },
    { value: "shop_online", label: "Boutique en ligne" },
    { value: "collaborazione", label: "Collaboration" },
    { value: "generica", label: "Général" }
  ]
};

const leadActivityOptionsByLocale = {
  en: [
    { value: "pasticceria", label: "Pastry shop" },
    { value: "ristorante", label: "Restaurant" },
    { value: "hotel", label: "Hotel" },
    { value: "negozio", label: "Store" },
    { value: "laboratorio", label: "Lab" },
    { value: "azienda", label: "Company" },
    { value: "privato", label: "Private client" },
    { value: "altro", label: "Other" }
  ],
  de: [
    { value: "pasticceria", label: "Konditorei" },
    { value: "ristorante", label: "Restaurant" },
    { value: "hotel", label: "Hotel" },
    { value: "negozio", label: "Geschäft" },
    { value: "laboratorio", label: "Labor" },
    { value: "azienda", label: "Unternehmen" },
    { value: "privato", label: "Privatkunde" },
    { value: "altro", label: "Sonstiges" }
  ],
  nl: [
    { value: "pasticceria", label: "Patisserie" },
    { value: "ristorante", label: "Restaurant" },
    { value: "hotel", label: "Hotel" },
    { value: "negozio", label: "Winkel" },
    { value: "laboratorio", label: "Lab" },
    { value: "azienda", label: "Bedrijf" },
    { value: "privato", label: "Particulier" },
    { value: "altro", label: "Anders" }
  ],
  es: [
    { value: "pasticceria", label: "Pastelería" },
    { value: "ristorante", label: "Restaurante" },
    { value: "hotel", label: "Hotel" },
    { value: "negozio", label: "Tienda" },
    { value: "laboratorio", label: "Laboratorio" },
    { value: "azienda", label: "Empresa" },
    { value: "privato", label: "Cliente privado" },
    { value: "altro", label: "Otro" }
  ],
  fr: [
    { value: "pasticceria", label: "Pâtisserie" },
    { value: "ristorante", label: "Restaurant" },
    { value: "hotel", label: "Hôtel" },
    { value: "negozio", label: "Boutique" },
    { value: "laboratorio", label: "Laboratoire" },
    { value: "azienda", label: "Entreprise" },
    { value: "privato", label: "Client particulier" },
    { value: "altro", label: "Autre" }
  ]
};

const leadVolumeOptionsByLocale = {
  en: [
    { value: "basso", label: "Low" },
    { value: "medio", label: "Medium" },
    { value: "alto", label: "High" }
  ],
  de: [
    { value: "basso", label: "Niedrig" },
    { value: "medio", label: "Mittel" },
    { value: "alto", label: "Hoch" }
  ],
  nl: [
    { value: "basso", label: "Laag" },
    { value: "medio", label: "Middel" },
    { value: "alto", label: "Hoog" }
  ],
  es: [
    { value: "basso", label: "Bajo" },
    { value: "medio", label: "Medio" },
    { value: "alto", label: "Alto" }
  ],
  fr: [
    { value: "basso", label: "Faible" },
    { value: "medio", label: "Moyen" },
    { value: "alto", label: "Élevé" }
  ]
};

const cookieCategoriesByLocale = {
  en: [
    {
      key: "necessary",
      title: "Technical",
      description: "They are needed to make the site, the Officina cart and consent storage work.",
      examples: ["fn_cookie_consent", "fabio-nazzari-officina-cart-v1", "navigation state"],
      locked: true
    },
    {
      key: "functional",
      title: "Functional",
      description: "They remember the last area visited and the last product viewed so you can restart faster.",
      examples: ["fn_last_section", "fn_last_product"],
      locked: false
    },
    {
      key: "analytics",
      title: "Analytics",
      description: "They measure pages, paths and traffic sources. Ready for GA4 and Clarity.",
      examples: ["fn_attribution", "_ga", "_clck"],
      locked: false
    },
    {
      key: "marketing",
      title: "Marketing",
      description: "They enable campaigns and remarketing if and when we decide to activate them.",
      examples: ["_fbp", "gclid", "ad_storage"],
      locked: false
    }
  ],
  de: [
    {
      key: "necessary",
      title: "Technisch",
      description: "Sie werden benötigt, damit die Website, der Officina-Warenkorb und die Speicherung des Einwilligungsstatus funktionieren.",
      examples: ["fn_cookie_consent", "fabio-nazzari-officina-cart-v1", "Navigationsstatus"],
      locked: true
    },
    {
      key: "functional",
      title: "Funktional",
      description: "Sie merken sich den zuletzt besuchten Bereich und das zuletzt angesehene Produkt.",
      examples: ["fn_last_section", "fn_last_product"],
      locked: false
    },
    {
      key: "analytics",
      title: "Analytics",
      description: "Sie messen Seiten, Wege und die Herkunft der Besuche. Bereit für GA4 und Clarity.",
      examples: ["fn_attribution", "_ga", "_clck"],
      locked: false
    },
    {
      key: "marketing",
      title: "Marketing",
      description: "Sie aktivieren Kampagnen und Remarketing, falls und sobald wir sie einschalten.",
      examples: ["_fbp", "gclid", "ad_storage"],
      locked: false
    }
  ],
  nl: [
    {
      key: "necessary",
      title: "Technisch",
      description: "Nodig om de site, de Officina-cart en het opslaan van toestemming te laten werken.",
      examples: ["fn_cookie_consent", "fabio-nazzari-officina-cart-v1", "navigatiestatus"],
      locked: true
    },
    {
      key: "functional",
      title: "Functioneel",
      description: "Ze onthouden het laatst bezochte onderdeel en het laatst bekeken product.",
      examples: ["fn_last_section", "fn_last_product"],
      locked: false
    },
    {
      key: "analytics",
      title: "Analytics",
      description: "Ze meten pagina's, routes en de herkomst van bezoeken. Klaar voor GA4 en Clarity.",
      examples: ["fn_attribution", "_ga", "_clck"],
      locked: false
    },
    {
      key: "marketing",
      title: "Marketing",
      description: "Ze activeren campagnes en remarketing als en wanneer we daarvoor kiezen.",
      examples: ["_fbp", "gclid", "ad_storage"],
      locked: false
    }
  ],
  es: [
    {
      key: "necessary",
      title: "Técnicas",
      description: "Sirven para que el sitio, el carrito Officina y el guardado del consentimiento funcionen.",
      examples: ["fn_cookie_consent", "fabio-nazzari-officina-cart-v1", "estado de navegación"],
      locked: true
    },
    {
      key: "functional",
      title: "Funcionales",
      description: "Recuerdan la última sección visitada y el último producto visto.",
      examples: ["fn_last_section", "fn_last_product"],
      locked: false
    },
    {
      key: "analytics",
      title: "Analytics",
      description: "Miden páginas, recorridos y procedencia de las visitas. Listas para GA4 y Clarity.",
      examples: ["fn_attribution", "_ga", "_clck"],
      locked: false
    },
    {
      key: "marketing",
      title: "Marketing",
      description: "Activan campañas y remarketing solo si decidimos ponerlos en marcha.",
      examples: ["_fbp", "gclid", "ad_storage"],
      locked: false
    }
  ],
  fr: [
    {
      key: "necessary",
      title: "Techniques",
      description: "Ils servent à faire fonctionner le site, le panier Officina et l'enregistrement du consentement.",
      examples: ["fn_cookie_consent", "fabio-nazzari-officina-cart-v1", "état de navigation"],
      locked: true
    },
    {
      key: "functional",
      title: "Fonctionnels",
      description: "Ils mémorisent la dernière section visitée et le dernier produit consulté.",
      examples: ["fn_last_section", "fn_last_product"],
      locked: false
    },
    {
      key: "analytics",
      title: "Analytics",
      description: "Ils mesurent les pages, les parcours et la provenance des visites. Prêts pour GA4 et Clarity.",
      examples: ["fn_attribution", "_ga", "_clck"],
      locked: false
    },
    {
      key: "marketing",
      title: "Marketing",
      description: "Ils activent les campagnes et le remarketing si et quand nous décidons de les mettre en place.",
      examples: ["_fbp", "gclid", "ad_storage"],
      locked: false
    }
  ]
};

const homeWorldsByLocale = {
  en: [
    {
      page: "consulenza",
      label: "01 / Strategy",
      title: "Intollerante Consulting",
      description: "Strategy, product development and positioning for businesses that want to stand out for real.",
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      logo: "assets/logos/emblema-consulenza.png"
    },
    {
      page: "officina",
      label: "02 / Product",
      title: "Officina Intollerante",
      description: "A gluten-free shop with mignon pastries, cookies, panettoni, creams and sweets made seriously.",
      image: "assets/photos/croissant.jpeg",
      logo: "assets/logos/emblema-officina.png"
    },
    {
      page: "pasticceria",
      label: "03 / Collection",
      title: "Iseo Pastry Shop",
      description: "The store, the display counter and the atmosphere of Nazzari Pasticceria told through images.",
      image: "assets/photos/fotonegozio/negozio-3.jpeg",
      logo: "assets/logos/emblema-pasticceria-dark.png"
    }
  ],
  de: [
    {
      page: "consulenza",
      label: "01 / Strategie",
      title: "Intollerante Beratung",
      description: "Strategie, Produktentwicklung und Positionierung für Unternehmen, die sich wirklich abheben wollen.",
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      logo: "assets/logos/emblema-consulenza.png"
    },
    {
      page: "officina",
      label: "02 / Produkt",
      title: "Officina Intollerante",
      description: "Ein glutenfreier Shop mit Mignon, Cookies, Panettone, Cremes und Süßwaren mit Substanz.",
      image: "assets/photos/croissant.jpeg",
      logo: "assets/logos/emblema-officina.png"
    },
    {
      page: "pasticceria",
      label: "03 / Kollektion",
      title: "Konditorei Iseo",
      description: "Das Geschäft, die Theke und die Atmosphäre von Nazzari Pasticceria in Bildern erzählt.",
      image: "assets/photos/fotonegozio/negozio-3.jpeg",
      logo: "assets/logos/emblema-pasticceria-dark.png"
    }
  ],
  nl: [
    {
      page: "consulenza",
      label: "01 / Strategie",
      title: "Intollerante Consultancy",
      description: "Strategie, productontwikkeling en positionering voor bedrijven die zich echt willen onderscheiden.",
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      logo: "assets/logos/emblema-consulenza.png"
    },
    {
      page: "officina",
      label: "02 / Product",
      title: "Officina Intollerante",
      description: "Een glutenvrije shop met mignons, cookies, panettoni, crèmes en sweets die serieus gemaakt zijn.",
      image: "assets/photos/croissant.jpeg",
      logo: "assets/logos/emblema-officina.png"
    },
    {
      page: "pasticceria",
      label: "03 / Collectie",
      title: "Patisserie Iseo",
      description: "De winkel, de toonbank en de sfeer van Nazzari Pasticceria verteld in beelden.",
      image: "assets/photos/fotonegozio/negozio-3.jpeg",
      logo: "assets/logos/emblema-pasticceria-dark.png"
    }
  ],
  es: [
    {
      page: "consulenza",
      label: "01 / Estrategia",
      title: "Consultoría Intollerante",
      description: "Estrategia, desarrollo de producto y posicionamiento para empresas que quieren diferenciarse de verdad.",
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      logo: "assets/logos/emblema-consulenza.png"
    },
    {
      page: "officina",
      label: "02 / Producto",
      title: "Officina Intollerante",
      description: "Una tienda sin gluten con mignones, cookies, panettoni, cremas y dulces hechos en serio.",
      image: "assets/photos/croissant.jpeg",
      logo: "assets/logos/emblema-officina.png"
    },
    {
      page: "pasticceria",
      label: "03 / Colección",
      title: "Pastelería Iseo",
      description: "La tienda, el mostrador y la atmósfera de Nazzari Pasticceria contados en imágenes.",
      image: "assets/photos/fotonegozio/negozio-3.jpeg",
      logo: "assets/logos/emblema-pasticceria-dark.png"
    }
  ],
  fr: [
    {
      page: "consulenza",
      label: "01 / Stratégie",
      title: "Conseil Intollerante",
      description: "Stratégie, développement produit et positionnement pour les entreprises qui veulent vraiment se distinguer.",
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      logo: "assets/logos/emblema-consulenza.png"
    },
    {
      page: "officina",
      label: "02 / Produit",
      title: "Officina Intollerante",
      description: "Une boutique sans gluten avec mignardises, cookies, panettoni, crèmes et douceurs faites sérieusement.",
      image: "assets/photos/croissant.jpeg",
      logo: "assets/logos/emblema-officina.png"
    },
    {
      page: "pasticceria",
      label: "03 / Collection",
      title: "Pâtisserie Iseo",
      description: "La boutique, le comptoir et l'atmosphère de Nazzari Pasticceria racontés en images.",
      image: "assets/photos/fotonegozio/negozio-3.jpeg",
      logo: "assets/logos/emblema-pasticceria-dark.png"
    }
  ]
};

const consultingServicesByLocale = {
  en: [
    {
      label: "01 / Product",
      title: "Product Development and Training",
      description: "Recipes, method and skills transfer to build a gluten-free offer that is solid, recognisable and repeatable.",
      points: ["Research and fine tuning", "Production standards", "Technical training"],
      cta: "Sharpen the offer",
      image: "assets/photos/croissant.jpeg"
    },
    {
      label: "02 / Start-up",
      title: "Start-up, Team and Launch",
      description: "From setting up the business to work flows: team organisation, staff training and a more ordered launch.",
      points: ["Business set-up", "Roles and organisation", "Staff training"],
      cta: "Set the launch properly",
      image: "assets/photos/stock/startup-blueprint.jpeg"
    },
    {
      label: "03 / Marketing",
      title: "Marketing Strategy and Communication",
      description: "Positioning, tone of voice and content to tell the project clearly and make it more desirable.",
      points: ["Positioning", "Content plan", "Coordinated communication"],
      cta: "Clarify the message",
      image: "assets/photos/stock/brand-strategy-mockup.jpeg"
    }
  ],
  de: [
    {
      label: "01 / Produkt",
      title: "Produktentwicklung und Schulung",
      description: "Rezepte, Methode und Kompetenztransfer, um ein glutenfreies Angebot aufzubauen, das solide, erkennbar und reproduzierbar ist.",
      points: ["Recherche und Feinschliff", "Produktionsstandards", "Technische Schulung"],
      cta: "Angebot schärfen",
      image: "assets/photos/croissant.jpeg"
    },
    {
      label: "02 / Start-up",
      title: "Start-up, Team und Start",
      description: "Vom Geschäftsaufbau bis zu den Arbeitsabläufen: Teamorganisation, Schulung des Personals und ein geordneterer Start.",
      points: ["Geschäftsaufbau", "Rollen und Organisation", "Mitarbeiterschulung"],
      cta: "Start sauber aufsetzen",
      image: "assets/photos/stock/startup-blueprint.jpeg"
    },
    {
      label: "03 / Marketing",
      title: "Marketingstrategie und Kommunikation",
      description: "Positionierung, Tonalität und Inhalte, um das Projekt klar zu erzählen und begehrlicher zu machen.",
      points: ["Positionierung", "Content-Plan", "Abgestimmte Kommunikation"],
      cta: "Botschaft schärfen",
      image: "assets/photos/stock/brand-strategy-mockup.jpeg"
    }
  ],
  nl: [
    {
      label: "01 / Product",
      title: "Productontwikkeling en training",
      description: "Recepten, methode en kennisoverdracht om een glutenvrij aanbod te bouwen dat sterk, herkenbaar en reproduceerbaar is.",
      points: ["Onderzoek en finetuning", "Productiestandaarden", "Technische training"],
      cta: "Aanbod aanscherpen",
      image: "assets/photos/croissant.jpeg"
    },
    {
      label: "02 / Start-up",
      title: "Start-up, team en lancering",
      description: "Van bedrijfsopzet tot workflows: teamorganisatie, stafftraining en een strakkere start.",
      points: ["Bedrijfsopstart", "Rollen en organisatie", "Teamtraining"],
      cta: "Start goed opzetten",
      image: "assets/photos/stock/startup-blueprint.jpeg"
    },
    {
      label: "03 / Marketing",
      title: "Marketingstrategie en communicatie",
      description: "Positionering, tone of voice en content om het project helder te vertellen en aantrekkelijker te maken.",
      points: ["Positionering", "Contentplan", "Gecoördineerde communicatie"],
      cta: "Boodschap verduidelijken",
      image: "assets/photos/stock/brand-strategy-mockup.jpeg"
    }
  ],
  es: [
    {
      label: "01 / Producto",
      title: "Desarrollo de producto y formación",
      description: "Recetas, método y transferencia de competencias para construir una oferta gluten free sólida, reconocible y replicable.",
      points: ["Investigación y ajuste", "Estándares de producción", "Formación técnica"],
      cta: "Enfoca la oferta",
      image: "assets/photos/croissant.jpeg"
    },
    {
      label: "02 / Start-up",
      title: "Start-up, equipo y puesta en marcha",
      description: "Desde la puesta en marcha del negocio hasta los flujos de trabajo: organización del equipo, formación del staff y un arranque más ordenado.",
      points: ["Puesta en marcha", "Roles y organización", "Formación del equipo"],
      cta: "Ordena el inicio",
      image: "assets/photos/stock/startup-blueprint.jpeg"
    },
    {
      label: "03 / Marketing",
      title: "Estrategia de marketing y comunicación",
      description: "Posicionamiento, tono de voz y contenidos para contar el proyecto con claridad y hacerlo más deseable.",
      points: ["Posicionamiento", "Plan de contenidos", "Comunicación coordinada"],
      cta: "Aclara el mensaje",
      image: "assets/photos/stock/brand-strategy-mockup.jpeg"
    }
  ],
  fr: [
    {
      label: "01 / Produit",
      title: "Développement produit et formation",
      description: "Recettes, méthode et transfert de compétences pour construire une offre sans gluten solide, reconnaissable et reproductible.",
      points: ["Recherche et réglage", "Standards de production", "Formation technique"],
      cta: "Affiner l'offre",
      image: "assets/photos/croissant.jpeg"
    },
    {
      label: "02 / Start-up",
      title: "Start-up, équipe et lancement",
      description: "De la mise en place de l'activité aux flux de travail : organisation de l'équipe, formation du staff et démarrage plus ordonné.",
      points: ["Lancement de l'activité", "Rôles et organisation", "Formation du staff"],
      cta: "Structurer le départ",
      image: "assets/photos/stock/startup-blueprint.jpeg"
    },
    {
      label: "03 / Marketing",
      title: "Stratégie marketing et communication",
      description: "Positionnement, tonalité et contenus pour raconter le projet avec clarté et le rendre plus désirable.",
      points: ["Positionnement", "Plan de contenu", "Communication coordonnée"],
      cta: "Clarifier le message",
      image: "assets/photos/stock/brand-strategy-mockup.jpeg"
    }
  ]
};

const fallbackProductsByLocale = {
  en: [
    {
      id: "panettone-classico",
      handle: "panettone-classico",
      name: "Classic Panettone",
      collection: "Leavened Cakes",
      category: "Seasonal",
      price: 18,
      compareAtPrice: 22,
      image: "assets/photos/panettone.jpeg",
      gallery: ["assets/photos/panettone.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Artisanal panettone with candied fruit and raisins, fragrant and well balanced.",
      longDescription: "Slow leavening, soft texture and a clean aromatic profile. Designed for an Officina line that tells the most classic and recognisable side of the Nazzari signature.",
      ingredients: "Rice flour, butter, eggs, selected candied fruit, raisins, sugar, mother yeast.",
      shelfLife: "Store up to 20 days in a cool dry place.",
      shippingNote: "Protected packaging and shipping designed for gifting too.",
      badges: ["Best seller", "Gluten free"],
      featured: true,
      variants: [{ id: "local-panettone-classico-750g", title: "750 g", price: 18, compareAtPrice: 22, availableForSale: true }]
    },
    {
      id: "croissant-signature",
      handle: "croissant-signature",
      name: "Signature Croissant",
      collection: "Breakfast",
      category: "Display Counter",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/croissant.jpeg",
      gallery: ["assets/photos/croissant.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Golden laminated croissant with a clean, crisp structure.",
      longDescription: "Officina's breakfast line should communicate technical precision and immediate desirability. This product is the clearest reference for image, taste and recognisability.",
      ingredients: "Gluten-free flour mix, butter, milk, eggs, sugar, yeast.",
      shelfLife: "Consume within 48 hours or briefly refresh in the oven.",
      shippingNote: "Ideal for breakfast boxes or fast-shipping assortments.",
      badges: ["Officina signature", "Gluten free"],
      featured: true,
      variants: [
        { id: "local-croissant-signature-4", title: "Box of 4", price: 12, compareAtPrice: 14, availableForSale: true },
        { id: "local-croissant-signature-8", title: "Box of 8", price: 22, compareAtPrice: 26, availableForSale: true }
      ]
    },
    {
      id: "cookies-assortiti",
      handle: "cookies-assortiti",
      name: "Assorted Cookies",
      collection: "Cookies",
      category: "Snack",
      price: 9,
      compareAtPrice: 11,
      image: "assets/photos/cookies-assortiti.jpeg",
      gallery: ["assets/photos/cookies-assortiti.jpeg", "assets/photos/cioccolatino-fabio.jpeg", "assets/photos/crostata-frutti-misti.jpeg"],
      description: "Chocolate and pistachio cookie mix, crumbly and intense.",
      longDescription: "A collection designed for the shop: readable, versatile and perfect for boxes, bundles or seasonal launches.",
      ingredients: "Gluten-free flours, butter, brown sugar, dark chocolate, pistachio.",
      shelfLife: "Store up to 15 days in sealed packaging.",
      shippingNote: "Easy to ship, perfect for testing the gifting side of the shop.",
      badges: ["Easy box", "Gluten free"],
      featured: false,
      variants: [{ id: "local-cookies-assortiti-200g", title: "200 g", price: 9, compareAtPrice: 11, availableForSale: true }]
    },
    {
      id: "mignon-collezione",
      handle: "mignon-collezione",
      name: "Mignon Collection",
      collection: "Mignon",
      category: "Assortments",
      price: 24,
      compareAtPrice: 28,
      image: "assets/photos/mignon-assortiti.jpeg",
      gallery: ["assets/photos/mignon-assortiti.jpeg", "assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-limone.jpeg"],
      description: "Twelve assorted mignons designed for tasting, gifting and small occasions.",
      longDescription: "A selection that tells the most collectible side of Officina: more choice, more desire and more room for repeat purchases.",
      ingredients: "Assorted gluten-free preparations, creams, fruit and crisp bases.",
      shelfLife: "Store in the fridge and consume within 72 hours.",
      shippingNote: "Refrigerated shipping recommended or same-day pick-up.",
      badges: ["Collection", "Gluten free"],
      featured: true,
      variants: [
        { id: "local-mignon-collezione-12", title: "Box of 12", price: 24, compareAtPrice: 28, availableForSale: true },
        { id: "local-mignon-collezione-24", title: "Box of 24", price: 44, compareAtPrice: 50, availableForSale: true }
      ]
    },
    {
      id: "torta-frutti-di-bosco",
      handle: "torta-frutti-di-bosco",
      name: "Wild Berry Cake",
      collection: "Cakes",
      category: "Pastry",
      price: 28,
      compareAtPrice: 32,
      image: "assets/photos/torta-frutti-bosco.jpeg",
      gallery: ["assets/photos/torta-frutti-bosco.jpeg", "assets/photos/crostata-fragole.jpeg", "assets/photos/monoporzione-fragola.jpeg"],
      description: "Fresh wild berry cake with a clean structure and bright finish.",
      longDescription: "A made-to-order product that raises average order value and expands Officina toward a broader, more organised catalogue.",
      ingredients: "Gluten-free sponge cake, light cream, fresh wild berries.",
      shelfLife: "Store in the fridge and consume within 48 hours.",
      shippingNote: "Available for pick-up or dedicated delivery.",
      badges: ["Made to order", "Gluten free"],
      featured: false,
      variants: [
        { id: "local-torta-frutti-bosco-6", title: "6 portions", price: 28, compareAtPrice: 32, availableForSale: true },
        { id: "local-torta-frutti-bosco-10", title: "10 portions", price: 42, compareAtPrice: 48, availableForSale: true }
      ]
    },
    {
      id: "monoporzione-fragola",
      handle: "monoporzione-fragola",
      name: "Strawberry Single Serve",
      collection: "Single Serves",
      category: "Pastry",
      price: 6.5,
      compareAtPrice: 7.5,
      image: "assets/photos/monoporzione-fragola.jpeg",
      gallery: ["assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-fragola-piccola.jpeg", "assets/photos/monoporzione-arancio.jpeg"],
      description: "Tartlet with cream and fresh strawberry, precise and bright.",
      longDescription: "Designed for a more editorial digital display: small, desirable and easy to buy in boxes or mixed selections.",
      ingredients: "Gluten-free crisp base, cream, fresh strawberry, light glaze.",
      shelfLife: "Store in the fridge and consume within 48 hours.",
      shippingNote: "Perfect in refrigerated boxes or for store pick-up.",
      badges: ["New", "Gluten free"],
      featured: false,
      variants: [{ id: "local-monoporzione-fragola-standard", title: "Single piece", price: 6.5, compareAtPrice: 7.5, availableForSale: true }]
    },
    {
      id: "torta-cioccolato",
      handle: "torta-cioccolato",
      name: "Chocolate Cake",
      collection: "Cakes",
      category: "Chocolate",
      price: 22,
      compareAtPrice: 26,
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      gallery: ["assets/photos/torta-cioccolato-ganache.jpeg", "assets/photos/torta-cioccolato-piccola.jpeg", "assets/photos/cioccolatino-fabio.jpeg"],
      description: "Chocolate cake with glossy ganache and deep structure.",
      longDescription: "A perfect product card to tell depth, texture and the more premium positioning of the Officina line.",
      ingredients: "Dark chocolate, butter, eggs, sugar, gluten-free flours.",
      shelfLife: "Store up to 4 days in the fridge.",
      shippingNote: "Refrigerated delivery or dedicated pick-up recommended.",
      badges: ["Chocolate", "Gluten free"],
      featured: true,
      variants: [{ id: "local-torta-cioccolato-6", title: "6 portions", price: 22, compareAtPrice: 26, availableForSale: true }]
    },
    {
      id: "plumcake-cioccolato",
      handle: "plumcake-cioccolato",
      name: "Chocolate Plumcake",
      collection: "Pantry",
      category: "Breakfast",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/plumcake-cioccolato.jpeg",
      gallery: ["assets/photos/plumcake-cioccolato.jpeg", "assets/photos/dolce-crema.jpeg", "assets/photos/croissant-2.jpeg"],
      description: "Chocolate plumcake with walnuts, designed for the everyday side of the shop.",
      longDescription: "A pantry-line product: easy to understand, ship and repeat over time with seasonal variations.",
      ingredients: "Gluten-free flours, cocoa, chocolate, walnuts, eggs, sugar.",
      shelfLife: "Store up to 10 days in sealed packaging.",
      shippingNote: "Standard shipping, ideal for mixed orders.",
      badges: ["Pantry", "Gluten free"],
      featured: false,
      variants: [{ id: "local-plumcake-cioccolato-400g", title: "400 g", price: 12, compareAtPrice: 14, availableForSale: true }]
    }
  ],
  de: [
    {
      id: "panettone-classico",
      handle: "panettone-classico",
      name: "Klassischer Panettone",
      collection: "Große Hefeteige",
      category: "Saisonal",
      price: 18,
      compareAtPrice: 22,
      image: "assets/photos/panettone.jpeg",
      gallery: ["assets/photos/panettone.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Handwerklicher Panettone mit kandierten Früchten und Rosinen, duftig und ausgewogen.",
      longDescription: "Lange Teigführung, weiche Struktur und ein klares Aromaprofil. Gedacht für eine Officina-Linie, die die klassischste und erkennbarste Seite der Nazzari-Signatur erzählt.",
      ingredients: "Reismehl, Butter, Eier, ausgewählte kandierte Früchte, Rosinen, Zucker, Sauerteig.",
      shelfLife: "Bis zu 20 Tage kühl und trocken lagern.",
      shippingNote: "Geschützte Verpackung und Versand, auch für Geschenke gedacht.",
      badges: ["Bestseller", "Glutenfrei"],
      featured: true,
      variants: [{ id: "local-panettone-classico-750g", title: "750 g", price: 18, compareAtPrice: 22, availableForSale: true }]
    },
    {
      id: "croissant-signature",
      handle: "croissant-signature",
      name: "Signature-Croissant",
      collection: "Frühstück",
      category: "Theke",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/croissant.jpeg",
      gallery: ["assets/photos/croissant.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Goldenes Blättercroissant mit sauberer, knuspriger Struktur.",
      longDescription: "Die Frühstückslinie von Officina soll technische Präzision und sofortige Begehrlichkeit vermitteln. Dieses Produkt ist der natürlichste Bezugspunkt für Bild, Geschmack und Wiedererkennbarkeit.",
      ingredients: "Glutenfreie Mehlmischung, Butter, Milch, Eier, Zucker, Hefe.",
      shelfLife: "Innerhalb von 48 Stunden verzehren oder kurz im Ofen regenerieren.",
      shippingNote: "Ideal für Frühstücksboxen oder schnelle Versand-Assortments.",
      badges: ["Officina-Signatur", "Glutenfrei"],
      featured: true,
      variants: [
        { id: "local-croissant-signature-4", title: "Box mit 4", price: 12, compareAtPrice: 14, availableForSale: true },
        { id: "local-croissant-signature-8", title: "Box mit 8", price: 22, compareAtPrice: 26, availableForSale: true }
      ]
    },
    {
      id: "cookies-assortiti",
      handle: "cookies-assortiti",
      name: "Sortierte Cookies",
      collection: "Gebäck",
      category: "Snack",
      price: 9,
      compareAtPrice: 11,
      image: "assets/photos/cookies-assortiti.jpeg",
      gallery: ["assets/photos/cookies-assortiti.jpeg", "assets/photos/cioccolatino-fabio.jpeg", "assets/photos/crostata-frutti-misti.jpeg"],
      description: "Mix aus Schoko- und Pistaziencookies, mürbe und intensiv.",
      longDescription: "Eine Kollektion für den Shop: klar lesbar, vielseitig und perfekt für Boxen, Bundles oder saisonale Launches.",
      ingredients: "Glutenfreie Mehle, Butter, brauner Zucker, Zartbitterschokolade, Pistazie.",
      shelfLife: "Bis zu 15 Tage in geschlossener Verpackung lagern.",
      shippingNote: "Einfach zu versenden, perfekt zum Testen der Gifting-Seite des Shops.",
      badges: ["Einfache Box", "Glutenfrei"],
      featured: false,
      variants: [{ id: "local-cookies-assortiti-200g", title: "200 g", price: 9, compareAtPrice: 11, availableForSale: true }]
    },
    {
      id: "mignon-collezione",
      handle: "mignon-collezione",
      name: "Mignon-Kollektion",
      collection: "Mignon",
      category: "Assortments",
      price: 24,
      compareAtPrice: 28,
      image: "assets/photos/mignon-assortiti.jpeg",
      gallery: ["assets/photos/mignon-assortiti.jpeg", "assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-limone.jpeg"],
      description: "Zwölf assortierte Mignons für Verkostung, Geschenke und kleine Anlässe.",
      longDescription: "Eine Auswahl, die die sammelbarste Seite von Officina erzählt: mehr Auswahl, mehr Begehrlichkeit und mehr Raum für Wiederkäufe.",
      ingredients: "Assortierte glutenfreie Zubereitungen, Cremes, Früchte und mürbe Böden.",
      shelfLife: "Im Kühlschrank lagern und innerhalb von 72 Stunden verzehren.",
      shippingNote: "Gekühlter Versand oder Abholung am selben Tag empfohlen.",
      badges: ["Kollektion", "Glutenfrei"],
      featured: true,
      variants: [
        { id: "local-mignon-collezione-12", title: "Box mit 12", price: 24, compareAtPrice: 28, availableForSale: true },
        { id: "local-mignon-collezione-24", title: "Box mit 24", price: 44, compareAtPrice: 50, availableForSale: true }
      ]
    },
    {
      id: "torta-frutti-di-bosco",
      handle: "torta-frutti-di-bosco",
      name: "Waldbeeren-Torte",
      collection: "Torten",
      category: "Patisserie",
      price: 28,
      compareAtPrice: 32,
      image: "assets/photos/torta-frutti-bosco.jpeg",
      gallery: ["assets/photos/torta-frutti-bosco.jpeg", "assets/photos/crostata-fragole.jpeg", "assets/photos/monoporzione-fragola.jpeg"],
      description: "Frische Waldbeeren-Torte mit klarer Struktur und brillantem Finish.",
      longDescription: "Ein Produkt auf Bestellung, das den Durchschnittswert des Warenkorbs erhöht und Officina in Richtung eines breiteren und geordneteren Katalogs bringt.",
      ingredients: "Glutenfreier Biskuit, leichte Creme, frische Waldbeeren.",
      shelfLife: "Im Kühlschrank lagern und innerhalb von 48 Stunden verzehren.",
      shippingNote: "Für Abholung oder dedizierte Lieferung verfügbar.",
      badges: ["Auf Bestellung", "Glutenfrei"],
      featured: false,
      variants: [
        { id: "local-torta-frutti-bosco-6", title: "6 Portionen", price: 28, compareAtPrice: 32, availableForSale: true },
        { id: "local-torta-frutti-bosco-10", title: "10 Portionen", price: 42, compareAtPrice: 48, availableForSale: true }
      ]
    },
    {
      id: "monoporzione-fragola",
      handle: "monoporzione-fragola",
      name: "Erdbeer-Einzelportion",
      collection: "Einzelportionen",
      category: "Patisserie",
      price: 6.5,
      compareAtPrice: 7.5,
      image: "assets/photos/monoporzione-fragola.jpeg",
      gallery: ["assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-fragola-piccola.jpeg", "assets/photos/monoporzione-arancio.jpeg"],
      description: "Tartelett mit Creme und frischer Erdbeere, präzise und leuchtend.",
      longDescription: "Gedacht für eine editoriale digitale Vitrine: klein, begehrlich und sofort in Boxen oder Mix-Auswahlen kaufbar.",
      ingredients: "Glutenfreier Mürbeboden, Creme, frische Erdbeere, leichte Glasur.",
      shelfLife: "Im Kühlschrank lagern und innerhalb von 48 Stunden verzehren.",
      shippingNote: "Perfekt für gekühlte Boxen oder Abholung im Laden.",
      badges: ["Neu", "Glutenfrei"],
      featured: false,
      variants: [{ id: "local-monoporzione-fragola-standard", title: "Einzelstück", price: 6.5, compareAtPrice: 7.5, availableForSale: true }]
    },
    {
      id: "torta-cioccolato",
      handle: "torta-cioccolato",
      name: "Schokoladentorte",
      collection: "Torten",
      category: "Schokolade",
      price: 22,
      compareAtPrice: 26,
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      gallery: ["assets/photos/torta-cioccolato-ganache.jpeg", "assets/photos/torta-cioccolato-piccola.jpeg", "assets/photos/cioccolatino-fabio.jpeg"],
      description: "Schokoladentorte mit glänzender Ganache und intensiver Struktur.",
      longDescription: "Eine perfekte Produktkarte, um Tiefe, Textur und das premiumhafte Positioning der Officina-Linie zu erzählen.",
      ingredients: "Zartbitterschokolade, Butter, Eier, Zucker, glutenfreie Mehle.",
      shelfLife: "Bis zu 4 Tage im Kühlschrank lagern.",
      shippingNote: "Gekühlte Lieferung oder dedizierte Abholung empfohlen.",
      badges: ["Schokolade", "Glutenfrei"],
      featured: true,
      variants: [{ id: "local-torta-cioccolato-6", title: "6 Portionen", price: 22, compareAtPrice: 26, availableForSale: true }]
    },
    {
      id: "plumcake-cioccolato",
      handle: "plumcake-cioccolato",
      name: "Schokoladen-Plumcake",
      collection: "Vorrat",
      category: "Frühstück",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/plumcake-cioccolato.jpeg",
      gallery: ["assets/photos/plumcake-cioccolato.jpeg", "assets/photos/dolce-crema.jpeg", "assets/photos/croissant-2.jpeg"],
      description: "Schokoladen-Plumcake mit Walnüssen für die alltagstaugliche Seite des Shops.",
      longDescription: "Ein Produkt für die Vorratslinie: leicht zu lesen, zu versenden und über die Zeit mit saisonalen Varianten zu wiederholen.",
      ingredients: "Glutenfreie Mehle, Kakao, Schokolade, Walnüsse, Eier, Zucker.",
      shelfLife: "Bis zu 10 Tage in geschlossener Verpackung lagern.",
      shippingNote: "Standardversand, ideal für gemischte Bestellungen.",
      badges: ["Vorrat", "Glutenfrei"],
      featured: false,
      variants: [{ id: "local-plumcake-cioccolato-400g", title: "400 g", price: 12, compareAtPrice: 14, availableForSale: true }]
    }
  ],
  nl: [
    {
      id: "panettone-classico",
      handle: "panettone-classico",
      name: "Klassieke Panettone",
      collection: "Gerezen Cakes",
      category: "Seizoensproducten",
      price: 18,
      compareAtPrice: 22,
      image: "assets/photos/panettone.jpeg",
      gallery: ["assets/photos/panettone.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Ambachtelijke panettone met gekonfijt fruit en rozijnen, geurig en in balans.",
      longDescription: "Langzame rijzing, zachte structuur en een helder aromatisch profiel. Ontworpen voor een Officina-lijn die de meest klassieke en herkenbare kant van de Nazzari-signatuur vertelt.",
      ingredients: "Rijstmeel, boter, eieren, geselecteerd gekonfijt fruit, rozijnen, suiker, desem.",
      shelfLife: "Tot 20 dagen bewaren op een koele droge plaats.",
      shippingNote: "Beschermde verpakking en verzending, ook geschikt voor gifting.",
      badges: ["Best seller", "Glutenvrij"],
      featured: true,
      variants: [{ id: "local-panettone-classico-750g", title: "750 g", price: 18, compareAtPrice: 22, availableForSale: true }]
    },
    {
      id: "croissant-signature",
      handle: "croissant-signature",
      name: "Signature Croissant",
      collection: "Ontbijt",
      category: "Toonbank",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/croissant.jpeg",
      gallery: ["assets/photos/croissant.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Gouden gelamineerde croissant met een zuivere, krokante structuur.",
      longDescription: "De ontbijtlijn van Officina moet technische precisie en directe aantrekkingskracht vertellen. Dit product is het duidelijkste referentiepunt voor beeld, smaak en herkenbaarheid.",
      ingredients: "Glutenvrije bloemmix, boter, melk, eieren, suiker, gist.",
      shelfLife: "Binnen 48 uur consumeren of kort regenereren in de oven.",
      shippingNote: "Ideaal voor ontbijtboxen of snelle verzendassortimenten.",
      badges: ["Officina signature", "Glutenvrij"],
      featured: true,
      variants: [
        { id: "local-croissant-signature-4", title: "Box van 4", price: 12, compareAtPrice: 14, availableForSale: true },
        { id: "local-croissant-signature-8", title: "Box van 8", price: 22, compareAtPrice: 26, availableForSale: true }
      ]
    },
    {
      id: "cookies-assortiti",
      handle: "cookies-assortiti",
      name: "Assorti Cookies",
      collection: "Koekjes",
      category: "Snack",
      price: 9,
      compareAtPrice: 11,
      image: "assets/photos/cookies-assortiti.jpeg",
      gallery: ["assets/photos/cookies-assortiti.jpeg", "assets/photos/cioccolatino-fabio.jpeg", "assets/photos/crostata-frutti-misti.jpeg"],
      description: "Mix van chocolade- en pistachecookies, bros en intens.",
      longDescription: "Een collectie voor de shop: duidelijk, veelzijdig en perfect voor boxen, bundles of seizoenslanceringen.",
      ingredients: "Glutenvrije meelsoorten, boter, bruine suiker, pure chocolade, pistache.",
      shelfLife: "Tot 15 dagen bewaren in gesloten verpakking.",
      shippingNote: "Eenvoudig te verzenden, perfect om de gifting-kant van de shop te testen.",
      badges: ["Makkelijke box", "Glutenvrij"],
      featured: false,
      variants: [{ id: "local-cookies-assortiti-200g", title: "200 g", price: 9, compareAtPrice: 11, availableForSale: true }]
    },
    {
      id: "mignon-collezione",
      handle: "mignon-collezione",
      name: "Mignon Collectie",
      collection: "Mignon",
      category: "Assortimenten",
      price: 24,
      compareAtPrice: 28,
      image: "assets/photos/mignon-assortiti.jpeg",
      gallery: ["assets/photos/mignon-assortiti.jpeg", "assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-limone.jpeg"],
      description: "Twaalf assorti mignons voor tasting, gifting en kleine gelegenheden.",
      longDescription: "Een selectie die de meest verzamelbare kant van Officina vertelt: meer keuze, meer verlangen en meer ruimte voor terugkerende aankopen.",
      ingredients: "Assorti glutenvrije bereidingen, crèmes, fruit en krokante bases.",
      shelfLife: "Bewaren in de koelkast en binnen 72 uur consumeren.",
      shippingNote: "Gekoelde verzending of afhalen op dezelfde dag aanbevolen.",
      badges: ["Collectie", "Glutenvrij"],
      featured: true,
      variants: [
        { id: "local-mignon-collezione-12", title: "Box van 12", price: 24, compareAtPrice: 28, availableForSale: true },
        { id: "local-mignon-collezione-24", title: "Box van 24", price: 44, compareAtPrice: 50, availableForSale: true }
      ]
    },
    {
      id: "torta-frutti-di-bosco",
      handle: "torta-frutti-di-bosco",
      name: "Bosvruchtentaart",
      collection: "Taarten",
      category: "Patisserie",
      price: 28,
      compareAtPrice: 32,
      image: "assets/photos/torta-frutti-bosco.jpeg",
      gallery: ["assets/photos/torta-frutti-bosco.jpeg", "assets/photos/crostata-fragole.jpeg", "assets/photos/monoporzione-fragola.jpeg"],
      description: "Verse bosvruchtentaart met een zuivere structuur en heldere finish.",
      longDescription: "Een made-to-order product dat de gemiddelde orderwaarde verhoogt en Officina richting een bredere en beter georganiseerde catalogus brengt.",
      ingredients: "Glutenvrij biscuit, lichte crème, verse bosvruchten.",
      shelfLife: "Bewaren in de koelkast en binnen 48 uur consumeren.",
      shippingNote: "Beschikbaar voor afhalen of speciale levering.",
      badges: ["Op bestelling", "Glutenvrij"],
      featured: false,
      variants: [
        { id: "local-torta-frutti-bosco-6", title: "6 porties", price: 28, compareAtPrice: 32, availableForSale: true },
        { id: "local-torta-frutti-bosco-10", title: "10 porties", price: 42, compareAtPrice: 48, availableForSale: true }
      ]
    },
    {
      id: "monoporzione-fragola",
      handle: "monoporzione-fragola",
      name: "Aardbei Single Serve",
      collection: "Monoporsies",
      category: "Patisserie",
      price: 6.5,
      compareAtPrice: 7.5,
      image: "assets/photos/monoporzione-fragola.jpeg",
      gallery: ["assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-fragola-piccola.jpeg", "assets/photos/monoporzione-arancio.jpeg"],
      description: "Tartelett met crème en verse aardbei, precies en helder.",
      longDescription: "Bedoeld voor een meer editoriale digitale vitrine: klein, begeerlijk en direct te kopen in boxen of gemengde selecties.",
      ingredients: "Glutenvrije krokante bodem, crème, verse aardbei, lichte glazuurlaag.",
      shelfLife: "Bewaren in de koelkast en binnen 48 uur consumeren.",
      shippingNote: "Perfect in gekoelde boxen of voor afhalen in de winkel.",
      badges: ["Nieuw", "Glutenvrij"],
      featured: false,
      variants: [{ id: "local-monoporzione-fragola-standard", title: "Per stuk", price: 6.5, compareAtPrice: 7.5, availableForSale: true }]
    },
    {
      id: "torta-cioccolato",
      handle: "torta-cioccolato",
      name: "Chocoladetaart",
      collection: "Taarten",
      category: "Chocolade",
      price: 22,
      compareAtPrice: 26,
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      gallery: ["assets/photos/torta-cioccolato-ganache.jpeg", "assets/photos/torta-cioccolato-piccola.jpeg", "assets/photos/cioccolatino-fabio.jpeg"],
      description: "Chocoladetaart met glanzende ganache en intense structuur.",
      longDescription: "Een perfecte productkaart om diepte, textuur en de meer premium positionering van de Officina-lijn te vertellen.",
      ingredients: "Pure chocolade, boter, eieren, suiker, glutenvrije meelsoorten.",
      shelfLife: "Tot 4 dagen bewaren in de koelkast.",
      shippingNote: "Gekoelde levering of speciale afhaling aanbevolen.",
      badges: ["Chocolade", "Glutenvrij"],
      featured: true,
      variants: [{ id: "local-torta-cioccolato-6", title: "6 porties", price: 22, compareAtPrice: 26, availableForSale: true }]
    },
    {
      id: "plumcake-cioccolato",
      handle: "plumcake-cioccolato",
      name: "Chocolade Plumcake",
      collection: "Voorraadkast",
      category: "Ontbijt",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/plumcake-cioccolato.jpeg",
      gallery: ["assets/photos/plumcake-cioccolato.jpeg", "assets/photos/dolce-crema.jpeg", "assets/photos/croissant-2.jpeg"],
      description: "Chocoladeplumcake met walnoten, ontworpen voor de dagelijkse kant van de shop.",
      longDescription: "Een voorraadkastproduct: makkelijk te begrijpen, te verzenden en op termijn te herhalen met seizoensvarianten.",
      ingredients: "Glutenvrije meelsoorten, cacao, chocolade, walnoten, eieren, suiker.",
      shelfLife: "Tot 10 dagen bewaren in gesloten verpakking.",
      shippingNote: "Standaard verzending, ideaal voor gemengde bestellingen.",
      badges: ["Voorraadkast", "Glutenvrij"],
      featured: false,
      variants: [{ id: "local-plumcake-cioccolato-400g", title: "400 g", price: 12, compareAtPrice: 14, availableForSale: true }]
    }
  ],
  es: [
    {
      id: "panettone-classico",
      handle: "panettone-classico",
      name: "Panettone Clásico",
      collection: "Grandes Fermentaciones",
      category: "Estacionales",
      price: 18,
      compareAtPrice: 22,
      image: "assets/photos/panettone.jpeg",
      gallery: ["assets/photos/panettone.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Panettone artesanal con fruta confitada y pasas, fragante y equilibrado.",
      longDescription: "Fermentación lenta, estructura suave y un perfil aromático limpio. Pensado para una línea Officina que cuente el lado más clásico y reconocible de la firma Nazzari.",
      ingredients: "Harina de arroz, mantequilla, huevos, fruta confitada seleccionada, pasas, azúcar, masa madre.",
      shelfLife: "Conservar hasta 20 días en un lugar fresco y seco.",
      shippingNote: "Embalaje protegido y envío pensado también para gifting.",
      badges: ["Best seller", "Sin gluten"],
      featured: true,
      variants: [{ id: "local-panettone-classico-750g", title: "750 g", price: 18, compareAtPrice: 22, availableForSale: true }]
    },
    {
      id: "croissant-signature",
      handle: "croissant-signature",
      name: "Croissant Signature",
      collection: "Desayuno",
      category: "Mostrador",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/croissant.jpeg",
      gallery: ["assets/photos/croissant.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Croissant hojaldrado y dorado con una laminación limpia y crujiente.",
      longDescription: "La línea desayuno de Officina debe contar precisión técnica y deseabilidad inmediata. Este producto es la referencia más clara en imagen, sabor y reconocimiento.",
      ingredients: "Mix de harinas sin gluten, mantequilla, leche, huevos, azúcar, levadura.",
      shelfLife: "Consumir en 48 horas o regenerar brevemente en el horno.",
      shippingNote: "Ideal para boxes desayuno o surtidos de envío rápido.",
      badges: ["Firma Officina", "Sin gluten"],
      featured: true,
      variants: [
        { id: "local-croissant-signature-4", title: "Box de 4", price: 12, compareAtPrice: 14, availableForSale: true },
        { id: "local-croissant-signature-8", title: "Box de 8", price: 22, compareAtPrice: 26, availableForSale: true }
      ]
    },
    {
      id: "cookies-assortiti",
      handle: "cookies-assortiti",
      name: "Cookies Surtidas",
      collection: "Galletas",
      category: "Snack",
      price: 9,
      compareAtPrice: 11,
      image: "assets/photos/cookies-assortiti.jpeg",
      gallery: ["assets/photos/cookies-assortiti.jpeg", "assets/photos/cioccolatino-fabio.jpeg", "assets/photos/crostata-frutti-misti.jpeg"],
      description: "Mix de cookies de chocolate y pistacho, crujientes e intensas.",
      longDescription: "Una colección pensada para la tienda: legible, versátil y perfecta para boxes, bundles o lanzamientos estacionales.",
      ingredients: "Harinas sin gluten, mantequilla, azúcar moreno, chocolate negro, pistacho.",
      shelfLife: "Conservar hasta 15 días en envase cerrado.",
      shippingNote: "Envío sencillo, perfecto para probar la parte gifting de la tienda.",
      badges: ["Box fácil", "Sin gluten"],
      featured: false,
      variants: [{ id: "local-cookies-assortiti-200g", title: "200 g", price: 9, compareAtPrice: 11, availableForSale: true }]
    },
    {
      id: "mignon-collezione",
      handle: "mignon-collezione",
      name: "Colección Mignon",
      collection: "Mignon",
      category: "Surtidos",
      price: 24,
      compareAtPrice: 28,
      image: "assets/photos/mignon-assortiti.jpeg",
      gallery: ["assets/photos/mignon-assortiti.jpeg", "assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-limone.jpeg"],
      description: "Doce mignones surtidos pensados para degustación, gifting y pequeñas ocasiones.",
      longDescription: "Una selección que cuenta la parte más coleccionable de Officina: más elección, más deseo y más posibilidad de compra recurrente.",
      ingredients: "Preparaciones surtidas sin gluten, cremas, fruta y bases crujientes.",
      shelfLife: "Conservar en frigorífico y consumir en 72 horas.",
      shippingNote: "Se recomienda envío refrigerado o recogida el mismo día.",
      badges: ["Colección", "Sin gluten"],
      featured: true,
      variants: [
        { id: "local-mignon-collezione-12", title: "Box de 12", price: 24, compareAtPrice: 28, availableForSale: true },
        { id: "local-mignon-collezione-24", title: "Box de 24", price: 44, compareAtPrice: 50, availableForSale: true }
      ]
    },
    {
      id: "torta-frutti-di-bosco",
      handle: "torta-frutti-di-bosco",
      name: "Tarta de Frutos del Bosque",
      collection: "Tartas",
      category: "Pastelería",
      price: 28,
      compareAtPrice: 32,
      image: "assets/photos/torta-frutti-bosco.jpeg",
      gallery: ["assets/photos/torta-frutti-bosco.jpeg", "assets/photos/crostata-fragole.jpeg", "assets/photos/monoporzione-fragola.jpeg"],
      description: "Tarta fresca de frutos del bosque con estructura limpia y final brillante.",
      longDescription: "Producto bajo pedido que eleva el valor medio del carrito y lleva a Officina hacia un catálogo más amplio y ordenado.",
      ingredients: "Bizcocho sin gluten, crema ligera, frutos del bosque frescos.",
      shelfLife: "Conservar en frigorífico y consumir en 48 horas.",
      shippingNote: "Disponible para recogida o entrega dedicada.",
      badges: ["Bajo pedido", "Sin gluten"],
      featured: false,
      variants: [
        { id: "local-torta-frutti-bosco-6", title: "6 porciones", price: 28, compareAtPrice: 32, availableForSale: true },
        { id: "local-torta-frutti-bosco-10", title: "10 porciones", price: 42, compareAtPrice: 48, availableForSale: true }
      ]
    },
    {
      id: "monoporzione-fragola",
      handle: "monoporzione-fragola",
      name: "Monoporción de Fresa",
      collection: "Monoporciones",
      category: "Pastelería",
      price: 6.5,
      compareAtPrice: 7.5,
      image: "assets/photos/monoporzione-fragola.jpeg",
      gallery: ["assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-fragola-piccola.jpeg", "assets/photos/monoporzione-arancio.jpeg"],
      description: "Tartaleta con crema y fresa fresca, precisa y luminosa.",
      longDescription: "Pensada para una vitrina digital más editorial: pequeña, deseable e inmediata de comprar en box o selecciones mixtas.",
      ingredients: "Base crujiente sin gluten, crema, fresa fresca, glaseado ligero.",
      shelfLife: "Conservar en frigorífico y consumir en 48 horas.",
      shippingNote: "Perfecta en box refrigeradas o para recogida en tienda.",
      badges: ["Novedad", "Sin gluten"],
      featured: false,
      variants: [{ id: "local-monoporzione-fragola-standard", title: "Pieza individual", price: 6.5, compareAtPrice: 7.5, availableForSale: true }]
    },
    {
      id: "torta-cioccolato",
      handle: "torta-cioccolato",
      name: "Tarta de Chocolate",
      collection: "Tartas",
      category: "Chocolate",
      price: 22,
      compareAtPrice: 26,
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      gallery: ["assets/photos/torta-cioccolato-ganache.jpeg", "assets/photos/torta-cioccolato-piccola.jpeg", "assets/photos/cioccolatino-fabio.jpeg"],
      description: "Tarta de chocolate con ganache brillante y estructura intensa.",
      longDescription: "Una ficha de producto perfecta para contar profundidad, textura y el posicionamiento más premium de la línea Officina.",
      ingredients: "Chocolate negro, mantequilla, huevos, azúcar, harinas sin gluten.",
      shelfLife: "Conservar hasta 4 días en frigorífico.",
      shippingNote: "Se recomienda entrega refrigerada o recogida dedicada.",
      badges: ["Chocolate", "Sin gluten"],
      featured: true,
      variants: [{ id: "local-torta-cioccolato-6", title: "6 porciones", price: 22, compareAtPrice: 26, availableForSale: true }]
    },
    {
      id: "plumcake-cioccolato",
      handle: "plumcake-cioccolato",
      name: "Plumcake de Chocolate",
      collection: "Despensa",
      category: "Desayuno",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/plumcake-cioccolato.jpeg",
      gallery: ["assets/photos/plumcake-cioccolato.jpeg", "assets/photos/dolce-crema.jpeg", "assets/photos/croissant-2.jpeg"],
      description: "Plumcake de chocolate con nueces, pensado para la parte más cotidiana de la tienda.",
      longDescription: "Producto ideal para una línea de despensa: fácil de leer, de enviar y de repetir en el tiempo con variantes estacionales.",
      ingredients: "Harinas sin gluten, cacao, chocolate, nueces, huevos, azúcar.",
      shelfLife: "Conservar hasta 10 días en envase cerrado.",
      shippingNote: "Envío estándar, ideal para pedidos mixtos.",
      badges: ["Despensa", "Sin gluten"],
      featured: false,
      variants: [{ id: "local-plumcake-cioccolato-400g", title: "400 g", price: 12, compareAtPrice: 14, availableForSale: true }]
    }
  ],
  fr: [
    {
      id: "panettone-classico",
      handle: "panettone-classico",
      name: "Panettone Classique",
      collection: "Grands Levés",
      category: "Saisonnier",
      price: 18,
      compareAtPrice: 22,
      image: "assets/photos/panettone.jpeg",
      gallery: ["assets/photos/panettone.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Panettone artisanal aux fruits confits et raisins, parfumé et équilibré.",
      longDescription: "Levée lente, structure souple et profil aromatique net. Pensé pour une ligne Officina qui raconte le côté le plus classique et reconnaissable de la signature Nazzari.",
      ingredients: "Farine de riz, beurre, œufs, fruits confits sélectionnés, raisins, sucre, levain.",
      shelfLife: "À conserver jusqu'à 20 jours dans un endroit frais et sec.",
      shippingNote: "Emballage protégé et expédition pensée aussi pour le gifting.",
      badges: ["Best seller", "Sans gluten"],
      featured: true,
      variants: [{ id: "local-panettone-classico-750g", title: "750 g", price: 18, compareAtPrice: 22, availableForSale: true }]
    },
    {
      id: "croissant-signature",
      handle: "croissant-signature",
      name: "Croissant Signature",
      collection: "Petit-déjeuner",
      category: "Vitrine",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/croissant.jpeg",
      gallery: ["assets/photos/croissant.jpeg", "assets/photos/croissant-2.jpeg", "assets/photos/dolce-crema.jpeg"],
      description: "Croissant feuilleté et doré, avec un laminage net et croustillant.",
      longDescription: "La ligne petit-déjeuner d'Officina doit raconter précision technique et désir immédiat. Ce produit est la référence la plus naturelle en image, goût et reconnaissance.",
      ingredients: "Mélange de farines sans gluten, beurre, lait, œufs, sucre, levure.",
      shelfLife: "À consommer dans les 48 heures ou à régénérer brièvement au four.",
      shippingNote: "Idéal pour les box petit-déjeuner ou les assortiments à expédition rapide.",
      badges: ["Signature Officina", "Sans gluten"],
      featured: true,
      variants: [
        { id: "local-croissant-signature-4", title: "Boîte de 4", price: 12, compareAtPrice: 14, availableForSale: true },
        { id: "local-croissant-signature-8", title: "Boîte de 8", price: 22, compareAtPrice: 26, availableForSale: true }
      ]
    },
    {
      id: "cookies-assortiti",
      handle: "cookies-assortiti",
      name: "Cookies Assortis",
      collection: "Biscuiterie",
      category: "Snack",
      price: 9,
      compareAtPrice: 11,
      image: "assets/photos/cookies-assortiti.jpeg",
      gallery: ["assets/photos/cookies-assortiti.jpeg", "assets/photos/cioccolatino-fabio.jpeg", "assets/photos/crostata-frutti-misti.jpeg"],
      description: "Mélange de cookies chocolat et pistache, friables et intenses.",
      longDescription: "Une collection pensée pour la boutique : lisible, polyvalente et parfaite pour les box, bundles ou lancements saisonniers.",
      ingredients: "Farines sans gluten, beurre, sucre brun, chocolat noir, pistache.",
      shelfLife: "À conserver jusqu'à 15 jours en emballage fermé.",
      shippingNote: "Expédition simple, parfaite pour tester la dimension gifting de la boutique.",
      badges: ["Box facile", "Sans gluten"],
      featured: false,
      variants: [{ id: "local-cookies-assortiti-200g", title: "200 g", price: 9, compareAtPrice: 11, availableForSale: true }]
    },
    {
      id: "mignon-collezione",
      handle: "mignon-collezione",
      name: "Collection Mignon",
      collection: "Mignon",
      category: "Assortiments",
      price: 24,
      compareAtPrice: 28,
      image: "assets/photos/mignon-assortiti.jpeg",
      gallery: ["assets/photos/mignon-assortiti.jpeg", "assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-limone.jpeg"],
      description: "Douze mignardises assorties pensées pour la dégustation, le gifting et les petites occasions.",
      longDescription: "Une sélection qui raconte la facette la plus collectionnable d'Officina : plus de choix, plus de désir et plus de possibilités d'achat récurrent.",
      ingredients: "Préparations assorties sans gluten, crèmes, fruits et bases croustillantes.",
      shelfLife: "À conserver au réfrigérateur et à consommer dans les 72 heures.",
      shippingNote: "Expédition réfrigérée recommandée ou retrait dans la journée.",
      badges: ["Collection", "Sans gluten"],
      featured: true,
      variants: [
        { id: "local-mignon-collezione-12", title: "Boîte de 12", price: 24, compareAtPrice: 28, availableForSale: true },
        { id: "local-mignon-collezione-24", title: "Boîte de 24", price: 44, compareAtPrice: 50, availableForSale: true }
      ]
    },
    {
      id: "torta-frutti-di-bosco",
      handle: "torta-frutti-di-bosco",
      name: "Tarte Fruits Rouges",
      collection: "Gâteaux",
      category: "Pâtisserie",
      price: 28,
      compareAtPrice: 32,
      image: "assets/photos/torta-frutti-bosco.jpeg",
      gallery: ["assets/photos/torta-frutti-bosco.jpeg", "assets/photos/crostata-fragole.jpeg", "assets/photos/monoporzione-fragola.jpeg"],
      description: "Tarte fraîche aux fruits rouges avec structure nette et finale brillante.",
      longDescription: "Produit sur commande qui augmente la valeur moyenne du panier et amène Officina vers un catalogue plus large et plus ordonné.",
      ingredients: "Génoise sans gluten, crème légère, fruits rouges frais.",
      shelfLife: "À conserver au réfrigérateur et à consommer dans les 48 heures.",
      shippingNote: "Disponible en retrait ou en livraison dédiée.",
      badges: ["Sur commande", "Sans gluten"],
      featured: false,
      variants: [
        { id: "local-torta-frutti-bosco-6", title: "6 parts", price: 28, compareAtPrice: 32, availableForSale: true },
        { id: "local-torta-frutti-bosco-10", title: "10 parts", price: 42, compareAtPrice: 48, availableForSale: true }
      ]
    },
    {
      id: "monoporzione-fragola",
      handle: "monoporzione-fragola",
      name: "Monopart Fraise",
      collection: "Monoparts",
      category: "Pâtisserie",
      price: 6.5,
      compareAtPrice: 7.5,
      image: "assets/photos/monoporzione-fragola.jpeg",
      gallery: ["assets/photos/monoporzione-fragola.jpeg", "assets/photos/monoporzione-fragola-piccola.jpeg", "assets/photos/monoporzione-arancio.jpeg"],
      description: "Tartelette à la crème et à la fraise fraîche, précise et lumineuse.",
      longDescription: "Pensée pour une vitrine digitale plus éditoriale : petite, désirable et immédiate à acheter en box ou en sélections mixtes.",
      ingredients: "Base croustillante sans gluten, crème, fraise fraîche, glaçage léger.",
      shelfLife: "À conserver au réfrigérateur et à consommer dans les 48 heures.",
      shippingNote: "Parfaite en box réfrigérées ou en retrait boutique.",
      badges: ["Nouveau", "Sans gluten"],
      featured: false,
      variants: [{ id: "local-monoporzione-fragola-standard", title: "Pièce unitaire", price: 6.5, compareAtPrice: 7.5, availableForSale: true }]
    },
    {
      id: "torta-cioccolato",
      handle: "torta-cioccolato",
      name: "Gâteau au Chocolat",
      collection: "Gâteaux",
      category: "Chocolat",
      price: 22,
      compareAtPrice: 26,
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      gallery: ["assets/photos/torta-cioccolato-ganache.jpeg", "assets/photos/torta-cioccolato-piccola.jpeg", "assets/photos/cioccolatino-fabio.jpeg"],
      description: "Gâteau au chocolat avec ganache brillante et structure intense.",
      longDescription: "Une fiche produit parfaite pour raconter profondeur, texture et positionnement plus premium de la ligne Officina.",
      ingredients: "Chocolat noir, beurre, œufs, sucre, farines sans gluten.",
      shelfLife: "À conserver jusqu'à 4 jours au réfrigérateur.",
      shippingNote: "Livraison réfrigérée ou retrait dédié conseillé.",
      badges: ["Chocolat", "Sans gluten"],
      featured: true,
      variants: [{ id: "local-torta-cioccolato-6", title: "6 parts", price: 22, compareAtPrice: 26, availableForSale: true }]
    },
    {
      id: "plumcake-cioccolato",
      handle: "plumcake-cioccolato",
      name: "Plumcake Chocolat",
      collection: "Épicerie",
      category: "Petit-déjeuner",
      price: 12,
      compareAtPrice: 14,
      image: "assets/photos/plumcake-cioccolato.jpeg",
      gallery: ["assets/photos/plumcake-cioccolato.jpeg", "assets/photos/dolce-crema.jpeg", "assets/photos/croissant-2.jpeg"],
      description: "Plumcake au chocolat et noix pensé pour la partie la plus quotidienne de la boutique.",
      longDescription: "Produit adapté à une ligne épicerie : simple à lire, à expédier et à répéter dans le temps avec des variantes saisonnières.",
      ingredients: "Farines sans gluten, cacao, chocolat, noix, œufs, sucre.",
      shelfLife: "À conserver jusqu'à 10 jours en emballage fermé.",
      shippingNote: "Expédition standard, idéale pour les commandes mixtes.",
      badges: ["Épicerie", "Sans gluten"],
      featured: false,
      variants: [{ id: "local-plumcake-cioccolato-400g", title: "400 g", price: 12, compareAtPrice: 14, availableForSale: true }]
    }
  ]
};

const b2bClientSegmentsByLocale = {
  en: [
    { id: "bar-caffetterie", label: "Bars and coffee shops", note: "Breakfast, counter and quick service." },
    { id: "ristorazione", label: "Restaurants and hospitality", note: "Breakfast, desserts and service formats." },
    { id: "catering-eventi", label: "Catering and events", note: "Mignons, cakes and solutions for variable volumes." },
    { id: "negozi-rivendite", label: "Stores and resellers", note: "Recurring references, gifting and seasonal lines." }
  ],
  de: [
    { id: "bar-caffetterie", label: "Bars und Cafés", note: "Frühstück, Theke und schneller Service." },
    { id: "ristorazione", label: "Gastronomie und Hotellerie", note: "Frühstück, Desserts und Serviceformate." },
    { id: "catering-eventi", label: "Catering und Events", note: "Mignons, Torten und Lösungen für variable Mengen." },
    { id: "negozi-rivendite", label: "Geschäfte und Wiederverkäufer", note: "Laufende Referenzen, Gifting und saisonale Linien." }
  ],
  nl: [
    { id: "bar-caffetterie", label: "Bars en koffiezaken", note: "Ontbijt, toonbank en snelle service." },
    { id: "ristorazione", label: "Restaurants en hospitality", note: "Ontbijt, desserts en serviceformaten." },
    { id: "catering-eventi", label: "Catering en events", note: "Mignons, taarten en oplossingen voor variabele volumes." },
    { id: "negozi-rivendite", label: "Winkels en resellers", note: "Doorlopende referenties, gifting en seizoenslijnen." }
  ],
  es: [
    { id: "bar-caffetterie", label: "Bares y cafeterías", note: "Desayuno, mostrador y servicio rápido." },
    { id: "ristorazione", label: "Restauración y hospitality", note: "Desayuno, postres y formatos para servicio." },
    { id: "catering-eventi", label: "Catering y eventos", note: "Mignones, tartas y soluciones para volúmenes variables." },
    { id: "negozi-rivendite", label: "Tiendas y distribuidores", note: "Referencias recurrentes, gifting y líneas estacionales." }
  ],
  fr: [
    { id: "bar-caffetterie", label: "Bars et coffee shops", note: "Petit-déjeuner, comptoir et service rapide." },
    { id: "ristorazione", label: "Restauration et hospitality", note: "Petit-déjeuner, desserts et formats de service." },
    { id: "catering-eventi", label: "Catering et événements", note: "Mignardises, gâteaux et solutions pour volumes variables." },
    { id: "negozi-rivendite", label: "Boutiques et revendeurs", note: "Références récurrentes, gifting et lignes saisonnières." }
  ]
};

const b2bCatalogByLocale = {
  en: [
    {
      id: "b2b-croissant-signature",
      title: "Croissants and breakfast",
      family: "Breakfast",
      audience: "Breakfast menu, recurring counter, room service",
      clients: ["Bars and coffee shops", "Restaurants and hospitality", "Stores and resellers"],
      image: "assets/photos/croissant.jpeg",
      description: "Counter croissants and breakfast products for coffee shops, hospitality and premium-facing brands.",
      format: "Scheduled supply / quotation on request",
      badges: ["High rotation", "Breakfast line"]
    },
    {
      id: "b2b-biscotteria-sfusa",
      title: "Loose tea-time biscuits",
      family: "Cookies",
      audience: "Tea time, coffee break, small counter proposal",
      clients: ["Bars and coffee shops", "Restaurants and hospitality", "Catering and events"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Loose selections for service, tasting or accompaniment at breakfast and afternoon break.",
      format: "Modular assortments / quotation on request",
      badges: ["Tea time", "Service"]
    },
    {
      id: "b2b-biscotteria-confezionata",
      title: "Packaged biscuits",
      family: "Cookies",
      audience: "Shelf, gifting, recurring proposal",
      clients: ["Stores and resellers", "Restaurants and hospitality"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Packaged references for shelf, welcome kit, minibar or assisted sale.",
      format: "Retail cuts / quotation on request",
      badges: ["Retail", "Giftable"]
    },
    {
      id: "b2b-pane",
      title: "Bread",
      family: "Bread",
      audience: "Table service, brunch, sandwiches and food corner",
      clients: ["Restaurants and hospitality", "Catering and events"],
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      description: "Table and counter formats for restaurants, hospitality and specialised resale.",
      format: "Dedicated sizes / quotation on request",
      badges: ["Recurring", "Service"]
    },
    {
      id: "b2b-lievitati-ricorrenza",
      title: "Seasonal celebration cakes",
      family: "Seasonal",
      audience: "Christmas, Easter, gifting and retail calendars",
      clients: ["Bars and coffee shops", "Stores and resellers", "Catering and events"],
      image: "assets/photos/panettone.jpeg",
      description: "Panettoni, colombe and limited editions for calendars, gifting or seasonal retail.",
      format: "Calendar-based production / quotation on request",
      badges: ["Seasonal moments", "Gifting"]
    },
    {
      id: "b2b-mignon",
      title: "Mignon pastry",
      family: "Mignon",
      audience: "Events, coffee break, buffet and hospitality",
      clients: ["Catering and events", "Restaurants and hospitality"],
      image: "assets/photos/mignon-assortiti.jpeg",
      description: "Service assortments for events, coffee breaks, banqueting and more articulated counters.",
      format: "Modular boxes / quotation on request",
      badges: ["Events", "Hospitality"]
    },
    {
      id: "b2b-torte-eventi",
      title: "Event cakes",
      family: "Display Counter",
      audience: "Celebrations, private events, shared desserts",
      clients: ["Catering and events", "Restaurants and hospitality", "Stores and resellers"],
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      description: "Cakes and statement desserts for celebrations, events and bespoke projects.",
      format: "Event formats / quotation on request",
      badges: ["Custom", "Premium visual"]
    },
    {
      id: "b2b-salati-confezionati",
      title: "Packaged savoury products",
      family: "Savoury",
      audience: "Shelf, specialised resale, grab-and-go line",
      clients: ["Stores and resellers"],
      image: null,
      description: "Packaged savoury references designed for counter, shelf and take-away proposal.",
      format: "Retail cuts / quotation on request",
      badges: ["Savoury", "Retail"]
    }
  ],
  de: [
    {
      id: "b2b-croissant-signature",
      title: "Croissants und Frühstück",
      family: "Frühstück",
      audience: "Frühstückskarte, dauerhafte Theke, Room Service",
      clients: ["Bars und Cafés", "Gastronomie und Hotellerie", "Geschäfte und Wiederverkäufer"],
      image: "assets/photos/croissant.jpeg",
      description: "Theken-Croissants und Frühstücksprodukte für Cafés, Hospitality und Marken mit Premium-Ausrichtung.",
      format: "Geplante Belieferung / Angebot auf Anfrage",
      badges: ["Hohe Rotation", "Frühstückslinie"]
    },
    {
      id: "b2b-biscotteria-sfusa",
      title: "Lose Tea-Time-Gebäcke",
      family: "Gebäck",
      audience: "Tea Time, Coffee Break, kleines Thekenangebot",
      clients: ["Bars und Cafés", "Gastronomie und Hotellerie", "Catering und Events"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Lose Selektionen für Service, Verkostung oder Begleitung bei Frühstück und Nachmittagsbreak.",
      format: "Modulare Sortimente / Angebot auf Anfrage",
      badges: ["Tea Time", "Service"]
    },
    {
      id: "b2b-biscotteria-confezionata",
      title: "Verpacktes Gebäck",
      family: "Gebäck",
      audience: "Regal, Geschenk, dauerhafte Auswahl",
      clients: ["Geschäfte und Wiederverkäufer", "Gastronomie und Hotellerie"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Verpackte Referenzen für Regal, Welcome Kit, Minibar oder betreuten Verkauf.",
      format: "Retail-Größen / Angebot auf Anfrage",
      badges: ["Retail", "Giftable"]
    },
    {
      id: "b2b-pane",
      title: "Brot",
      family: "Brot",
      audience: "Tischservice, Brunch, Sandwiches und Food Corner",
      clients: ["Gastronomie und Hotellerie", "Catering und Events"],
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      description: "Tisch- und Thekenformate für Gastronomie, Hotellerie und spezialisierte Wiederverkäufer.",
      format: "Sondergrößen / Angebot auf Anfrage",
      badges: ["Laufend", "Service"]
    },
    {
      id: "b2b-lievitati-ricorrenza",
      title: "Große saisonale Hefeteige",
      family: "Saisonal",
      audience: "Weihnachten, Ostern, Gifting und Retail-Kalender",
      clients: ["Bars und Cafés", "Geschäfte und Wiederverkäufer", "Catering und Events"],
      image: "assets/photos/panettone.jpeg",
      description: "Panettoni, Colombe und limitierte Serien für Kalender, Geschenke oder saisonalen Verkauf.",
      format: "Kalenderproduktion / Angebot auf Anfrage",
      badges: ["Anlässe", "Gifting"]
    },
    {
      id: "b2b-mignon",
      title: "Mignon-Patisserie",
      family: "Mignon",
      audience: "Events, Coffee Break, Buffet und Hospitality",
      clients: ["Catering und Events", "Gastronomie und Hotellerie"],
      image: "assets/photos/mignon-assortiti.jpeg",
      description: "Service-Assortments für Events, Coffee Breaks, Banqueting und artikuliertere Vitrinen.",
      format: "Modulare Boxen / Angebot auf Anfrage",
      badges: ["Events", "Hospitality"]
    },
    {
      id: "b2b-torte-eventi",
      title: "Event-Torten",
      family: "Theke",
      audience: "Anlässe, Privatevents, Desserts zum Teilen",
      clients: ["Catering und Events", "Gastronomie und Hotellerie", "Geschäfte und Wiederverkäufer"],
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      description: "Torten und starke Desserts für Feiern, Events und Projekte auf Anfrage.",
      format: "Event-Formate / Angebot auf Anfrage",
      badges: ["Maßgeschneidert", "Premium-Visual"]
    },
    {
      id: "b2b-salati-confezionati",
      title: "Verpackte herzhafte Produkte",
      family: "Herzhaft",
      audience: "Regal, spezialisierter Wiederverkauf, Grab-and-go-Linie",
      clients: ["Geschäfte und Wiederverkäufer"],
      image: null,
      description: "Verpackte herzhafte Referenzen für Theke, Regal und Take-away-Angebot.",
      format: "Retail-Größen / Angebot auf Anfrage",
      badges: ["Herzhaft", "Retail"]
    }
  ],
  nl: [
    {
      id: "b2b-croissant-signature",
      title: "Croissants en ontbijt",
      family: "Ontbijt",
      audience: "Ontbijtkaart, vaste toonbank, roomservice",
      clients: ["Bars en koffiezaken", "Restaurants en hospitality", "Winkels en resellers"],
      image: "assets/photos/croissant.jpeg",
      description: "Croissants en ontbijtproducten voor koffiezaken, hospitality en premium georiënteerde merken.",
      format: "Geplande levering / offerte op aanvraag",
      badges: ["Hoge rotatie", "Ontbijtlijn"]
    },
    {
      id: "b2b-biscotteria-sfusa",
      title: "Los tea-time assortiment",
      family: "Koekjes",
      audience: "Tea time, coffee break, klein toonbankaanbod",
      clients: ["Bars en koffiezaken", "Restaurants en hospitality", "Catering en events"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Losse selecties voor service, tasting of begeleiding bij ontbijt en namiddagpauze.",
      format: "Modulaire assortiments / offerte op aanvraag",
      badges: ["Tea time", "Service"]
    },
    {
      id: "b2b-biscotteria-confezionata",
      title: "Verpakte koekjes",
      family: "Koekjes",
      audience: "Schap, gifting, doorlopend aanbod",
      clients: ["Winkels en resellers", "Restaurants en hospitality"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Verpakte referenties voor schap, welcome kit, minibar of assisted sale.",
      format: "Retail-formaten / offerte op aanvraag",
      badges: ["Retail", "Giftable"]
    },
    {
      id: "b2b-pane",
      title: "Brood",
      family: "Brood",
      audience: "Tafelservice, brunch, sandwiches en food corner",
      clients: ["Restaurants en hospitality", "Catering en events"],
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      description: "Tafel- en toonbankformaten voor restaurants, hospitality en gespecialiseerde resellers.",
      format: "Aangepaste formaten / offerte op aanvraag",
      badges: ["Doorlopend", "Service"]
    },
    {
      id: "b2b-lievitati-ricorrenza",
      title: "Grote seizoensproducten",
      family: "Seizoensproducten",
      audience: "Kerst, Pasen, gifting en retailkalenders",
      clients: ["Bars en koffiezaken", "Winkels en resellers", "Catering en events"],
      image: "assets/photos/panettone.jpeg",
      description: "Panettoni, colombe en limited editions voor kalenders, gifts of seizoensretail.",
      format: "Kalenderproductie / offerte op aanvraag",
      badges: ["Momenten", "Gifting"]
    },
    {
      id: "b2b-mignon",
      title: "Mignon patisserie",
      family: "Mignon",
      audience: "Events, coffee break, buffet en hospitality",
      clients: ["Catering en events", "Restaurants en hospitality"],
      image: "assets/photos/mignon-assortiti.jpeg",
      description: "Service-assortimenten voor events, coffee breaks, banqueting en rijkere vitrines.",
      format: "Modulaire boxen / offerte op aanvraag",
      badges: ["Events", "Hospitality"]
    },
    {
      id: "b2b-torte-eventi",
      title: "Eventtaarten",
      family: "Toonbank",
      audience: "Vieringen, privé-events, desserts om te delen",
      clients: ["Catering en events", "Restaurants en hospitality", "Winkels en resellers"],
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      description: "Taarten en statement desserts voor vieringen, events en maatwerkprojecten.",
      format: "Eventformaten / offerte op aanvraag",
      badges: ["Maatwerk", "Premium visual"]
    },
    {
      id: "b2b-salati-confezionati",
      title: "Verpakte hartige producten",
      family: "Hartig",
      audience: "Schap, gespecialiseerde resale, grab-and-go lijn",
      clients: ["Winkels en resellers"],
      image: null,
      description: "Verpakte hartige referenties voor toonbank, schap en take-away aanbod.",
      format: "Retail-formaten / offerte op aanvraag",
      badges: ["Hartig", "Retail"]
    }
  ],
  es: [
    {
      id: "b2b-croissant-signature",
      title: "Croissants y desayuno",
      family: "Desayuno",
      audience: "Carta desayuno, mostrador continuo, room service",
      clients: ["Bares y cafeterías", "Restauración y hospitality", "Tiendas y distribuidores"],
      image: "assets/photos/croissant.jpeg",
      description: "Croissants y referencias desayuno para cafeterías, hospitality y marcas con enfoque premium.",
      format: "Suministro programado / presupuesto bajo solicitud",
      badges: ["Alta rotación", "Línea desayuno"]
    },
    {
      id: "b2b-biscotteria-sfusa",
      title: "Galletas a granel para tea time",
      family: "Galletas",
      audience: "Tea time, coffee break, pequeña propuesta de mostrador",
      clients: ["Bares y cafeterías", "Restauración y hospitality", "Catering y eventos"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Selecciones a granel para servicio, degustación o acompañamiento en desayuno y pausa de tarde.",
      format: "Surtidos modulares / presupuesto bajo solicitud",
      badges: ["Tea time", "Servicio"]
    },
    {
      id: "b2b-biscotteria-confezionata",
      title: "Galletas envasadas",
      family: "Galletas",
      audience: "Estantería, regalo, propuesta recurrente",
      clients: ["Tiendas y distribuidores", "Restauración y hospitality"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Referencias envasadas para estantería, welcome kit, minibar o venta asistida.",
      format: "Formatos retail / presupuesto bajo solicitud",
      badges: ["Retail", "Giftable"]
    },
    {
      id: "b2b-pane",
      title: "Pan",
      family: "Pan",
      audience: "Servicio de mesa, brunch, sándwiches y food corner",
      clients: ["Restauración y hospitality", "Catering y eventos"],
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      description: "Formatos para mesa y mostrador pensados para restauración, hospitality y reventa especializada.",
      format: "Tamaños dedicados / presupuesto bajo solicitud",
      badges: ["Continuidad", "Servicio"]
    },
    {
      id: "b2b-lievitati-ricorrenza",
      title: "Grandes fermentaciones estacionales",
      family: "Estacionales",
      audience: "Navidad, Pascua, gifting y calendarios retail",
      clients: ["Bares y cafeterías", "Tiendas y distribuidores", "Catering y eventos"],
      image: "assets/photos/panettone.jpeg",
      description: "Panettones, colombe y series limitadas para calendario, regalo o venta estacional.",
      format: "Producción por calendario / presupuesto bajo solicitud",
      badges: ["Temporadas", "Gifting"]
    },
    {
      id: "b2b-mignon",
      title: "Pastelería mignon",
      family: "Mignon",
      audience: "Eventos, coffee break, buffet y hospitality",
      clients: ["Catering y eventos", "Restauración y hospitality"],
      image: "assets/photos/mignon-assortiti.jpeg",
      description: "Surtidos de servicio para eventos, coffee break, banqueting y vitrinas más articuladas.",
      format: "Boxes modulares / presupuesto bajo solicitud",
      badges: ["Eventos", "Hospitality"]
    },
    {
      id: "b2b-torte-eventi",
      title: "Tartas para eventos",
      family: "Mostrador",
      audience: "Celebraciones, eventos privados, postres compartidos",
      clients: ["Catering y eventos", "Restauración y hospitality", "Tiendas y distribuidores"],
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      description: "Tartas y postres escénicos para celebraciones, eventos y proyectos a medida.",
      format: "Formatos evento / presupuesto bajo solicitud",
      badges: ["A medida", "Visual premium"]
    },
    {
      id: "b2b-salati-confezionati",
      title: "Productos salados envasados",
      family: "Salados",
      audience: "Estantería, reventa especializada, línea grab-and-go",
      clients: ["Tiendas y distribuidores"],
      image: null,
      description: "Referencias saladas envasadas pensadas para mostrador, estantería y take-away.",
      format: "Formatos retail / presupuesto bajo solicitud",
      badges: ["Salados", "Retail"]
    }
  ],
  fr: [
    {
      id: "b2b-croissant-signature",
      title: "Croissants et petit-déjeuner",
      family: "Petit-déjeuner",
      audience: "Carte petit-déjeuner, comptoir récurrent, room service",
      clients: ["Bars et coffee shops", "Restauration et hospitality", "Boutiques et revendeurs"],
      image: "assets/photos/croissant.jpeg",
      description: "Croissants et références petit-déjeuner pour coffee shops, hospitality et enseignes à positionnement premium.",
      format: "Fourniture programmée / devis sur demande",
      badges: ["Haute rotation", "Ligne petit-déjeuner"]
    },
    {
      id: "b2b-biscotteria-sfusa",
      title: "Biscuiterie vrac tea time",
      family: "Biscuiterie",
      audience: "Tea time, coffee break, petite offre comptoir",
      clients: ["Bars et coffee shops", "Restauration et hospitality", "Catering et événements"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Sélections en vrac pour service, dégustation ou accompagnement au petit-déjeuner et à la pause de l'après-midi.",
      format: "Assortiments modulaires / devis sur demande",
      badges: ["Tea time", "Service"]
    },
    {
      id: "b2b-biscotteria-confezionata",
      title: "Biscuiterie emballée",
      family: "Biscuiterie",
      audience: "Rayon, cadeau, offre récurrente",
      clients: ["Boutiques et revendeurs", "Restauration et hospitality"],
      image: "assets/photos/cookies-assortiti.jpeg",
      description: "Références emballées pour rayon, welcome kit, minibar ou vente assistée.",
      format: "Formats retail / devis sur demande",
      badges: ["Retail", "Giftable"]
    },
    {
      id: "b2b-pane",
      title: "Pain",
      family: "Pain",
      audience: "Service à table, brunch, sandwichs et food corner",
      clients: ["Restauration et hospitality", "Catering et événements"],
      image: "assets/photos/fabio-ritratto-pane-rotondo.jpeg",
      description: "Formats de table et de comptoir pour restauration, hospitality et revente spécialisée.",
      format: "Tailles dédiées / devis sur demande",
      badges: ["Récurrent", "Service"]
    },
    {
      id: "b2b-lievitati-ricorrenza",
      title: "Grands levés saisonniers",
      family: "Saisonnier",
      audience: "Noël, Pâques, gifting et calendriers retail",
      clients: ["Bars et coffee shops", "Boutiques et revendeurs", "Catering et événements"],
      image: "assets/photos/panettone.jpeg",
      description: "Panettoni, colombes et séries limitées pour calendrier, cadeau ou vente saisonnière.",
      format: "Production calendrier / devis sur demande",
      badges: ["Temps forts", "Gifting"]
    },
    {
      id: "b2b-mignon",
      title: "Pâtisserie mignon",
      family: "Mignon",
      audience: "Événements, coffee break, buffet et hospitality",
      clients: ["Catering et événements", "Restauration et hospitality"],
      image: "assets/photos/mignon-assortiti.jpeg",
      description: "Assortiments de service pour événements, coffee breaks, banqueting et vitrines plus riches.",
      format: "Box modulaires / devis sur demande",
      badges: ["Événements", "Hospitality"]
    },
    {
      id: "b2b-torte-eventi",
      title: "Gâteaux événementiels",
      family: "Vitrine",
      audience: "Célébrations, événements privés, desserts partagés",
      clients: ["Catering et événements", "Restauration et hospitality", "Boutiques et revendeurs"],
      image: "assets/photos/torta-cioccolato-ganache.jpeg",
      description: "Gâteaux et desserts de scène pour célébrations, événements et projets sur demande.",
      format: "Formats événement / devis sur demande",
      badges: ["Sur mesure", "Visual premium"]
    },
    {
      id: "b2b-salati-confezionati",
      title: "Produits salés emballés",
      family: "Salé",
      audience: "Rayon, revente spécialisée, ligne grab-and-go",
      clients: ["Boutiques et revendeurs"],
      image: null,
      description: "Références salées emballées pensées pour comptoir, rayon et offre take-away.",
      format: "Formats retail / devis sur demande",
      badges: ["Salé", "Retail"]
    }
  ]
};

const textDictionary = {
  "🍪 Biscotti? Solo digitali e senza glutine, promesso!": {
    en: "🍪 Cookies? Only digital ones and gluten free, promise!",
    de: "🍪 Kekse? Nur digital und glutenfrei, versprochen!",
    nl: "🍪 Koekjes? Alleen digitale en glutenvrije, beloofd!",
    es: "🍪 ¿Galletas? Solo digitales y sin gluten, ¡prometido!",
    fr: "🍪 Des biscuits ? Seulement numériques et sans gluten, promis !"
  },
  "Accetta": { en: "Accept", de: "Akzeptieren", nl: "Accepteren", es: "Aceptar", fr: "Accepter" },
  "Rifiuta": { en: "Reject", de: "Ablehnen", nl: "Weigeren", es: "Rechazar", fr: "Refuser" },
  "Preferenze": { en: "Preferences", de: "Einstellungen", nl: "Voorkeuren", es: "Preferencias", fr: "Préférences" },
  "Cookie": { en: "Cookies", de: "Cookies", nl: "Cookies", es: "Cookies", fr: "Cookies" },
  "Chiudi preferenze cookie": {
    en: "Close cookie preferences",
    de: "Cookie-Einstellungen schließen",
    nl: "Cookievoorkeuren sluiten",
    es: "Cerrar preferencias de cookies",
    fr: "Fermer les préférences cookies"
  },
  "Preferenze cookie": {
    en: "Cookie preferences",
    de: "Cookie-Einstellungen",
    nl: "Cookievoorkeuren",
    es: "Preferencias de cookies",
    fr: "Préférences cookies"
  },
  "Scegli cosa attivare.": {
    en: "Choose what to activate.",
    de: "Wähle aus, was aktiviert werden soll.",
    nl: "Kies wat je wilt activeren.",
    es: "Elige qué activar.",
    fr: "Choisissez ce qu'il faut activer."
  },
  "Analytics e marketing restano disattivati finché non li autorizzi. Gli ID di tracciamento sono già predisposti e si attiveranno solo quando li collegheremo davvero.": {
    en: "Analytics and marketing stay disabled until you authorise them. Tracking IDs are already prepared and will only turn on when we really connect them.",
    de: "Analytics und Marketing bleiben deaktiviert, bis du sie freigibst. Tracking-IDs sind bereits vorbereitet und werden erst aktiv, wenn wir sie wirklich verbinden.",
    nl: "Analytics en marketing blijven uitgeschakeld totdat je ze toestaat. Tracking-ID's zijn al voorbereid en worden pas actief wanneer we ze echt koppelen.",
    es: "Analytics y marketing permanecen desactivados hasta que los autorices. Los IDs de seguimiento ya están preparados y solo se activarán cuando los conectemos de verdad.",
    fr: "L'analytics et le marketing restent désactivés tant que vous ne les autorisez pas. Les identifiants de suivi sont déjà prêts et ne s'activeront que lorsque nous les connecterons réellement."
  },
  "Solo necessari": { en: "Only necessary", de: "Nur notwendige", nl: "Alleen noodzakelijke", es: "Solo necesarias", fr: "Uniquement nécessaires" },
  "Accetta tutto": { en: "Accept all", de: "Alle akzeptieren", nl: "Alles accepteren", es: "Aceptar todo", fr: "Tout accepter" },
  "Salva preferenze": { en: "Save preferences", de: "Einstellungen speichern", nl: "Voorkeuren opslaan", es: "Guardar preferencias", fr: "Enregistrer les préférences" },
  "Preferenze cookie aggiornate.": {
    en: "Cookie preferences updated.",
    de: "Cookie-Einstellungen aktualisiert.",
    nl: "Cookievoorkeuren bijgewerkt.",
    es: "Preferencias de cookies actualizadas.",
    fr: "Préférences cookies mises à jour."
  },
  "Cart": { en: "Cart", de: "Warenkorb", nl: "Cart", es: "Carrito", fr: "Panier" },
  "Chiudi menu": { en: "Close menu", de: "Menü schließen", nl: "Menu sluiten", es: "Cerrar menú", fr: "Fermer le menu" },
  "Apri menu": { en: "Open menu", de: "Menü öffnen", nl: "Menu openen", es: "Abrir menú", fr: "Ouvrir le menu" },
  "Chiudi": { en: "Close", de: "Schließen", nl: "Sluiten", es: "Cerrar", fr: "Fermer" },
  "Menu": { en: "Menu", de: "Menü", nl: "Menu", es: "Menú", fr: "Menu" },
  "Tre mondi, una sola firma": {
    en: "Three worlds, one signature",
    de: "Drei Welten, eine Signatur",
    nl: "Drie werelden, één signatuur",
    es: "Tres mundos, una sola firma",
    fr: "Trois mondes, une seule signature"
  },
  "Apri la sezione giusta e muoviti nel sito senza tenere il menu sempre in vista.": {
    en: "Open the right section and move through the site without keeping the menu open all the time.",
    de: "Öffne den richtigen Bereich und bewege dich durch die Website, ohne das Menü ständig offen zu halten.",
    nl: "Open de juiste sectie en beweeg door de site zonder het menu steeds open te houden.",
    es: "Abre la sección adecuada y muévete por el sitio sin tener el menú siempre abierto.",
    fr: "Ouvrez la bonne section et circulez dans le site sans garder le menu toujours ouvert."
  },
  "L'eccellenza senza glutine dal 2008.": {
    en: "Gluten-free excellence since 2008.",
    de: "Glutenfreie Exzellenz seit 2008.",
    nl: "Glutenvrije excellentie sinds 2008.",
    es: "Excelencia sin gluten desde 2008.",
    fr: "L'excellence sans gluten depuis 2008."
  },
  "Informazioni": { en: "Information", de: "Informationen", nl: "Informatie", es: "Información", fr: "Informations" },
  "Chi Sono": { en: "About", de: "Über Fabio", nl: "Over Fabio", es: "Sobre Fabio", fr: "À propos" },
  "Contatti": { en: "Contacts", de: "Kontakte", nl: "Contact", es: "Contactos", fr: "Contacts" },
  "Realizzato con cura.": {
    en: "Built with care.",
    de: "Mit Sorgfalt entwickelt.",
    nl: "Met zorg gemaakt.",
    es: "Hecho con cuidado.",
    fr: "Réalisé avec soin."
  },
  "Eccellenza senza glutine": {
    en: "Gluten-free excellence",
    de: "Glutenfreie Exzellenz",
    nl: "Glutenvrije excellentie",
    es: "Excelencia sin gluten",
    fr: "Excellence sans gluten"
  },
  "Tre mondi,": { en: "Three worlds,", de: "Drei Welten,", nl: "Drie werelden,", es: "Tres mundos,", fr: "Trois mondes," },
  "una sola firma.": {
    en: "one signature.",
    de: "eine Signatur.",
    nl: "één signatuur.",
    es: "una sola firma.",
    fr: "une seule signature."
  },
  "Consulenza, shop e pasticceria si incontrano in un percorso unico, pensato per portarti subito nel mondo giusto.": {
    en: "Consulting, shop and pastry meet in one path designed to take you straight into the right world.",
    de: "Beratung, Shop und Konditorei treffen sich in einem Weg, der dich direkt in die richtige Welt führt.",
    nl: "Consultancy, shop en patisserie komen samen in één traject dat je meteen naar de juiste wereld brengt.",
    es: "Consultoría, shop y pastelería se unen en un recorrido pensado para llevarte de inmediato al mundo adecuado.",
    fr: "Conseil, boutique et pâtisserie se rencontrent dans un parcours unique pensé pour vous faire entrer tout de suite dans le bon univers."
  },
  "Fabio Nazzari in ritratto editoriale": {
    en: "Fabio Nazzari editorial portrait",
    de: "Fabio Nazzari im Editorial-Porträt",
    nl: "Fabio Nazzari in editorieel portret",
    es: "Fabio Nazzari en retrato editorial",
    fr: "Fabio Nazzari en portrait éditorial"
  },
  "Un solo ingresso": {
    en: "One entry point",
    de: "Ein einziger Einstieg",
    nl: "Eén ingang",
    es: "Una sola entrada",
    fr: "Une seule entrée"
  },
  "Tre accessi, una direzione chiara.": {
    en: "Three entries, one clear direction.",
    de: "Drei Zugänge, eine klare Richtung.",
    nl: "Drie ingangen, één duidelijke richting.",
    es: "Tres accesos, una dirección clara.",
    fr: "Trois accès, une direction claire."
  },
  "Consulenza, Officina e Pasticceria si aprono subito, in modo chiaro e diretto.": {
    en: "Consulting, Officina and the pastry shop open immediately, in a clear and direct way.",
    de: "Beratung, Officina und Konditorei öffnen sich sofort, klar und direkt.",
    nl: "Consultancy, Officina en de patisserie openen meteen, helder en direct.",
    es: "Consultoría, Officina y Pastelería se abren de inmediato, de forma clara y directa.",
    fr: "Conseil, Officina et Pâtisserie s'ouvrent immédiatement, de manière claire et directe."
  },
  "Scegli da dove entrare.": {
    en: "Choose where to enter.",
    de: "Wähle deinen Einstieg.",
    nl: "Kies waar je binnenkomt.",
    es: "Elige por dónde entrar.",
    fr: "Choisissez par où entrer."
  },
  "Entra": { en: "Enter", de: "Öffnen", nl: "Open", es: "Entrar", fr: "Entrer" },
  "Contatto diretto": { en: "Direct contact", de: "Direkter Kontakt", nl: "Direct contact", es: "Contacto directo", fr: "Contact direct" },
  "Preferisci parlare direttamente con Fabio?": {
    en: "Would you rather speak directly with Fabio?",
    de: "Möchtest du lieber direkt mit Fabio sprechen?",
    nl: "Praat je liever direct met Fabio?",
    es: "¿Prefieres hablar directamente con Fabio?",
    fr: "Préférez-vous parler directement avec Fabio ?"
  },
  "Se non vuoi partire da una sezione, puoi andare subito ai contatti e arrivare diretto al punto.": {
    en: "If you don't want to start from a section, you can go straight to contact and get to the point immediately.",
    de: "Wenn du nicht von einem Bereich aus starten möchtest, kannst du direkt zu den Kontakten gehen und sofort zum Punkt kommen.",
    nl: "Als je niet vanuit een sectie wilt starten, kun je meteen naar contact gaan en direct ter zake komen.",
    es: "Si no quieres empezar desde una sección, puedes ir directamente a contacto y llegar al punto de inmediato.",
    fr: "Si vous ne voulez pas partir d'une section, vous pouvez aller directement aux contacts et arriver tout de suite à l'essentiel."
  },
  "Vai ai contatti": { en: "Go to contact", de: "Zu den Kontakten", nl: "Ga naar contact", es: "Ir a contacto", fr: "Aller au contact" },
  "Apri consulenza": { en: "Open consulting", de: "Beratung öffnen", nl: "Open consultancy", es: "Abrir consultoría", fr: "Ouvrir le conseil" },
  "Consulenza strategica": {
    en: "Strategic consulting",
    de: "Strategische Beratung",
    nl: "Strategische consultancy",
    es: "Consultoría estratégica",
    fr: "Conseil stratégique"
  },
  "Una direzione chiara per crescere nel gluten free.": {
    en: "A clear direction to grow in gluten free.",
    de: "Eine klare Richtung, um im glutenfreien Markt zu wachsen.",
    nl: "Een duidelijke richting om in glutenvrij te groeien.",
    es: "Una dirección clara para crecer en el gluten free.",
    fr: "Une direction claire pour grandir dans le sans gluten."
  },
  "Con oltre 15 anni di esperienza nel settore, Fabio affianca brand e aziende che vogliono sviluppare prodotti piu solidi, impostare meglio il team e costruire una comunicazione davvero riconoscibile.": {
    en: "With more than 15 years of experience in the field, Fabio supports brands and companies that want to develop stronger products, organise the team better and build communication that is truly recognisable.",
    de: "Mit mehr als 15 Jahren Erfahrung unterstützt Fabio Marken und Unternehmen, die stärkere Produkte entwickeln, das Team besser aufstellen und eine wirklich erkennbare Kommunikation aufbauen wollen.",
    nl: "Met meer dan 15 jaar ervaring ondersteunt Fabio merken en bedrijven die sterkere producten willen ontwikkelen, hun team beter willen organiseren en een echt herkenbare communicatie willen bouwen.",
    es: "Con más de 15 años de experiencia en el sector, Fabio acompaña a marcas y empresas que quieren desarrollar productos más sólidos, organizar mejor el equipo y construir una comunicación realmente reconocible.",
    fr: "Avec plus de 15 ans d'expérience dans le secteur, Fabio accompagne les marques et les entreprises qui veulent développer des produits plus solides, mieux structurer l'équipe et construire une communication vraiment reconnaissable."
  },
  "Sviluppo prodotto": { en: "Product development", de: "Produktentwicklung", nl: "Productontwikkeling", es: "Desarrollo de producto", fr: "Développement produit" },
  "Start-up e team": { en: "Start-up and team", de: "Start-up und Team", nl: "Start-up en team", es: "Start-up y equipo", fr: "Start-up et équipe" },
  "Marketing e comunicazione": { en: "Marketing and communication", de: "Marketing und Kommunikation", nl: "Marketing en communicatie", es: "Marketing y comunicación", fr: "Marketing et communication" },
  "Anni nel settore": { en: "Years in the sector", de: "Jahre im Sektor", nl: "Jaren in de sector", es: "Años en el sector", fr: "Années dans le secteur" },
  "Aree di intervento": { en: "Work areas", de: "Interventionsbereiche", nl: "Werkgebieden", es: "Áreas de intervención", fr: "Domaines d'intervention" },
  "Dal concept al lancio": { en: "From concept to launch", de: "Vom Konzept bis zum Launch", nl: "Van concept tot lancering", es: "Del concepto al lanzamiento", fr: "Du concept au lancement" },
  "Finestre di consulenza": { en: "Consulting windows", de: "Beratungsfenster", nl: "Consultancyvensters", es: "Ventanas de consultoría", fr: "Fenêtres de conseil" },
  "Tre aree operative, un solo linguaggio.": {
    en: "Three operating areas, one language.",
    de: "Drei operative Bereiche, eine Sprache.",
    nl: "Drie operationele gebieden, één taal.",
    es: "Tres áreas operativas, un solo lenguaje.",
    fr: "Trois zones d'action, un seul langage."
  },
  "Sviluppo prodotto, avviamento e comunicazione: tre finestre per leggere subito dove entra il tuo progetto.": {
    en: "Product development, launch and communication: three windows to immediately understand where your project enters.",
    de: "Produktentwicklung, Start und Kommunikation: drei Fenster, um sofort zu verstehen, wo dein Projekt einsteigt.",
    nl: "Productontwikkeling, opstart en communicatie: drie vensters om meteen te zien waar je project binnenkomt.",
    es: "Desarrollo de producto, puesta en marcha y comunicación: tres ventanas para entender de inmediato por dónde entra tu proyecto.",
    fr: "Développement produit, lancement et communication : trois fenêtres pour lire immédiatement par où votre projet entre."
  },
  "Fabio Nazzari durante una lavorazione in laboratorio": {
    en: "Fabio Nazzari working in the lab",
    de: "Fabio Nazzari bei der Arbeit im Labor",
    nl: "Fabio Nazzari aan het werk in het lab",
    es: "Fabio Nazzari trabajando en el laboratorio",
    fr: "Fabio Nazzari en travail dans le laboratoire"
  },
  "Un solo metodo": { en: "One method", de: "Eine Methode", nl: "Eén methode", es: "Un solo método", fr: "Une seule méthode" },
  "Prodotto, squadra, posizionamento.": {
    en: "Product, team, positioning.",
    de: "Produkt, Team, Positionierung.",
    nl: "Product, team, positionering.",
    es: "Producto, equipo, posicionamiento.",
    fr: "Produit, équipe, positionnement."
  },
  "Ogni intervento nasce da un obiettivo concreto e prende forma tra formazione, organizzazione e attivazione.": {
    en: "Every intervention starts from a concrete goal and takes shape through training, organisation and activation.",
    de: "Jeder Eingriff entsteht aus einem konkreten Ziel und nimmt Form durch Schulung, Organisation und Aktivierung an.",
    nl: "Elke interventie vertrekt vanuit een concreet doel en krijgt vorm via training, organisatie en activatie.",
    es: "Cada intervención nace de un objetivo concreto y toma forma entre formación, organización y activación.",
    fr: "Chaque intervention naît d'un objectif concret et prend forme entre formation, organisation et activation."
  },
  "Lascia i tuoi riferimenti": {
    en: "Leave your details",
    de: "Hinterlasse deine Daten",
    nl: "Laat je gegevens achter",
    es: "Déjanos tus datos",
    fr: "Laissez vos coordonnées"
  },
  "Compila i dati essenziali e ti ricontattiamo con il contesto gia chiaro.": {
    en: "Fill in the essential details and we will get back to you with the context already clear.",
    de: "Fülle die wichtigsten Daten aus und wir melden uns mit bereits klarem Kontext bei dir.",
    nl: "Vul de essentiële gegevens in en we nemen contact op met een al duidelijke context.",
    es: "Completa los datos esenciales y te contactaremos con el contexto ya claro.",
    fr: "Renseignez les informations essentielles et nous reviendrons vers vous avec un contexte déjà clair."
  },
  "Invia richiesta": { en: "Send request", de: "Anfrage senden", nl: "Verzoek versturen", es: "Enviar solicitud", fr: "Envoyer la demande" },
  "Richiesta inviata correttamente.": {
    en: "Request sent successfully.",
    de: "Anfrage erfolgreich gesendet.",
    nl: "Verzoek succesvol verzonden.",
    es: "Solicitud enviada correctamente.",
    fr: "Demande envoyée correctement."
  },
  "Controlla i campi evidenziati e riprova.": {
    en: "Check the highlighted fields and try again.",
    de: "Prüfe die markierten Felder und versuche es erneut.",
    nl: "Controleer de gemarkeerde velden en probeer opnieuw.",
    es: "Revisa los campos marcados e inténtalo de nuevo.",
    fr: "Vérifiez les champs mis en évidence et réessayez."
  },
  "Il consenso e necessario per ricontattarti.": {
    en: "Consent is required so we can contact you again.",
    de: "Die Einwilligung ist erforderlich, damit wir dich kontaktieren können.",
    nl: "Toestemming is nodig zodat we contact met je kunnen opnemen.",
    es: "El consentimiento es necesario para poder contactarte.",
    fr: "Le consentement est nécessaire pour pouvoir vous recontacter."
  },
  "Inserisci il nome.": { en: "Enter your first name.", de: "Vornamen eingeben.", nl: "Vul je voornaam in.", es: "Introduce el nombre.", fr: "Saisissez le prénom." },
  "Inserisci il cognome.": { en: "Enter your last name.", de: "Nachnamen eingeben.", nl: "Vul je achternaam in.", es: "Introduce el apellido.", fr: "Saisissez le nom." },
  "Inserisci azienda o attivita.": { en: "Enter company or activity.", de: "Unternehmen oder Tätigkeit eingeben.", nl: "Vul bedrijf of activiteit in.", es: "Introduce empresa o actividad.", fr: "Indiquez l'entreprise ou l'activité." },
  "Inserisci l'email.": { en: "Enter the email.", de: "E-Mail eingeben.", nl: "Vul het e-mailadres in.", es: "Introduce el email.", fr: "Saisissez l'e-mail." },
  "Controlla il formato dell'email.": { en: "Check the email format.", de: "E-Mail-Format prüfen.", nl: "Controleer het e-mailformaat.", es: "Comprueba el formato del email.", fr: "Vérifiez le format de l'e-mail." },
  "Inserisci il telefono.": { en: "Enter the phone number.", de: "Telefonnummer eingeben.", nl: "Vul het telefoonnummer in.", es: "Introduce el teléfono.", fr: "Saisissez le téléphone." },
  "Inserisci un telefono valido.": { en: "Enter a valid phone number.", de: "Gültige Telefonnummer eingeben.", nl: "Vul een geldig telefoonnummer in.", es: "Introduce un teléfono válido.", fr: "Saisissez un numéro de téléphone valide." },
  "Inserisci la citta.": { en: "Enter the city.", de: "Stadt eingeben.", nl: "Vul de stad in.", es: "Introduce la ciudad.", fr: "Saisissez la ville." },
  "Inserisci il paese.": { en: "Enter the country.", de: "Land eingeben.", nl: "Vul het land in.", es: "Introduce el país.", fr: "Saisissez le pays." },
  "Seleziona il tipo di richiesta.": { en: "Select the request type.", de: "Art der Anfrage auswählen.", nl: "Selecteer het type aanvraag.", es: "Selecciona el tipo de solicitud.", fr: "Sélectionnez le type de demande." },
  "Controlla il tipo di attivita.": { en: "Check the activity type.", de: "Art der Tätigkeit prüfen.", nl: "Controleer het type activiteit.", es: "Comprueba el tipo de actividad.", fr: "Vérifiez le type d'activité." },
  "Controlla il volume indicato.": { en: "Check the indicated volume.", de: "Angegebenes Volumen prüfen.", nl: "Controleer het opgegeven volume.", es: "Comprueba el volumen indicado.", fr: "Vérifiez le volume indiqué." },
  "Controlla il sito web.": { en: "Check the website.", de: "Website prüfen.", nl: "Controleer de website.", es: "Comprueba el sitio web.", fr: "Vérifiez le site web." },
  "Lead B2B": { en: "B2B lead", de: "B2B-Lead", nl: "B2B-lead", es: "Lead B2B", fr: "Lead B2B" },
  "Lead consulenza": { en: "Consulting lead", de: "Beratungs-Lead", nl: "Consultancy-lead", es: "Lead de consultoría", fr: "Lead conseil" },
  "Lead sito": { en: "Website lead", de: "Website-Lead", nl: "Website-lead", es: "Lead del sitio", fr: "Lead site" },
  "Nome *": { en: "First name *", de: "Vorname *", nl: "Voornaam *", es: "Nombre *", fr: "Prénom *" },
  "Cognome *": { en: "Last name *", de: "Nachname *", nl: "Achternaam *", es: "Apellido *", fr: "Nom *" },
  "Azienda / attivita *": { en: "Company / activity *", de: "Unternehmen / Tätigkeit *", nl: "Bedrijf / activiteit *", es: "Empresa / actividad *", fr: "Entreprise / activité *" },
  "Telefono *": { en: "Phone *", de: "Telefon *", nl: "Telefoon *", es: "Teléfono *", fr: "Téléphone *" },
  "Citta *": { en: "City *", de: "Stadt *", nl: "Stad *", es: "Ciudad *", fr: "Ville *" },
  "Paese *": { en: "Country *", de: "Land *", nl: "Land *", es: "País *", fr: "Pays *" },
  "Indirizzo": { en: "Address", de: "Adresse", nl: "Adres", es: "Dirección", fr: "Adresse" },
  "Tipo richiesta *": { en: "Request type *", de: "Art der Anfrage *", nl: "Type aanvraag *", es: "Tipo de solicitud *", fr: "Type de demande *" },
  "Tipo attivita": { en: "Activity type", de: "Art der Tätigkeit", nl: "Type activiteit", es: "Tipo de actividad", fr: "Type d'activité" },
  "Sito web": { en: "Website", de: "Website", nl: "Website", es: "Sitio web", fr: "Site web" },
  "Instagram": { en: "Instagram", de: "Instagram", nl: "Instagram", es: "Instagram", fr: "Instagram" },
  "Volume interesse": { en: "Volume of interest", de: "Interessensvolumen", nl: "Interessevolume", es: "Volumen de interés", fr: "Volume d'intérêt" },
  "Messaggio": { en: "Message", de: "Nachricht", nl: "Bericht", es: "Mensaje", fr: "Message" },
  "Seleziona": { en: "Select", de: "Auswählen", nl: "Selecteer", es: "Selecciona", fr: "Sélectionner" },
  "Acconsento a essere ricontattato in merito a questa richiesta e dichiaro di aver letto l'": {
    en: "I agree to be contacted about this request and confirm that I have read the ",
    de: "Ich stimme zu, zu dieser Anfrage kontaktiert zu werden, und bestätige, dass ich die ",
    nl: "Ik ga ermee akkoord dat ik over dit verzoek word gecontacteerd en bevestig dat ik de ",
    es: "Acepto que me contacten sobre esta solicitud y declaro que he leído la ",
    fr: "J'accepte d'être recontacté au sujet de cette demande et je confirme avoir lu la "
  },
  "informativa privacy": { en: "privacy notice", de: "Datenschutzhinweise", nl: "privacyverklaring", es: "política de privacidad", fr: "notice de confidentialité" },
  "I dati vengono inviati in modo strutturato per gestire meglio follow-up, CRM e richieste operative.": {
    en: "Data is sent in a structured way to handle follow-up, CRM and operational requests better.",
    de: "Die Daten werden strukturiert gesendet, um Follow-up, CRM und operative Anfragen besser zu verwalten.",
    nl: "Gegevens worden gestructureerd verzonden om follow-up, CRM en operationele aanvragen beter te beheren.",
    es: "Los datos se envían de forma estructurada para gestionar mejor el seguimiento, el CRM y las solicitudes operativas.",
    fr: "Les données sont envoyées de manière structurée afin de mieux gérer le suivi, le CRM et les demandes opérationnelles."
  },
  "Invio...": { en: "Sending...", de: "Wird gesendet...", nl: "Verzenden...", es: "Enviando...", fr: "Envoi..." },
  "Carrello vuoto": { en: "Empty cart", de: "Leerer Warenkorb", nl: "Lege cart", es: "Carrito vacío", fr: "Panier vide" },
  "Seleziona i prodotti di Officina, aggiungili qui e usa questo drawer come base del futuro checkout Shopify.": {
    en: "Choose Officina products, add them here and use this drawer as the base for the future Shopify checkout.",
    de: "Wähle Officina-Produkte, füge sie hier hinzu und nutze diesen Drawer als Basis für den zukünftigen Shopify-Checkout.",
    nl: "Kies Officina-producten, voeg ze hier toe en gebruik deze drawer als basis voor de toekomstige Shopify-checkout.",
    es: "Selecciona productos de Officina, añádelos aquí y usa este drawer como base del futuro checkout de Shopify.",
    fr: "Choisissez les produits Officina, ajoutez-les ici et utilisez ce tiroir comme base du futur checkout Shopify."
  },
  "Il tuo carrello": { en: "Your cart", de: "Dein Warenkorb", nl: "Je cart", es: "Tu carrito", fr: "Votre panier" },
  "Ti mancano ": { en: "You are ", de: "Es fehlen dir ", nl: "Je hebt nog ", es: "Te faltan ", fr: "Il vous manque " },
  " per la spedizione gratuita.": {
    en: " away from free shipping.",
    de: " bis zum kostenlosen Versand.",
    nl: " nodig voor gratis verzending.",
    es: " para el envío gratuito.",
    fr: " pour la livraison gratuite."
  },
  "Hai sbloccato la spedizione gratuita.": {
    en: "You unlocked free shipping.",
    de: "Du hast den kostenlosen Versand freigeschaltet.",
    nl: "Je hebt gratis verzending ontgrendeld.",
    es: "Has desbloqueado el envío gratuito.",
    fr: "Vous avez débloqué la livraison gratuite."
  },
  "Aggiungi i primi prodotti e costruisci la tua selezione Officina.": {
    en: "Add your first products and build your Officina selection.",
    de: "Füge die ersten Produkte hinzu und baue deine Officina-Auswahl auf.",
    nl: "Voeg je eerste producten toe en bouw je Officina-selectie op.",
    es: "Añade tus primeros productos y construye tu selección Officina.",
    fr: "Ajoutez vos premiers produits et construisez votre sélection Officina."
  },
  "Rimuovi": { en: "Remove", de: "Entfernen", nl: "Verwijderen", es: "Eliminar", fr: "Retirer" },
  "Subtotale": { en: "Subtotal", de: "Zwischensumme", nl: "Subtotaal", es: "Subtotal", fr: "Sous-total" },
  "Totale articoli": { en: "Items total", de: "Gesamtanzahl Artikel", nl: "Totaal artikelen", es: "Total de artículos", fr: "Total articles" },
  "Vai al checkout Shopify": { en: "Go to Shopify checkout", de: "Zum Shopify-Checkout", nl: "Ga naar Shopify-checkout", es: "Ir al checkout de Shopify", fr: "Aller au checkout Shopify" },
  "Checkout pronto da collegare": {
    en: "Checkout ready to connect",
    de: "Checkout bereit zur Verbindung",
    nl: "Checkout klaar om te koppelen",
    es: "Checkout listo para conectar",
    fr: "Checkout prêt à être connecté"
  },
  "Il pagamento finale, lo stock e l'ordine vengono completati nel checkout Shopify.": {
    en: "Final payment, stock and order are completed in the Shopify checkout.",
    de: "Zahlung, Bestand und Bestellung werden im Shopify-Checkout abgeschlossen.",
    nl: "Betaling, voorraad en bestelling worden afgerond in de Shopify-checkout.",
    es: "El pago final, el stock y el pedido se completan en el checkout de Shopify.",
    fr: "Le paiement final, le stock et la commande sont finalisés dans le checkout Shopify."
  },
  "Questa e una preview locale dello shop. Collegando Shopify il checkout diventera subito operativo.": {
    en: "This is a local preview of the shop. Connect Shopify and the checkout becomes fully operational immediately.",
    de: "Dies ist eine lokale Shop-Vorschau. Sobald Shopify verbunden ist, wird der Checkout sofort betriebsbereit.",
    nl: "Dit is een lokale preview van de shop. Koppel Shopify en de checkout wordt meteen operationeel.",
    es: "Esta es una vista previa local de la tienda. Al conectar Shopify, el checkout quedará operativo de inmediato.",
    fr: "Ceci est un aperçu local de la boutique. En connectant Shopify, le checkout devient immédiatement opérationnel."
  },
  "Per attivare il checkout reale serve collegare Shopify con dominio e token storefront.": {
    en: "To activate the real checkout you need to connect Shopify with domain and storefront token.",
    de: "Um den echten Checkout zu aktivieren, musst du Shopify mit Domain und Storefront-Token verbinden.",
    nl: "Om de echte checkout te activeren moet je Shopify verbinden met domein en storefront-token.",
    es: "Para activar el checkout real es necesario conectar Shopify con dominio y token storefront.",
    fr: "Pour activer le vrai checkout, il faut connecter Shopify avec le domaine et le token storefront."
  },
  "Aggiunta in corso...": { en: "Adding...", de: "Wird hinzugefügt...", nl: "Toevoegen...", es: "Añadiendo...", fr: "Ajout..." },
  "Temporaneamente non disponibile": {
    en: "Temporarily unavailable",
    de: "Vorübergehend nicht verfügbar",
    nl: "Tijdelijk niet beschikbaar",
    es: "Temporalmente no disponible",
    fr: "Temporairement indisponible"
  },
  "Aggiungi al carrello": { en: "Add to cart", de: "In den Warenkorb", nl: "Toevoegen aan cart", es: "Añadir al carrito", fr: "Ajouter au panier" },
  "Spedizione gratuita sopra €50": {
    en: "Free shipping over €50",
    de: "Kostenloser Versand ab 50 €",
    nl: "Gratis verzending boven €50",
    es: "Envío gratis por encima de €50",
    fr: "Livraison offerte au-dessus de 50 €"
  },
  "Checkout finale su Shopify": {
    en: "Final checkout on Shopify",
    de: "Finaler Checkout auf Shopify",
    nl: "Definitieve checkout op Shopify",
    es: "Checkout final en Shopify",
    fr: "Checkout final sur Shopify"
  },
  "Preview locale pronta al collegamento Shopify": {
    en: "Local preview ready for Shopify connection",
    de: "Lokale Vorschau bereit für die Shopify-Anbindung",
    nl: "Lokale preview klaar voor Shopify-koppeling",
    es: "Vista previa local lista para conectar Shopify",
    fr: "Aperçu local prêt pour la connexion Shopify"
  },
  "DESCRIZIONE": { en: "DESCRIPTION", de: "BESCHREIBUNG", nl: "BESCHRIJVING", es: "DESCRIPCIÓN", fr: "DESCRIPTION" },
  "INGREDIENTI": { en: "INGREDIENTS", de: "ZUTATEN", nl: "INGREDIËNTEN", es: "INGREDIENTES", fr: "INGRÉDIENTS" },
  "CONSERVAZIONE": { en: "STORAGE", de: "LAGERUNG", nl: "BEWARING", es: "CONSERVACIÓN", fr: "CONSERVATION" },
  "ORDINE": { en: "ORDER", de: "BESTELLUNG", nl: "BESTELLING", es: "PEDIDO", fr: "COMMANDE" },
  "Ingredienti da definire.": {
    en: "Ingredients to be defined.",
    de: "Zutaten werden noch definiert.",
    nl: "Ingrediënten nog te bepalen.",
    es: "Ingredientes por definir.",
    fr: "Ingrédients à définir."
  },
  "Dettagli in arrivo.": {
    en: "Details coming soon.",
    de: "Details folgen bald.",
    nl: "Details volgen binnenkort.",
    es: "Detalles próximamente.",
    fr: "Détails à venir."
  },
  "Pagamento finale gestito su Shopify.": {
    en: "Final payment handled on Shopify.",
    de: "Endgültige Zahlung über Shopify.",
    nl: "Definitieve betaling via Shopify.",
    es: "Pago final gestionado en Shopify.",
    fr: "Paiement final géré sur Shopify."
  },
  "Modalita preview pronta al collegamento Shopify.": {
    en: "Preview mode ready for Shopify connection.",
    de: "Vorschaumodus bereit für die Shopify-Anbindung.",
    nl: "Previewmodus klaar voor Shopify-koppeling.",
    es: "Modo preview listo para conectar Shopify.",
    fr: "Mode aperçu prêt pour la connexion Shopify."
  },
  "FORMATO": { en: "FORMAT", de: "FORMAT", nl: "FORMAAT", es: "FORMATO", fr: "FORMAT" },
  "Contattaci": { en: "Contact us", de: "Kontaktiere uns", nl: "Neem contact op", es: "Contáctanos", fr: "Contactez-nous" },
  "Abbiamo sempre tempo per ascoltare richieste, progetti e opportunita.": {
    en: "We always make time to listen to requests, projects and opportunities.",
    de: "Wir nehmen uns immer Zeit für Anfragen, Projekte und Chancen.",
    nl: "We maken altijd tijd om naar aanvragen, projecten en kansen te luisteren.",
    es: "Siempre tenemos tiempo para escuchar solicitudes, proyectos y oportunidades.",
    fr: "Nous prenons toujours le temps d'écouter les demandes, les projets et les opportunités."
  },
  "Come gestite le richieste dal sito?": {
    en: "How do you handle requests from the website?",
    de: "Wie bearbeitet ihr Anfragen von der Website?",
    nl: "Hoe behandelen jullie aanvragen via de website?",
    es: "¿Cómo gestionáis las solicitudes del sitio web?",
    fr: "Comment gérez-vous les demandes issues du site ?"
  },
  "Ogni richiesta entra in modo strutturato, con contesto, tipo richiesta e dati utili per follow-up e CRM.": {
    en: "Every request arrives in a structured way, with context, request type and useful data for follow-up and CRM.",
    de: "Jede Anfrage kommt strukturiert an, mit Kontext, Anfragetyp und nützlichen Daten für Follow-up und CRM.",
    nl: "Elke aanvraag komt gestructureerd binnen, met context, type aanvraag en nuttige gegevens voor opvolging en CRM.",
    es: "Cada solicitud entra de forma estructurada, con contexto, tipo de solicitud y datos útiles para seguimiento y CRM.",
    fr: "Chaque demande arrive de manière structurée, avec le contexte, le type de demande et des données utiles pour le suivi et le CRM."
  },
  "Posso inviare una richiesta B2B dal sito?": {
    en: "Can I send a B2B request from the website?",
    de: "Kann ich eine B2B-Anfrage über die Website senden?",
    nl: "Kan ik een B2B-aanvraag via de website versturen?",
    es: "¿Puedo enviar una solicitud B2B desde el sitio?",
    fr: "Puis-je envoyer une demande B2B depuis le site ?"
  },
  "Si. Le richieste B2B vengono raccolte con campi piu utili per capire attivita, volumi e priorita operative.": {
    en: "Yes. B2B requests are collected with fields that make it easier to understand business type, volumes and operational priorities.",
    de: "Ja. B2B-Anfragen werden mit Feldern erfasst, die Tätigkeit, Volumen und operative Prioritäten besser erkennen lassen.",
    nl: "Ja. B2B-aanvragen worden verzameld met velden die activiteit, volumes en operationele prioriteiten beter zichtbaar maken.",
    es: "Sí. Las solicitudes B2B se recogen con campos más útiles para entender actividad, volúmenes y prioridades operativas.",
    fr: "Oui. Les demandes B2B sont collectées avec des champs plus utiles pour comprendre l'activité, les volumes et les priorités opérationnelles."
  },
  "Se vi scrivo per consulenza il lead arriva gia categorizzato?": {
    en: "If I write for consulting, does the lead arrive already categorised?",
    de: "Wenn ich wegen Beratung schreibe, kommt der Lead schon kategorisiert an?",
    nl: "Als ik voor consultancy schrijf, komt de lead dan al gecategoriseerd binnen?",
    es: "Si os escribo por consultoría, ¿el lead llega ya categorizado?",
    fr: "Si je vous écris pour du conseil, le lead arrive-t-il déjà catégorisé ?"
  },
  "Si. Il sito porta in dashboard un lead gia etichettato per origine, tipologia e contesto della richiesta.": {
    en: "Yes. The website sends to the dashboard a lead already labelled by origin, type and request context.",
    de: "Ja. Die Website bringt in die Dashboard einen Lead, der bereits nach Herkunft, Typ und Kontext gekennzeichnet ist.",
    nl: "Ja. De website stuurt naar het dashboard een lead die al gelabeld is op herkomst, type en context van de aanvraag.",
    es: "Sí. El sitio lleva al dashboard un lead ya etiquetado por origen, tipología y contexto de la solicitud.",
    fr: "Oui. Le site envoie dans la dashboard un lead déjà étiqueté par origine, typologie et contexte de la demande."
  },
  "Posso essere ricontattato anche per collaborazioni o formazione?": {
    en: "Can I also be contacted back for collaborations or training?",
    de: "Kann ich auch für Kooperationen oder Schulungen kontaktiert werden?",
    nl: "Kan ik ook gecontacteerd worden voor samenwerkingen of training?",
    es: "¿Puedo ser contactado también por colaboraciones o formación?",
    fr: "Puis-je être recontacté aussi pour des collaborations ou de la formation ?"
  },
  "Si. Il form supporta richieste diverse, dalle collaborazioni ai corsi, senza passare da un contatto generico.": {
    en: "Yes. The form supports different requests, from collaborations to courses, without going through a generic contact channel.",
    de: "Ja. Das Formular unterstützt verschiedene Anfragen, von Kooperationen bis zu Kursen, ohne über einen generischen Kontakt zu gehen.",
    nl: "Ja. Het formulier ondersteunt verschillende aanvragen, van samenwerkingen tot opleidingen, zonder via een generiek contact te gaan.",
    es: "Sí. El formulario admite solicitudes diferentes, desde colaboraciones hasta cursos, sin pasar por un contacto genérico.",
    fr: "Oui. Le formulaire prend en charge différentes demandes, des collaborations aux cours, sans passer par un contact générique."
  },
  "Richiedi un contatto B2B": {
    en: "Request a B2B contact",
    de: "B2B-Kontakt anfragen",
    nl: "Vraag een B2B-contact aan",
    es: "Solicita un contacto B2B",
    fr: "Demander un contact B2B"
  },
  "Raccogliamo il lead con dati utili per preventivo, follow-up e CRM, non come semplice contatto generico.": {
    en: "We collect the lead with data useful for quotation, follow-up and CRM, not as a generic contact.",
    de: "Wir erfassen den Lead mit nützlichen Daten für Angebot, Follow-up und CRM, nicht als bloßen generischen Kontakt.",
    nl: "We verzamelen de lead met gegevens die nuttig zijn voor offerte, opvolging en CRM, niet als generiek contact.",
    es: "Recogemos el lead con datos útiles para presupuesto, seguimiento y CRM, no como un simple contacto genérico.",
    fr: "Nous collectons le lead avec des données utiles pour le devis, le suivi et le CRM, pas comme un simple contact générique."
  },
  "Invia richiesta B2B": { en: "Send B2B request", de: "B2B-Anfrage senden", nl: "B2B-aanvraag versturen", es: "Enviar solicitud B2B", fr: "Envoyer la demande B2B" },
  "Richiesta B2B inviata.": {
    en: "B2B request sent.",
    de: "B2B-Anfrage gesendet.",
    nl: "B2B-aanvraag verzonden.",
    es: "Solicitud B2B enviada.",
    fr: "Demande B2B envoyée."
  },
  "Richiesta consulenza inviata.": {
    en: "Consulting request sent.",
    de: "Beratungsanfrage gesendet.",
    nl: "Consultancy-aanvraag verzonden.",
    es: "Solicitud de consultoría enviada.",
    fr: "Demande de conseil envoyée."
  },
  "Lead inviato correttamente.": {
    en: "Lead sent successfully.",
    de: "Lead erfolgreich gesendet.",
    nl: "Lead succesvol verzonden.",
    es: "Lead enviado correctamente.",
    fr: "Lead envoyé correctement."
  },
  "Negozio": { en: "Store", de: "Geschäft", nl: "Winkel", es: "Tienda", fr: "Boutique" },
  "I nostri punti vendita": {
    en: "Our stores",
    de: "Unsere Verkaufsstellen",
    nl: "Onze verkooppunten",
    es: "Nuestros puntos de venta",
    fr: "Nos points de vente"
  },
  "Uno spazio reale a Iseo, un nuovo indirizzo in arrivo. Qui trovi solo le informazioni che servono.": {
    en: "A real space in Iseo, a new address coming soon. Here you only find the information you need.",
    de: "Ein realer Ort in Iseo, eine neue Adresse in Vorbereitung. Hier findest du nur die Informationen, die du brauchst.",
    nl: "Een echte plek in Iseo, een nieuw adres in aantocht. Hier vind je alleen de informatie die je nodig hebt.",
    es: "Un espacio real en Iseo, una nueva dirección en camino. Aquí encuentras solo la información que sirve.",
    fr: "Un espace réel à Iseo, une nouvelle adresse à venir. Ici, vous trouvez seulement les informations utiles."
  },
  "Punti vendita": { en: "Stores", de: "Verkaufsstellen", nl: "Winkels", es: "Puntos de venta", fr: "Points de vente" },
  "Dove trovarci.": { en: "Where to find us.", de: "Wo du uns findest.", nl: "Waar je ons vindt.", es: "Dónde encontrarnos.", fr: "Où nous trouver." },
  "Oggi ti accogliamo a Iseo. Il prossimo punto vendita e gia in preparazione.": {
    en: "Today we welcome you in Iseo. The next store is already in preparation.",
    de: "Heute empfangen wir dich in Iseo. Die nächste Verkaufsstelle ist bereits in Vorbereitung.",
    nl: "Vandaag ontvangen we je in Iseo. De volgende winkel is al in voorbereiding.",
    es: "Hoy te recibimos en Iseo. El próximo punto de venta ya está en preparación.",
    fr: "Aujourd'hui nous vous accueillons à Iseo. Le prochain point de vente est déjà en préparation."
  },
  "Negozio di Iseo": { en: "Iseo store", de: "Geschäft in Iseo", nl: "Winkel in Iseo", es: "Tienda de Iseo", fr: "Boutique d'Iseo" },
  "Fabio Nazzari Patisserie Chocolaterie, nel cuore di Iseo.": {
    en: "Fabio Nazzari Patisserie Chocolaterie, in the heart of Iseo.",
    de: "Fabio Nazzari Patisserie Chocolaterie, im Herzen von Iseo.",
    nl: "Fabio Nazzari Patisserie Chocolaterie, in het hart van Iseo.",
    es: "Fabio Nazzari Patisserie Chocolaterie, en el corazón de Iseo.",
    fr: "Fabio Nazzari Patisserie Chocolaterie, au cœur d'Iseo."
  },
  "Apri Iseo": { en: "Open Iseo", de: "Iseo öffnen", nl: "Open Iseo", es: "Abrir Iseo", fr: "Ouvrir Iseo" },
  "Prossima apertura": { en: "Next opening", de: "Nächste Eröffnung", nl: "Volgende opening", es: "Próxima apertura", fr: "Prochaine ouverture" },
  "Soon": { en: "Soon", de: "Bald", nl: "Binnenkort", es: "Pronto", fr: "Bientôt" },
  "Coming Soon": { en: "Coming Soon", de: "Demnächst", nl: "Binnenkort", es: "Muy pronto", fr: "Bientôt" },
  "Stiamo preparando il prossimo punto vendita. Qui comparira appena sara pronto.": {
    en: "We are preparing the next store. It will appear here as soon as it is ready.",
    de: "Wir bereiten die nächste Verkaufsstelle vor. Sie erscheint hier, sobald sie bereit ist.",
    nl: "We bereiden de volgende winkel voor. Die verschijnt hier zodra hij klaar is.",
    es: "Estamos preparando el próximo punto de venta. Aparecerá aquí en cuanto esté listo.",
    fr: "Nous préparons le prochain point de vente. Il apparaîtra ici dès qu'il sera prêt."
  },
  "In arrivo": { en: "On the way", de: "Kommt bald", nl: "Onderweg", es: "En camino", fr: "À venir" },
  "Info": { en: "Info", de: "Info", nl: "Info", es: "Info", fr: "Infos" },
  "Orari": { en: "Opening hours", de: "Öffnungszeiten", nl: "Openingstijden", es: "Horarios", fr: "Horaires" },
  "Aggiornati da Google": { en: "Updated from Google", de: "Von Google aktualisiert", nl: "Bijgewerkt via Google", es: "Actualizados por Google", fr: "Mis à jour depuis Google" },
  "Sto verificando gli orari del negozio...": {
    en: "Checking store opening hours...",
    de: "Öffnungszeiten werden überprüft...",
    nl: "Openingstijden worden gecontroleerd...",
    es: "Comprobando los horarios de la tienda...",
    fr: "Vérification des horaires du magasin..."
  },
  "Chiuso": { en: "Closed", de: "Geschlossen", nl: "Gesloten", es: "Cerrado", fr: "Fermé" },
  "Controlla Google per eventuali orari speciali.": {
    en: "Check Google for special hours.",
    de: "Prüfe Google auf eventuelle Sonderöffnungszeiten.",
    nl: "Controleer Google voor eventuele speciale openingstijden.",
    es: "Consulta Google por si hubiera horarios especiales.",
    fr: "Vérifiez Google pour d'éventuels horaires spéciaux."
  },
  "Apri mappa": { en: "Open map", de: "Karte öffnen", nl: "Kaart openen", es: "Abrir mapa", fr: "Ouvrir la carte" },
  "Chiama": { en: "Call", de: "Anrufen", nl: "Bel", es: "Llamar", fr: "Appeler" },
  "Nome": { en: "First name", de: "Vorname", nl: "Voornaam", es: "Nombre", fr: "Prénom" },
  "Cognome": { en: "Last name", de: "Nachname", nl: "Achternaam", es: "Apellido", fr: "Nom" },
  "Citta": { en: "City", de: "Stadt", nl: "Stad", es: "Ciudad", fr: "Ville" },
  "Italia": { en: "Italy", de: "Italien", nl: "Italië", es: "Italia", fr: "Italie" },
  "Lingua": { en: "Language", de: "Sprache", nl: "Taal", es: "Idioma", fr: "Langue" },
  "Tutti i diritti riservati.": {
    en: "All rights reserved.",
    de: "Alle Rechte vorbehalten.",
    nl: "Alle rechten voorbehouden.",
    es: "Todos los derechos reservados.",
    fr: "Tous droits réservés."
  },
  "Non sono riuscito a inviare la richiesta.": {
    en: "I couldn't send the request.",
    de: "Ich konnte die Anfrage nicht senden.",
    nl: "Ik kon het verzoek niet verzenden.",
    es: "No he podido enviar la solicitud.",
    fr: "Je n'ai pas réussi à envoyer la demande."
  },
  "Raccontaci volumi, tipologia cliente, prodotti di interesse e tempi.": {
    en: "Tell us about volumes, customer type, products of interest and timing.",
    de: "Erzähl uns etwas über Mengen, Kundentyp, gewünschte Produkte und Timing.",
    nl: "Vertel ons over volumes, klanttype, interessante producten en timing.",
    es: "Cuéntanos volúmenes, tipo de cliente, productos de interés y tiempos.",
    fr: "Parlez-nous des volumes, du type de client, des produits d'intérêt et du timing."
  },
  "Scrivi qui il contesto della richiesta.": {
    en: "Write the context of your request here.",
    de: "Schreibe hier den Kontext deiner Anfrage.",
    nl: "Schrijf hier de context van je aanvraag.",
    es: "Escribe aquí el contexto de tu solicitud.",
    fr: "Écrivez ici le contexte de votre demande."
  },
  "Prodotto artigianale senza glutine firmato Fabio Nazzari.": {
    en: "Artisanal gluten-free product signed by Fabio Nazzari.",
    de: "Handwerkliches glutenfreies Produkt von Fabio Nazzari.",
    nl: "Ambachtelijk glutenvrij product van Fabio Nazzari.",
    es: "Producto artesanal sin gluten firmado por Fabio Nazzari.",
    fr: "Produit artisanal sans gluten signé Fabio Nazzari."
  },
  "Disponibile": { en: "Available", de: "Verfügbar", nl: "Beschikbaar", es: "Disponible", fr: "Disponible" },
  "Esaurito": { en: "Sold out", de: "Ausverkauft", nl: "Uitverkocht", es: "Agotado", fr: "Épuisé" },
  "Senza glutine": { en: "Gluten free", de: "Glutenfrei", nl: "Glutenvrij", es: "Sin gluten", fr: "Sans gluten" },
  "Dettagli prodotto in arrivo.": {
    en: "Product details coming soon.",
    de: "Produktdetails folgen bald.",
    nl: "Productdetails volgen binnenkort.",
    es: "Detalles del producto próximamente.",
    fr: "Détails produit à venir."
  },
  "Da definire.": { en: "To be defined.", de: "Noch festzulegen.", nl: "Nog te bepalen.", es: "Por definir.", fr: "À définir." },
  "Dettagli": { en: "Details", de: "Details", nl: "Details", es: "Detalles", fr: "Détails" },
  "Aggiungi": { en: "Add", de: "Hinzufügen", nl: "Toevoegen", es: "Añadir", fr: "Ajouter" },
  "Non disponibile": {
    en: "Unavailable",
    de: "Nicht verfügbar",
    nl: "Niet beschikbaar",
    es: "No disponible",
    fr: "Indisponible"
  },
  "Consulenza Intollerante": {
    en: "Intollerante Consulting",
    de: "Intollerante Beratung",
    nl: "Intollerante Consultancy",
    es: "Consultoría Intollerante",
    fr: "Conseil Intollerante"
  },
  "Strategie innovative per aziende che vogliono eccellere nel mercato gluten-free. Dallo sviluppo prodotto alla formazione professionale.": {
    en: "Innovative strategies for companies that want to excel in the gluten-free market. From product development to professional training.",
    de: "Innovative Strategien für Unternehmen, die im glutenfreien Markt herausragen wollen. Von der Produktentwicklung bis zur professionellen Schulung.",
    nl: "Innovatieve strategieën voor bedrijven die willen uitblinken in de glutenvrije markt. Van productontwikkeling tot professionele training.",
    es: "Estrategias innovadoras para empresas que quieren destacar en el mercado gluten-free. Desde el desarrollo de producto hasta la formación profesional.",
    fr: "Des stratégies innovantes pour les entreprises qui veulent exceller sur le marché du sans gluten. Du développement produit à la formation professionnelle."
  },
  "Richiedi consulenza": {
    en: "Request consulting",
    de: "Beratung anfragen",
    nl: "Consultancy aanvragen",
    es: "Solicitar consultoría",
    fr: "Demander un conseil"
  },
  "Lascia il contesto giusto e ti ricontattiamo con una lettura gia orientata sul progetto.": {
    en: "Leave the right context and we will get back to you with a project-oriented first read.",
    de: "Hinterlasse den richtigen Kontext und wir melden uns mit einer bereits projektorientierten Einordnung zurück.",
    nl: "Laat de juiste context achter en we nemen contact op met een eerste lezing die al op het project is gericht.",
    es: "Déjanos el contexto adecuado y te contactaremos con una primera lectura ya orientada al proyecto.",
    fr: "Laissez le bon contexte et nous reviendrons vers vous avec une première lecture déjà orientée sur le projet."
  },
  "Compila i dati essenziali e racconta il progetto: il lead entra gia strutturato per CRM, follow-up e briefing.": {
    en: "Fill in the essential details and tell us about the project: the lead enters already structured for CRM, follow-up and briefing.",
    de: "Fülle die wichtigsten Daten aus und erzähle vom Projekt: Der Lead kommt bereits strukturiert für CRM, Follow-up und Briefing an.",
    nl: "Vul de essentiële gegevens in en vertel over het project: de lead komt al gestructureerd binnen voor CRM, opvolging en briefing.",
    es: "Completa los datos esenciales y cuéntanos el proyecto: el lead entra ya estructurado para CRM, seguimiento y briefing.",
    fr: "Renseignez les informations essentielles et racontez le projet : le lead arrive déjà structuré pour le CRM, le suivi et le briefing."
  },
  "Senza glutine, senza compromessi.": {
    en: "Gluten free, no compromises.",
    de: "Glutenfrei, ohne Kompromisse.",
    nl: "Glutenvrij, zonder compromissen.",
    es: "Sin gluten, sin concesiones.",
    fr: "Sans gluten, sans compromis."
  },
  "Lievitati, colazione, mignon e stagionali firmati Officina Intollerante.": {
    en: "Leavened cakes, breakfast, mignon and seasonal creations signed by Officina Intollerante.",
    de: "Große Hefeteige, Frühstück, Mignon und Saisonprodukte von Officina Intollerante.",
    nl: "Gerezen cakes, ontbijt, mignon en seizoensproducten van Officina Intollerante.",
    es: "Grandes fermentaciones, desayuno, mignon y estacionales firmados por Officina Intollerante.",
    fr: "Grands levés, petit-déjeuner, mignon et saisonniers signés Officina Intollerante."
  },
  "Prodotto del mese": {
    en: "Product of the month",
    de: "Produkt des Monats",
    nl: "Product van de maand",
    es: "Producto del mes",
    fr: "Produit du mois"
  },
  "Apri il catalogo": {
    en: "Open the catalogue",
    de: "Katalog öffnen",
    nl: "Open de catalogus",
    es: "Abrir el catálogo",
    fr: "Ouvrir le catalogue"
  },
  "In evidenza": { en: "Featured", de: "Im Fokus", nl: "Uitgelicht", es: "Destacado", fr: "À la une" },
  "Apri scheda": {
    en: "Open product page",
    de: "Produktseite öffnen",
    nl: "Open productpagina",
    es: "Abrir ficha",
    fr: "Ouvrir la fiche"
  },
  "Sei un'azienda? Qui trovi la linea B2B.": {
    en: "Are you a business? Find the B2B line here.",
    de: "Bist du ein Unternehmen? Hier findest du die B2B-Linie.",
    nl: "Ben je een bedrijf? Hier vind je de B2B-lijn.",
    es: "¿Eres una empresa? Aquí encuentras la línea B2B.",
    fr: "Vous êtes une entreprise ? Vous trouvez ici la ligne B2B."
  },
  "Apri le offerte B2B": {
    en: "Open B2B offers",
    de: "B2B-Angebote öffnen",
    nl: "Open B2B-aanbod",
    es: "Abrir ofertas B2B",
    fr: "Ouvrir les offres B2B"
  },
  "Cerca prodotto, collezione o keyword": {
    en: "Search product, collection or keyword",
    de: "Produkt, Kollektion oder Keyword suchen",
    nl: "Zoek product, collectie of keyword",
    es: "Buscar producto, colección o palabra clave",
    fr: "Rechercher un produit, une collection ou un mot-clé"
  },
  "Sto preparando il catalogo Officina...": {
    en: "Preparing the Officina catalogue...",
    de: "Der Officina-Katalog wird vorbereitet...",
    nl: "De Officina-catalogus wordt voorbereid...",
    es: "Preparando el catálogo Officina...",
    fr: "Préparation du catalogue Officina..."
  },
  "Nessun prodotto corrisponde al filtro.": {
    en: "No product matches the filter.",
    de: "Kein Produkt entspricht dem Filter.",
    nl: "Geen product komt overeen met het filter.",
    es: "Ningún producto coincide con el filtro.",
    fr: "Aucun produit ne correspond au filtre."
  },
  "Resetta filtri": {
    en: "Reset filters",
    de: "Filter zurücksetzen",
    nl: "Filters resetten",
    es: "Restablecer filtros",
    fr: "Réinitialiser les filtres"
  },
  "Tutti": { en: "All", de: "Alle", nl: "Alle", es: "Todos", fr: "Tous" },
  "Catalogo": { en: "Catalogue", de: "Katalog", nl: "Catalogus", es: "Catálogo", fr: "Catalogue" },
  "Prodotti.": { en: "Products.", de: "Produkte.", nl: "Producten.", es: "Productos.", fr: "Produits." },
  "Apri carrello": {
    en: "Open cart",
    de: "Warenkorb öffnen",
    nl: "Open cart",
    es: "Abrir carrito",
    fr: "Ouvrir le panier"
  },
  "Carrello ": { en: "Cart ", de: "Warenkorb ", nl: "Cart ", es: "Carrito ", fr: "Panier " },
  "Una linea pensata per aziende, insegne e progetti su scala più chiara.": {
    en: "A line designed for businesses, brands and projects with a clearer scale.",
    de: "Eine Linie für Unternehmen, Marken und Projekte mit klarerer Größenordnung.",
    nl: "Een lijn ontworpen voor bedrijven, merken en projecten met een duidelijkere schaal.",
    es: "Una línea pensada para empresas, enseñas y proyectos con una escala más clara.",
    fr: "Une ligne pensée pour les entreprises, enseignes et projets avec une échelle plus claire."
  },
  "Richiedi un preventivo": {
    en: "Request a quote",
    de: "Angebot anfragen",
    nl: "Vraag een offerte aan",
    es: "Solicitar presupuesto",
    fr: "Demander un devis"
  },
  "Torna a Officina": {
    en: "Back to Officina",
    de: "Zurück zu Officina",
    nl: "Terug naar Officina",
    es: "Volver a Officina",
    fr: "Retour à Officina"
  },
  "Fabio Nazzari in laboratorio": {
    en: "Fabio Nazzari in the lab",
    de: "Fabio Nazzari im Labor",
    nl: "Fabio Nazzari in het lab",
    es: "Fabio Nazzari en el laboratorio",
    fr: "Fabio Nazzari au laboratoire"
  },
  "Canali serviti": {
    en: "Served channels",
    de: "Bediente Kanäle",
    nl: "Bediende kanalen",
    es: "Canales atendidos",
    fr: "Canaux servis"
  },
  "Bar, ristorazione, catering e rivendita.": {
    en: "Bars, restaurants, catering and resale.",
    de: "Bars, Gastronomie, Catering und Wiederverkauf.",
    nl: "Bars, restaurants, catering en resale.",
    es: "Bares, restauración, catering y reventa.",
    fr: "Bars, restauration, catering et revente."
  },
  "Taglio commerciale": {
    en: "Commercial setup",
    de: "Commercialer Zuschnitt",
    nl: "Commerciële insteek",
    es: "Enfoque comercial",
    fr: "Approche commerciale"
  },
  "Preventivo su richiesta": {
    en: "Quote on request",
    de: "Angebot auf Anfrage",
    nl: "Offerte op aanvraag",
    es: "Presupuesto bajo solicitud",
    fr: "Devis sur demande"
  },
  "Parliamone": { en: "Let's talk", de: "Lass uns sprechen", nl: "Laten we praten", es: "Hablemos", fr: "Parlons-en" },
  "Canale cliente": { en: "Customer channel", de: "Kundenkanal", nl: "Klantkanaal", es: "Canal cliente", fr: "Canal client" },
  "Seleziona il tuo canale.": {
    en: "Select your channel.",
    de: "Wähle deinen Kanal.",
    nl: "Selecteer je kanaal.",
    es: "Selecciona tu canal.",
    fr: "Sélectionnez votre canal."
  },
  "Prezzo": { en: "Price", de: "Preis", nl: "Prijs", es: "Precio", fr: "Prix" },
  "Uso": { en: "Use", de: "Einsatz", nl: "Gebruik", es: "Uso", fr: "Usage" },
  "Richiedi disponibilità": {
    en: "Request availability",
    de: "Verfügbarkeit anfragen",
    nl: "Beschikbaarheid aanvragen",
    es: "Solicitar disponibilidad",
    fr: "Demander la disponibilité"
  },
  "Non sono riuscito ad aggiornare il carrello.": {
    en: "I couldn't update the cart.",
    de: "Ich konnte den Warenkorb nicht aktualisieren.",
    nl: "Ik kon de cart niet bijwerken.",
    es: "No he podido actualizar el carrito.",
    fr: "Je n'ai pas réussi à mettre à jour le panier."
  },
  "Non sono riuscito ad aggiornare la quantità.": {
    en: "I couldn't update the quantity.",
    de: "Ich konnte die Menge nicht aktualisieren.",
    nl: "Ik kon de hoeveelheid niet bijwerken.",
    es: "No he podido actualizar la cantidad.",
    fr: "Je n'ai pas réussi à mettre à jour la quantité."
  },
  "Non sono riuscito a rimuovere il prodotto.": {
    en: "I couldn't remove the product.",
    de: "Ich konnte das Produkt nicht entfernen.",
    nl: "Ik kon het product niet verwijderen.",
    es: "No he podido quitar el producto.",
    fr: "Je n'ai pas réussi à retirer le produit."
  }
};

const privacyTextDictionary = {
  "Informativa sul trattamento dei dati raccolti dal sito": {
    en: "Information on the processing of data collected through the website",
    de: "Informationen über die Verarbeitung der über die Website erhobenen Daten",
    nl: "Informatie over de verwerking van via de website verzamelde gegevens",
    es: "Información sobre el tratamiento de los datos recogidos a través del sitio web",
    fr: "Informations sur le traitement des données collectées via le site"
  },
  "Questa pagina descrive in modo sintetico come vengono trattati i dati inviati tramite i form del sito Officina Intollerante e delle pagine collegate a Fabio Nazzari.": {
    en: "This page briefly explains how data sent through the forms on the Officina Intollerante website and the related Fabio Nazzari pages is processed.",
    de: "Diese Seite beschreibt kurz, wie die Daten verarbeitet werden, die über die Formulare der Website Officina Intollerante und der mit Fabio Nazzari verbundenen Seiten gesendet werden.",
    nl: "Deze pagina legt kort uit hoe gegevens worden verwerkt die via de formulieren van de Officina Intollerante-website en de aan Fabio Nazzari gekoppelde pagina's worden verzonden.",
    es: "Esta página describe brevemente cómo se tratan los datos enviados a través de los formularios del sitio Officina Intollerante y de las páginas vinculadas a Fabio Nazzari.",
    fr: "Cette page explique brièvement comment les données envoyées via les formulaires du site Officina Intollerante et des pages liées à Fabio Nazzari sont traitées."
  },
  "Titolare del trattamento": { en: "Data controller", de: "Verantwortlicher", nl: "Verwerkingsverantwoordelijke", es: "Responsable del tratamiento", fr: "Responsable du traitement" },
  "Quali dati vengono raccolti": { en: "What data is collected", de: "Welche Daten werden erhoben", nl: "Welke gegevens worden verzameld", es: "Qué datos se recogen", fr: "Quelles données sont collectées" },
  "Dati identificativi e di contatto come nome, cognome, email e telefono.": {
    en: "Identification and contact data such as first name, last name, email and phone number.",
    de: "Identifikations- und Kontaktdaten wie Vorname, Nachname, E-Mail und Telefonnummer.",
    nl: "Identificatie- en contactgegevens zoals voornaam, achternaam, e-mail en telefoonnummer.",
    es: "Datos identificativos y de contacto como nombre, apellido, correo electrónico y teléfono.",
    fr: "Données d'identification et de contact telles que prénom, nom, e-mail et téléphone."
  },
  "Dati aziendali o operativi come azienda, citta, paese, indirizzo, sito web e profilo Instagram.": {
    en: "Business or operational data such as company name, city, country, address, website and Instagram profile.",
    de: "Unternehmens- oder Betriebsdaten wie Firmenname, Stadt, Land, Adresse, Website und Instagram-Profil.",
    nl: "Bedrijfs- of operationele gegevens zoals bedrijfsnaam, stad, land, adres, website en Instagram-profiel.",
    es: "Datos empresariales u operativos como empresa, ciudad, país, dirección, sitio web y perfil de Instagram.",
    fr: "Données d'entreprise ou opérationnelles telles que société, ville, pays, adresse, site web et profil Instagram."
  },
  "Informazioni sulla richiesta come tipologia, volume di interesse e messaggio libero.": {
    en: "Request information such as type, volume of interest and free message.",
    de: "Informationen zur Anfrage wie Typ, Interessensvolumen und Freitextnachricht.",
    nl: "Informatie over de aanvraag zoals type, interessevolume en vrij bericht.",
    es: "Información sobre la solicitud como tipología, volumen de interés y mensaje libre.",
    fr: "Informations sur la demande telles que type, volume d'intérêt et message libre."
  },
  "Dati tecnici legati all'invio del form, come pagina di origine e contesto della richiesta.": {
    en: "Technical data linked to form submission, such as source page and request context.",
    de: "Technische Daten im Zusammenhang mit dem Absenden des Formulars, wie Ursprungsseite und Anfragekontext.",
    nl: "Technische gegevens gekoppeld aan het verzenden van het formulier, zoals bronpagina en context van de aanvraag.",
    es: "Datos técnicos relacionados con el envío del formulario, como la página de origen y el contexto de la solicitud.",
    fr: "Données techniques liées à l'envoi du formulaire, comme la page d'origine et le contexte de la demande."
  },
  "Finalita del trattamento": { en: "Purposes of processing", de: "Zwecke der Verarbeitung", nl: "Doeleinden van de verwerking", es: "Finalidades del tratamiento", fr: "Finalités du traitement" },
  "Ricontattarti in merito alla richiesta inviata.": {
    en: "To contact you again regarding the request you sent.",
    de: "Um dich bezüglich der gesendeten Anfrage zu kontaktieren.",
    nl: "Om opnieuw contact met je op te nemen over de verzonden aanvraag.",
    es: "Para volver a contactarte sobre la solicitud enviada.",
    fr: "Pour vous recontacter au sujet de la demande envoyée."
  },
  "Gestire lead, preventivi, contatti commerciali e follow-up operativi.": {
    en: "To manage leads, quotations, commercial contacts and operational follow-up.",
    de: "Zur Verwaltung von Leads, Angeboten, geschäftlichen Kontakten und operativem Follow-up.",
    nl: "Om leads, offertes, commerciële contacten en operationele opvolging te beheren.",
    es: "Para gestionar leads, presupuestos, contactos comerciales y seguimiento operativo.",
    fr: "Pour gérer les leads, devis, contacts commerciaux et suivis opérationnels."
  },
  "Organizzare le informazioni nel CRM e nella dashboard interna per una presa in carico piu rapida.": {
    en: "To organise information inside the CRM and internal dashboard for faster handling.",
    de: "Um Informationen im CRM und im internen Dashboard für eine schnellere Bearbeitung zu organisieren.",
    nl: "Om informatie in het CRM en het interne dashboard te organiseren voor een snellere opvolging.",
    es: "Para organizar la información en el CRM y en el dashboard interno para una gestión más rápida.",
    fr: "Pour organiser les informations dans le CRM et la dashboard interne afin d'assurer une prise en charge plus rapide."
  },
  "Base giuridica": { en: "Legal basis", de: "Rechtsgrundlage", nl: "Rechtsgrond", es: "Base jurídica", fr: "Base juridique" },
  "Il trattamento avviene sulla base del consenso espresso tramite il checkbox presente nel form prima dell'invio della richiesta.": {
    en: "Processing is based on the consent expressed through the checkbox in the form before submitting the request.",
    de: "Die Verarbeitung erfolgt auf Grundlage der Einwilligung, die vor dem Absenden der Anfrage über das Kontrollkästchen im Formular erteilt wird.",
    nl: "De verwerking is gebaseerd op de toestemming die via het selectievakje in het formulier wordt gegeven voordat de aanvraag wordt verzonden.",
    es: "El tratamiento se realiza sobre la base del consentimiento expresado mediante la casilla presente en el formulario antes del envío de la solicitud.",
    fr: "Le traitement repose sur le consentement exprimé via la case à cocher présente dans le formulaire avant l'envoi de la demande."
  },
  "Modalita di trattamento": { en: "Processing methods", de: "Verarbeitungsweise", nl: "Verwerkingswijze", es: "Modalidad del tratamiento", fr: "Modalités de traitement" },
  "I dati vengono trattati con strumenti digitali e organizzativi idonei a limitarne l'accesso al solo personale autorizzato o ai collaboratori coinvolti nella gestione della richiesta.": {
    en: "Data is processed using digital and organisational tools designed to limit access to authorised staff or collaborators involved in handling the request.",
    de: "Die Daten werden mit digitalen und organisatorischen Mitteln verarbeitet, die den Zugriff auf autorisiertes Personal oder an der Bearbeitung beteiligte Mitarbeiter beschränken.",
    nl: "Gegevens worden verwerkt met digitale en organisatorische middelen die de toegang beperken tot geautoriseerd personeel of medewerkers die betrokken zijn bij de behandeling van de aanvraag.",
    es: "Los datos se tratan mediante herramientas digitales y organizativas adecuadas para limitar su acceso al personal autorizado o a los colaboradores implicados en la gestión de la solicitud.",
    fr: "Les données sont traitées au moyen d'outils numériques et organisationnels adaptés pour limiter l'accès au seul personnel autorisé ou aux collaborateurs impliqués dans la gestion de la demande."
  },
  "Conservazione dei dati": { en: "Data retention", de: "Speicherung der Daten", nl: "Bewaring van gegevens", es: "Conservación de los datos", fr: "Conservation des données" },
  "I dati vengono conservati per il tempo necessario a gestire la richiesta e gli eventuali rapporti conseguenti, salvo diversi obblighi di legge.": {
    en: "Data is stored for the time required to manage the request and any resulting relationship, unless different legal obligations apply.",
    de: "Die Daten werden so lange gespeichert, wie es für die Bearbeitung der Anfrage und etwaiger daraus entstehender Beziehungen erforderlich ist, sofern keine anderen gesetzlichen Pflichten gelten.",
    nl: "Gegevens worden bewaard zolang nodig is om de aanvraag en eventuele daaruit voortvloeiende relatie te beheren, tenzij andere wettelijke verplichtingen gelden.",
    es: "Los datos se conservan durante el tiempo necesario para gestionar la solicitud y la eventual relación derivada, salvo obligaciones legales distintas.",
    fr: "Les données sont conservées pendant le temps nécessaire à la gestion de la demande et des éventuelles relations qui en découlent, sauf obligations légales différentes."
  },
  "Diritti dell'interessato": { en: "Data subject rights", de: "Rechte der betroffenen Person", nl: "Rechten van de betrokkene", es: "Derechos del interesado", fr: "Droits de la personne concernée" },
  "Puoi richiedere accesso, rettifica, aggiornamento, limitazione o cancellazione dei tuoi dati scrivendo a": {
    en: "You may request access, rectification, update, restriction or deletion of your data by writing to",
    de: "Du kannst Zugang, Berichtigung, Aktualisierung, Einschränkung oder Löschung deiner Daten beantragen, indem du an folgende Adresse schreibst:",
    nl: "Je kunt toegang, rectificatie, actualisering, beperking of verwijdering van je gegevens aanvragen door te schrijven naar",
    es: "Puedes solicitar acceso, rectificación, actualización, limitación o supresión de tus datos escribiendo a",
    fr: "Vous pouvez demander l'accès, la rectification, la mise à jour, la limitation ou la suppression de vos données en écrivant à"
  },
  "Ultimo aggiornamento: 12 aprile 2026.": {
    en: "Last update: April 12, 2026.",
    de: "Letzte Aktualisierung: 12. April 2026.",
    nl: "Laatste update: 12 april 2026.",
    es: "Última actualización: 12 de abril de 2026.",
    fr: "Dernière mise à jour : 12 avril 2026."
  },
  "Torna al sito": { en: "Back to website", de: "Zurück zur Website", nl: "Terug naar de website", es: "Volver al sitio", fr: "Retour au site" },
  "Contatta via email": { en: "Contact by email", de: "Per E-Mail kontaktieren", nl: "Contact via e-mail", es: "Contactar por email", fr: "Contacter par e-mail" }
};

function replaceLiteral(content, from, to, label) {
  if (!content.includes(from)) {
    console.warn(`Missing literal: ${label}`);
    return content;
  }
  return content.split(from).join(to);
}

function replaceRegex(content, pattern, replacement, label) {
  if (!pattern.test(content)) {
    console.warn(`Missing pattern: ${label}`);
    return content;
  }
  return content.replace(pattern, replacement);
}

function toCode(value) {
  return JSON.stringify(value, null, 2);
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function buildSeoHeadMarkup(locale, page) {
  const currentPath = routeTable[locale][page];
  const alternateLinks = Object.keys(routeTable).map((targetLocale) => `    <link rel="alternate" hreflang="${targetLocale}" href="${escapeAttribute(routeTable[targetLocale][page])}" />`).join("\n");
  return [
    `    <meta property="og:url" content="${escapeAttribute(currentPath)}" />`,
    `    <meta property="og:locale" content="${escapeAttribute(localeMeta[locale].ogLocale)}" />`,
    `    <link rel="canonical" href="${escapeAttribute(currentPath)}" />`,
    alternateLinks,
    `    <link rel="alternate" hreflang="x-default" href="${escapeAttribute(routeTable.it.home)}" />`
  ].join("\n");
}

function buildPrivacySeoHeadMarkup(locale) {
  const currentPath = routeTable[locale].privacy;
  const alternateLinks = Object.keys(routeTable).map((targetLocale) => `    <link rel="alternate" hreflang="${targetLocale}" href="${escapeAttribute(routeTable[targetLocale].privacy)}" />`).join("\n");
  return [
    `    <meta name="description" content="${escapeAttribute(localeMeta[locale].privacyDescription)}" />`,
    `    <meta property="og:type" content="article" />`,
    `    <meta property="og:title" content="${escapeAttribute(localeMeta[locale].privacyTitle)}" />`,
    `    <meta property="og:description" content="${escapeAttribute(localeMeta[locale].privacyDescription)}" />`,
    `    <meta property="og:url" content="${escapeAttribute(currentPath)}" />`,
    `    <meta property="og:locale" content="${escapeAttribute(localeMeta[locale].ogLocale)}" />`,
    `    <link rel="canonical" href="${escapeAttribute(currentPath)}" />`,
    alternateLinks,
    `    <link rel="alternate" hreflang="x-default" href="${escapeAttribute(routeTable.it.privacy)}" />`
  ].join("\n");
}

function routePathToFilePath(routePath) {
  const cleaned = String(routePath || "/").replace(/^\/+/, "");
  return cleaned ? path.join(rootDir, cleaned, "index.html") : path.join(rootDir, "index.html");
}

function applySharedHead(html, locale, page = "home") {
  const meta = pageMetaByLocale[locale][page] || pageMetaByLocale[locale].home;
  let next = html;
  next = replaceLiteral(next, '<html lang="it">', `<html lang="${localeMeta[locale].lang}">`, `${locale} html lang`);
  next = replaceLiteral(next, "<title>Fabio Nazzari - L'eccellenza senza glutine</title>", `<title>${meta.title}</title>`, `${locale} ${page} title`);
  next = replaceLiteral(next, 'content="Consulenza, Officina Intollerante e Pasticceria a Iseo: un unico sito per entrare subito nel mondo giusto."', `content="${meta.description}"`, `${locale} meta description`);
  next = replaceLiteral(next, 'content="Fabio Nazzari - L\'eccellenza senza glutine"', `content="${meta.title}"`, `${locale} og title`);
  next = replaceRegex(
    next,
    /<meta name="twitter:card" content="summary_large_image">\n\s*<script>window\.__SITE_LOCALE__ = "it";<\/script>/,
    `<meta name="twitter:card" content="summary_large_image">\n${buildSeoHeadMarkup(locale, page)}\n    <script>window.__SITE_LOCALE__ = "${locale}";</script>`,
    `${locale} ${page} seo block`
  );
  return next;
}

function applyDataBlocks(html, locale) {
  if (locale === "it") {
    return html;
  }
  let next = html;
  next = replaceRegex(next, /const SEO_PAGE_META = [\s\S]*?};\n/, `const SEO_PAGE_META = ${toCode(pageMetaByLocale[locale])};\n`, `${locale} SEO_PAGE_META`);
  next = replaceRegex(next, /const OFFICINA_SORT_OPTIONS = [\s\S]*?];\n/, `const OFFICINA_SORT_OPTIONS = ${toCode(sortOptionsByLocale[locale])};\n`, `${locale} OFFICINA_SORT_OPTIONS`);
  next = replaceRegex(next, /const PASTICCERIA_FALLBACK_HOURS = [\s\S]*?];\n/, `const PASTICCERIA_FALLBACK_HOURS = ${toCode(fallbackHoursByLocale[locale])};\n`, `${locale} PASTICCERIA_FALLBACK_HOURS`);
  next = replaceRegex(next, /const PASTICCERIA_ISEO_DEFAULTS = [\s\S]*?};\n/, `const PASTICCERIA_ISEO_DEFAULTS = ${toCode(pastryDefaultsByLocale[locale])};\n`, `${locale} PASTICCERIA_ISEO_DEFAULTS`);
  next = replaceRegex(next, /const OFFICINA_FALLBACK_PRODUCTS = [\s\S]*?];\n/, `const OFFICINA_FALLBACK_PRODUCTS = ${toCode(fallbackProductsByLocale[locale])};\n`, `${locale} OFFICINA_FALLBACK_PRODUCTS`);
  next = replaceRegex(next, /const OFFICINA_B2B_CLIENT_SEGMENTS = [\s\S]*?];\n/, `const OFFICINA_B2B_CLIENT_SEGMENTS = ${toCode(b2bClientSegmentsByLocale[locale])};\n`, `${locale} OFFICINA_B2B_CLIENT_SEGMENTS`);
  next = replaceRegex(next, /const OFFICINA_B2B_CATALOG = [\s\S]*?];\n/, `const OFFICINA_B2B_CATALOG = ${toCode(b2bCatalogByLocale[locale])};\n`, `${locale} OFFICINA_B2B_CATALOG`);
  next = replaceRegex(next, /const LEAD_REQUEST_OPTIONS = [\s\S]*?];\n/, `const LEAD_REQUEST_OPTIONS = ${toCode(leadRequestOptionsByLocale[locale])};\n`, `${locale} LEAD_REQUEST_OPTIONS`);
  next = replaceRegex(next, /const LEAD_ACTIVITY_OPTIONS = [\s\S]*?];\n/, `const LEAD_ACTIVITY_OPTIONS = ${toCode(leadActivityOptionsByLocale[locale])};\n`, `${locale} LEAD_ACTIVITY_OPTIONS`);
  next = replaceRegex(next, /const LEAD_VOLUME_OPTIONS = [\s\S]*?];\n/, `const LEAD_VOLUME_OPTIONS = ${toCode(leadVolumeOptionsByLocale[locale])};\n`, `${locale} LEAD_VOLUME_OPTIONS`);
  next = replaceRegex(next, /const COOKIE_CATEGORY_DETAILS = [\s\S]*?];\n/, `const COOKIE_CATEGORY_DETAILS = ${toCode(cookieCategoriesByLocale[locale])};\n`, `${locale} COOKIE_CATEGORY_DETAILS`);
  next = replaceRegex(next, /const homeWorlds = [\s\S]*?];\n/, `const homeWorlds = ${toCode(homeWorldsByLocale[locale])};\n`, `${locale} homeWorlds`);
  next = replaceRegex(next, /const consultingServices = [\s\S]*?];\n/, `const consultingServices = ${toCode(consultingServicesByLocale[locale])};\n`, `${locale} consultingServices`);
  return next;
}

function applyDictionary(content, locale, dictionary, label) {
  let next = content;
  const entries = Object.entries(dictionary).sort((first, second) => second[0].length - first[0].length);
  for (const [from, translations] of entries) {
    if (!translations[locale]) {
      continue;
    }
    next = replaceLiteral(next, from, translations[locale], `${label}:${from.slice(0, 32)}`);
  }
  return next;
}

function applyPrivacyHead(html, locale) {
  const meta = localeMeta[locale];
  let localized = html;
  localized = replaceLiteral(localized, '<html lang="it">', `<html lang="${meta.lang}">`, `${locale} privacy html lang`);
  localized = replaceRegex(
    localized,
    /<title>[\s\S]*?<meta property="og:description"[^>]+>\n/,
    `<title>${meta.privacyTitle}</title>\n${buildPrivacySeoHeadMarkup(locale)}\n`,
    `${locale} privacy seo`
  );
  return localized;
}

async function writeRouteHtml(locale, page) {
  const baseHtml = await fs.readFile(baseHtmlPath, "utf8");
  let localized = applySharedHead(baseHtml, locale, page);
  localized = applyDataBlocks(localized, locale);
  if (locale !== "it") {
    localized = applyDictionary(localized, locale, textDictionary, `html-${locale}`);
  }
  const outputPath = routePathToFilePath(routeTable[locale][page]);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, localized, "utf8");
}

async function writePrivacyPage(locale) {
  const basePrivacy = await fs.readFile(basePrivacyPath, "utf8");
  let localized = applyPrivacyHead(basePrivacy, locale);
  if (locale !== "it") {
    localized = applyDictionary(localized, locale, privacyTextDictionary, `privacy-${locale}`);
  }
  localized = replaceLiteral(localized, 'href="/"', `href="${routeTable[locale].home}"`, `${locale} privacy home link`);
  const outputPath = routePathToFilePath(routeTable[locale].privacy);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, localized, "utf8");
}

async function main() {
  for (const locale of Object.keys(routeTable)) {
    for (const page of sitePages) {
      await writeRouteHtml(locale, page);
    }
    await writePrivacyPage(locale);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
