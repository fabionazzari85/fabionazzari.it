const DEFAULT_LOCALE_DATA = {
  it: {
    updatedAt: "2026-04-22T00:00:00.000Z",
    data: {
      profile: {
        eyebrow: "Fabio Nazzari",
        title: "Link in bio",
        subtitle:
          "Una landing rapida e pulita, pensata per i social, con tutti i collegamenti piu utili del tuo mondo.",
        image: "/assets/photos/fabio-ritratto-grissini.jpeg",
        alt: "Fabio Nazzari in ritratto editoriale"
      },
      socials: [
        {
          label: "Instagram",
          href: "https://instagram.com/fabionazzari",
          icon: "instagram",
          enabled: true
        },
        {
          label: "Facebook",
          href: "https://www.facebook.com/fabionazzari.pastry",
          icon: "facebook",
          enabled: true
        },
        {
          label: "YouTube",
          href: "https://www.youtube.com/c/FabioNazzari",
          icon: "youtube",
          enabled: true
        },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/fabio-nazzari-52912a19/",
          icon: "linkedin",
          enabled: true
        }
      ],
      links: [
        {
          id: "shop-seasonal",
          label: "LE MIE COLOMBE SENZA GLUTINE - e tanto altro!",
          description: "Il collegamento principale al catalogo attuale.",
          href: "https://officinaintollerante.it/pasqua-intollerante",
          tag: "Shop",
          featured: true,
          enabled: true
        },
        {
          id: "pastry-iseo",
          label: "Sei a Iseo? Passa in pasticceria!",
          description: "Il profilo dedicato al punto vendita di Iseo.",
          href: "https://www.instagram.com/fabionazzaripatisserie_iseo/",
          tag: "Iseo",
          featured: false,
          enabled: true
        },
        {
          id: "project-whatsapp",
          label: "Parlami del tuo progetto",
          description: "Apri subito il contatto diretto su WhatsApp.",
          href: "https://api.whatsapp.com/send?phone=393513554123&text=Hi%20Fabio!%20I%20would%20like%20to%20book%20a%20consultancy%20call%20with%20you!%20:)%20",
          tag: "WhatsApp",
          featured: false,
          enabled: true
        },
        {
          id: "newsletter",
          label: "Iscriviti alla newsletter",
          description: "Aggiornamenti, ricette e novita del tuo mondo.",
          href: "https://mailchi.mp/9cbfd1bc8d13/newsletterfn",
          tag: "Newsletter",
          featured: false,
          enabled: true
        },
        {
          id: "artisan-pastry",
          label: "Pasticceria artigianale senza glutine e lattosio",
          description: "Il sito storico di riferimento per prodotti e brand.",
          href: "https://officinaintollerante.it/",
          tag: "Brand",
          featured: false,
          enabled: true
        },
        {
          id: "official-site",
          label: "Sito ufficiale Fabio Nazzari",
          description: "Consulenza, B2B, pasticceria e contatti in un unico sito.",
          href: "/",
          tag: "Website",
          featured: false,
          enabled: true
        }
      ]
    }
  },
  en: {
    updatedAt: "2026-04-22T00:00:00.000Z",
    data: {
      profile: {
        eyebrow: "Fabio Nazzari",
        title: "Link in bio",
        subtitle:
          "A cleaner social-first landing page with the most useful links from the Fabio Nazzari world.",
        image: "/assets/photos/fabio-ritratto-grissini.jpeg",
        alt: "Editorial portrait of Fabio Nazzari"
      },
      socials: [
        {
          label: "Instagram",
          href: "https://instagram.com/fabionazzari",
          icon: "instagram",
          enabled: true
        },
        {
          label: "Facebook",
          href: "https://www.facebook.com/fabionazzari.pastry",
          icon: "facebook",
          enabled: true
        },
        {
          label: "YouTube",
          href: "https://www.youtube.com/c/FabioNazzari",
          icon: "youtube",
          enabled: true
        },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/fabio-nazzari-52912a19/",
          icon: "linkedin",
          enabled: true
        }
      ],
      links: [
        {
          id: "shop-seasonal",
          label: "MY GLUTEN-FREE EASTER COLLECTION - and more!",
          description: "Main shortcut to the current featured catalogue.",
          href: "https://officinaintollerante.it/pasqua-intollerante",
          tag: "Shop",
          featured: true,
          enabled: true
        },
        {
          id: "pastry-iseo",
          label: "Are you in Iseo? Stop by my pastry shop!",
          description: "Dedicated profile for the Iseo pastry destination.",
          href: "https://www.instagram.com/fabionazzaripatisserie_iseo/",
          tag: "Iseo",
          featured: false,
          enabled: true
        },
        {
          id: "project-whatsapp",
          label: "Talk to me about your project",
          description: "Open the direct WhatsApp conversation.",
          href: "https://api.whatsapp.com/send?phone=393513554123&text=Hi%20Fabio!%20I%20would%20like%20to%20book%20a%20consultancy%20call%20with%20you!%20:)%20",
          tag: "WhatsApp",
          featured: false,
          enabled: true
        },
        {
          id: "newsletter",
          label: "Subscribe to my newsletter",
          description: "Updates, recipes and news from my world.",
          href: "https://mailchi.mp/9cbfd1bc8d13/newsletterfn",
          tag: "Newsletter",
          featured: false,
          enabled: true
        },
        {
          id: "artisan-pastry",
          label: "Gluten-free and lactose-free artisan pastry",
          description: "Legacy brand website and key references.",
          href: "https://officinaintollerante.it/",
          tag: "Brand",
          featured: false,
          enabled: true
        },
        {
          id: "official-site",
          label: "Fabio Nazzari official website",
          description: "Consulting, B2B, pastry shop and contacts in one place.",
          href: "/en",
          tag: "Website",
          featured: false,
          enabled: true
        }
      ]
    }
  }
};

const ICONS = {
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"></rect><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.7"></circle><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"></circle></svg>',
  facebook:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 21V12.8H16l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.7-1.5h1.8V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.6v2H7v3.2h2.7V21h3.5Z" fill="currentColor"></path></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.2 7.3c-.2-.9-.9-1.6-1.8-1.8C17.8 5 12 5 12 5s-5.8 0-7.4.5c-.9.2-1.6.9-1.8 1.8C2.3 8.9 2.3 12 2.3 12s0 3.1.5 4.7c.2.9.9 1.6 1.8 1.8 1.6.5 7.4.5 7.4.5s5.8 0 7.4-.5c.9-.2 1.6-.9 1.8-1.8.5-1.6.5-4.7.5-4.7s0-3.1-.5-4.7ZM10.2 15.7V8.3L16.5 12l-6.3 3.7Z" fill="currentColor"></path></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 8.8H3.2V20h3.4V8.8Zm.2-3.5c0-1.1-.8-1.9-1.9-1.9S3 4.2 3 5.3c0 1.1.8 1.9 1.9 1.9S6.8 6.4 6.8 5.3Zm13.2 7.8c0-3.4-1.8-5-4.3-5-2 0-2.9 1.1-3.4 1.8V8.8H8.9c0 .7 0 11.2 0 11.2h3.4v-6.2c0-.3 0-.7.1-.9.2-.7.8-1.5 1.8-1.5 1.3 0 1.9 1 1.9 2.5V20H20v-6.9Z" fill="currentColor"></path></svg>',
  whatsapp:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2a8.6 8.6 0 0 0-7.4 13l-1.3 4.6 4.7-1.2A8.6 8.6 0 1 0 12 3.2Zm0 15.6c-1.2 0-2.3-.3-3.3-.9l-.2-.1-2.8.7.8-2.7-.2-.3a6.7 6.7 0 1 1 5.7 3.3Zm3.7-5c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.4.1-.1.2-.5.7-.6.8-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.6-1-.6-.5-1.1-1.2-1.2-1.4-.1-.2 0-.3.1-.4l.3-.3.2-.4c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.3-.6-.3h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.4.9 2.5c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.3-1 .2-.5.2-.9.1-1 0-.1-.2-.1-.4-.2Z" fill="currentColor"></path></svg>',
  globe:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" fill="none" stroke="currentColor" stroke-width="1.7"></path></svg>',
  mail:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"></rect><path d="m5.5 7.5 6.5 5 6.5-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  map:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" fill="none" stroke="currentColor" stroke-width="1.7"></path><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="1.7"></circle></svg>',
  shop:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8.5V7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v1.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path><path d="M4.5 8.5h15l-1 11.2a1.5 1.5 0 0 1-1.5 1.3h-10a1.5 1.5 0 0 1-1.5-1.3L4.5 8.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path></svg>'
};

const config = window.BIO_PAGE_CONFIG || {};
const isFilePreview = window.location.protocol === "file:";

const elements = {
  homeLink: document.getElementById("home-link"),
  langLink: document.getElementById("lang-link"),
  profileImage: document.getElementById("profile-image"),
  profileEyebrow: document.getElementById("profile-eyebrow"),
  profileTitle: document.getElementById("profile-title"),
  profileSubtitle: document.getElementById("profile-subtitle"),
  socialList: document.getElementById("social-list"),
  sectionKicker: document.getElementById("section-kicker"),
  sectionTitle: document.getElementById("section-title"),
  sectionCopy: document.getElementById("section-copy"),
  mainLinks: document.getElementById("main-links"),
  dataStatus: document.getElementById("data-status"),
  footerLeft: document.getElementById("footer-left"),
  footerRight: document.getElementById("footer-right")
};

const resolveRelativePath = (value) => {
  if (!isFilePreview || !value || !String(value).startsWith("/")) {
    return value;
  }
  return `${config.rootPrefix || ""}${String(value).replace(/^\/+/, "")}`;
};

const applyTarget = (anchor, href) => {
  if (/^https?:\/\//i.test(href)) {
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
  }
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(config.locale === "en" ? "en-US" : "it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch (error) {
    return "";
  }
};

const getIconMarkup = (icon) => ICONS[icon] || ICONS.globe;

const renderSocials = (items = []) => {
  elements.socialList.innerHTML = "";

  const socials = items.filter((item) => item && item.href && item.enabled !== false);
  socials.forEach((item) => {
    const anchor = document.createElement("a");
    anchor.className = "bio-social";
    anchor.href = resolveRelativePath(item.href);
    anchor.setAttribute("aria-label", item.label || "Social");
    anchor.innerHTML = getIconMarkup(item.icon);
    applyTarget(anchor, item.href);
    elements.socialList.appendChild(anchor);
  });
};

const renderLinks = (items = []) => {
  elements.mainLinks.innerHTML = "";

  const links = items.filter((item) => item && item.href && item.enabled !== false);
  if (!links.length) {
    const empty = document.createElement("div");
    empty.className = "bio-empty";
    empty.textContent =
      config.locale === "en"
        ? "No links are active right now."
        : "Non ci sono link attivi in questo momento.";
    elements.mainLinks.appendChild(empty);
    return;
  }

  links.forEach((item) => {
    const anchor = document.createElement("a");
    anchor.className = `bio-link-button${item.featured ? " is-featured" : ""}`;
    anchor.href = resolveRelativePath(item.href);
    applyTarget(anchor, item.href);

    const copy = document.createElement("div");
    copy.className = "bio-link-copy";

    const head = document.createElement("div");
    head.className = "bio-link-head";

    const label = document.createElement("span");
    label.className = "bio-link-label";
    label.textContent = item.label || "";
    head.appendChild(label);

    if (item.tag) {
      const tag = document.createElement("span");
      tag.className = "bio-link-tag";
      tag.textContent = item.tag;
      head.appendChild(tag);
    }

    copy.appendChild(head);

    if (item.description) {
      const description = document.createElement("p");
      description.className = "bio-link-description";
      description.textContent = item.description;
      copy.appendChild(description);
    }

    const arrow = document.createElement("span");
    arrow.className = "bio-link-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    anchor.append(copy, arrow);
    elements.mainLinks.appendChild(anchor);
  });
};

const renderPage = (payload, {fallback = false} = {}) => {
  const profile = payload.data.profile || {};

  elements.profileImage.src = resolveRelativePath(profile.image);
  elements.profileImage.alt = profile.alt || "Fabio Nazzari";
  elements.profileEyebrow.textContent = profile.eyebrow || "";
  elements.profileTitle.textContent = profile.title || "";
  elements.profileSubtitle.textContent = profile.subtitle || "";
  elements.sectionKicker.textContent = config.sectionKicker || "";
  elements.sectionTitle.textContent = config.sectionTitle || "";
  elements.sectionCopy.textContent = config.sectionCopy || "";
  elements.footerLeft.textContent = config.footerLeft || "";
  elements.footerRight.textContent = config.footerRight || "";
  elements.homeLink.href = config.homeHref || "#";
  elements.homeLink.textContent = config.homeLabel || "fabionazzari.it";
  elements.langLink.href = config.languageHref || "#";
  elements.langLink.textContent = config.languageLabel || "";

  renderSocials(payload.data.socials || []);
  renderLinks(payload.data.links || []);

  const formattedDate = formatDate(payload.updatedAt);
  elements.dataStatus.textContent = fallback
    ? config.fallbackStatus ||
      (config.locale === "en"
        ? "Preview mode: the published site will load the links saved from the private admin panel."
        : "Modalita anteprima: sul sito pubblicato verranno caricati i link salvati dal pannello riservato.")
    : formattedDate
      ? `${config.updatedPrefix || ""}${formattedDate}`
      : "";
};

const loadData = async () => {
  const fallbackPayload = DEFAULT_LOCALE_DATA[config.locale === "en" ? "en" : "it"];

  try {
    const response = await fetch(`${config.apiEndpoint}?locale=${config.locale}`, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.ok || !payload.data) {
      throw new Error("Invalid payload");
    }

    renderPage(payload, {fallback: false});
  } catch (error) {
    renderPage(fallbackPayload, {fallback: true});
  }
};

window.addEventListener("DOMContentLoaded", loadData);
