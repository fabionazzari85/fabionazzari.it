import {getStore} from "@netlify/blobs";
import {createHmac, timingSafeEqual} from "node:crypto";

const BIO_STORE_NAME = "fabio-bio-links";
const BIO_STORE_KEY = "published";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const DEFAULT_IMAGE = "/assets/photos/fabio-ritratto-grissini.jpeg";
const DEFAULT_UPDATED_AT = "2026-04-22T00:00:00.000Z";

const ALLOWED_SOCIAL_ICONS = new Set([
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "tiktok",
  "whatsapp",
  "mail",
  "map",
  "shop",
  "globe"
]);

export const DEFAULT_BIO_DATA = {
  version: 1,
  updatedAt: DEFAULT_UPDATED_AT,
  locales: {
    it: {
      profile: {
        eyebrow: "Fabio Nazzari",
        title: "Link in bio",
        subtitle:
          "Una landing rapida e pulita, pensata per i social, con tutti i collegamenti piu utili del tuo mondo.",
        image: DEFAULT_IMAGE,
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
    },
    en: {
      profile: {
        eyebrow: "Fabio Nazzari",
        title: "Link in bio",
        subtitle:
          "A cleaner social-first landing page with the most useful links from the Fabio Nazzari world.",
        image: DEFAULT_IMAGE,
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

const deepCopy = (value) => JSON.parse(JSON.stringify(value));

const trimToLength = (value, maxLength, fallback = "") => {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized.slice(0, maxLength) : fallback;
};

const normalizeUrl = (value, fallback = "") => {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return fallback;
  }

  if (/^(mailto:|tel:|https?:\/\/|\/)/i.test(raw)) {
    return raw;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) {
    return `https://${raw}`;
  }

  return raw;
};

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(lowered)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(lowered)) {
      return false;
    }
  }

  return fallback;
};

const normalizeIcon = (value, fallback = "globe") => {
  const normalized = trimToLength(value, 24, fallback).toLowerCase();
  return ALLOWED_SOCIAL_ICONS.has(normalized) ? normalized : fallback;
};

const normalizeProfile = (value = {}, fallback) => ({
  eyebrow: trimToLength(value.eyebrow, 80, fallback.eyebrow),
  title: trimToLength(value.title, 80, fallback.title),
  subtitle: trimToLength(value.subtitle, 240, fallback.subtitle),
  image: normalizeUrl(value.image, fallback.image),
  alt: trimToLength(value.alt, 120, fallback.alt)
});

const normalizeSocialItem = (value = {}, fallback = {}, index = 0) => ({
  id: trimToLength(value.id, 48, fallback.id || `social-${index + 1}`),
  label: trimToLength(value.label, 40, fallback.label || "Social"),
  href: normalizeUrl(value.href, fallback.href || ""),
  icon: normalizeIcon(value.icon, fallback.icon || "globe"),
  enabled: normalizeBoolean(value.enabled, fallback.enabled ?? true)
});

const normalizeLinkItem = (value = {}, fallback = {}, index = 0) => ({
  id: trimToLength(value.id, 48, fallback.id || `link-${index + 1}`),
  label: trimToLength(value.label, 120, fallback.label || "Nuovo link"),
  description: trimToLength(value.description, 180, fallback.description || ""),
  href: normalizeUrl(value.href, fallback.href || ""),
  tag: trimToLength(value.tag, 24, fallback.tag || ""),
  featured: normalizeBoolean(value.featured, fallback.featured ?? false),
  enabled: normalizeBoolean(value.enabled, fallback.enabled ?? true)
});

const normalizeList = (items, fallbackItems, normalizer) => {
  const sourceItems = Array.isArray(items) && items.length ? items : fallbackItems;
  return sourceItems
    .map((item, index) => normalizer(item, fallbackItems[index] || {}, index))
    .filter((item) => item.href);
};

const normalizeLocale = (value = {}, fallback) => ({
  profile: normalizeProfile(value.profile || {}, fallback.profile),
  socials: normalizeList(value.socials, fallback.socials, normalizeSocialItem),
  links: normalizeList(value.links, fallback.links, normalizeLinkItem)
});

export const sanitizeBioData = (value = {}) => {
  const fallback = deepCopy(DEFAULT_BIO_DATA);
  return {
    version: 1,
    updatedAt: trimToLength(value.updatedAt, 64, fallback.updatedAt),
    locales: {
      it: normalizeLocale(value.locales?.it || {}, fallback.locales.it),
      en: normalizeLocale(value.locales?.en || {}, fallback.locales.en)
    }
  };
};

export const getStoreInstance = () => getStore(BIO_STORE_NAME);

export const readBioData = async () => {
  const store = getStoreInstance();
  const storedData = await store.get(BIO_STORE_KEY, {type: "json"});

  if (!storedData || typeof storedData !== "object") {
    return deepCopy(DEFAULT_BIO_DATA);
  }

  return sanitizeBioData(storedData);
};

export const writeBioData = async (value) => {
  const store = getStoreInstance();
  const nextData = sanitizeBioData({
    ...value,
    updatedAt: new Date().toISOString()
  });

  await store.setJSON(BIO_STORE_KEY, nextData);
  return nextData;
};

const getAdminPassword = () => String(process.env.BIO_ADMIN_PASSWORD || "").trim();

const getSessionSecret = () =>
  String(process.env.BIO_ADMIN_SESSION_SECRET || process.env.BIO_ADMIN_PASSWORD || "").trim();

export const isAdminConfigured = () => Boolean(getAdminPassword() && getSessionSecret());

const base64UrlEncode = (value) => Buffer.from(value, "utf8").toString("base64url");

const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");

const signPayload = (payload) =>
  createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");

export const createAdminToken = () => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = JSON.stringify({
    role: "bio-admin",
    exp: expiresAt
  });

  const token = `${base64UrlEncode(payload)}.${signPayload(payload)}`;
  return {token, expiresAt};
};

export const verifyAdminPassword = (value) => {
  const expected = getAdminPassword();
  const received = String(value || "");

  if (!expected || !received) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const validateAdminToken = (token) => {
  if (!token) {
    return {ok: false, code: "missing_token"};
  }

  const [encodedPayload, signature] = String(token).split(".");
  if (!encodedPayload || !signature) {
    return {ok: false, code: "invalid_token"};
  }

  let payload;
  try {
    payload = base64UrlDecode(encodedPayload);
  } catch (error) {
    return {ok: false, code: "invalid_token"};
  }

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return {ok: false, code: "invalid_signature"};
  }

  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payload);
  } catch (error) {
    return {ok: false, code: "invalid_payload"};
  }

  if (parsedPayload.role !== "bio-admin" || typeof parsedPayload.exp !== "number") {
    return {ok: false, code: "invalid_payload"};
  }

  if (Date.now() > parsedPayload.exp) {
    return {ok: false, code: "expired_token"};
  }

  return {ok: true, payload: parsedPayload};
};

export const getBearerToken = (request) => {
  const authorization = request.headers.get("authorization") || "";
  return authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
};

export const jsonResponse = (body, {status = 200, cache = "no-store"} = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache
    }
  });
