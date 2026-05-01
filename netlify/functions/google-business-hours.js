"use strict";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ACCOUNT_MANAGEMENT_API = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_API = "https://mybusinessbusinessinformation.googleapis.com/v1";

const CLIENT_ID = process.env.GOOGLE_GBP_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_GBP_CLIENT_SECRET || "";
const REFRESH_TOKEN = process.env.GOOGLE_GBP_REFRESH_TOKEN || "";
const LOCATION_NAME = process.env.GOOGLE_GBP_LOCATION_NAME || "";
const ACCOUNT_NAME = process.env.GOOGLE_GBP_ACCOUNT_NAME || "";
const LOCATION_TITLE = process.env.GOOGLE_GBP_LOCATION_TITLE || "";
const STORE_CODE = process.env.GOOGLE_GBP_STORE_CODE || "";

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_LABELS = {
  MONDAY: "Lun",
  TUESDAY: "Mar",
  WEDNESDAY: "Mer",
  THURSDAY: "Gio",
  FRIDAY: "Ven",
  SATURDAY: "Sab",
  SUNDAY: "Dom"
};

const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=1800"
};

const json = (statusCode, body) => ({
  statusCode,
  headers: responseHeaders,
  body: JSON.stringify(body)
});

const isConfigured = () => Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN && (LOCATION_NAME || ACCOUNT_NAME));

const toTitleCase = (value) => String(value || "").trim().toLowerCase();

const formatTime = (time) => {
  if (!time || typeof time.hours !== "number") {
    return "";
  }
  const hours = String(time.hours).padStart(2, "0");
  const minutes = String(time.minutes || 0).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const createSchedule = () => DAY_ORDER.map((day) => ({
  key: day,
  day: DAY_LABELS[day],
  intervals: []
}));

const dayIndex = (day) => DAY_ORDER.indexOf(day);

const pushInterval = (schedule, day, interval) => {
  const entry = schedule[dayIndex(day)];
  if (entry && interval) {
    entry.intervals.push(interval);
  }
};

const expandPeriod = (schedule, period) => {
  if (!period || !period.openDay || !period.openTime || !period.closeDay || !period.closeTime) {
    return;
  }

  const openIndex = dayIndex(period.openDay);
  const closeIndex = dayIndex(period.closeDay);

  if (openIndex === -1 || closeIndex === -1) {
    return;
  }

  const openTime = formatTime(period.openTime);
  const closeTime = formatTime(period.closeTime);

  if (openIndex === closeIndex) {
    pushInterval(schedule, period.openDay, `${openTime} - ${closeTime}`);
    return;
  }

  pushInterval(schedule, period.openDay, `${openTime} - 24:00`);

  let index = (openIndex + 1) % DAY_ORDER.length;
  while (index !== closeIndex) {
    pushInterval(schedule, DAY_ORDER[index], "00:00 - 24:00");
    index = (index + 1) % DAY_ORDER.length;
  }

  pushInterval(schedule, period.closeDay, `00:00 - ${closeTime}`);
};

const normalizeHours = (regularHours) => {
  const schedule = createSchedule();
  (regularHours && Array.isArray(regularHours.periods) ? regularHours.periods : []).forEach((period) => {
    expandPeriod(schedule, period);
  });
  return schedule;
};

const formatAddress = (address) => {
  if (!address) {
    return "";
  }
  const lines = Array.isArray(address.addressLines) ? address.addressLines.filter(Boolean) : [];
  const localityParts = [address.postalCode, address.locality, address.administrativeArea].filter(Boolean);
  return [...lines, localityParts.join(" ")].filter(Boolean).join(", ");
};

const pickPrimaryPhone = (phoneNumbers) => {
  if (!phoneNumbers) {
    return "";
  }
  return phoneNumbers.primaryPhone || (Array.isArray(phoneNumbers.additionalPhones) && phoneNumbers.additionalPhones[0]) || "";
};

const readJson = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
};

const getAccessToken = async () => {
  const payload = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: "refresh_token"
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString()
  });

  const data = await readJson(response);
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Non sono riuscito a ottenere il token Google.");
  }

  return data.access_token;
};

const googleFetch = async (url, accessToken) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-GOOG-API-FORMAT-VERSION": "2"
    }
  });

  const data = await readJson(response);
  if (!response.ok) {
    const message = data.error && data.error.message ? data.error.message : "Google Business Profile non disponibile.";
    throw new Error(message);
  }

  return data;
};

const listAccounts = async (accessToken) => {
  const data = await googleFetch(`${ACCOUNT_MANAGEMENT_API}/accounts`, accessToken);
  return Array.isArray(data.accounts) ? data.accounts : [];
};

const listLocations = async (accessToken, accountName) => {
  const query = new URLSearchParams({
    readMask: "name,title,storeCode"
  });
  const locations = [];
  let pageToken = "";

  do {
    if (pageToken) {
      query.set("pageToken", pageToken);
    } else {
      query.delete("pageToken");
    }

    const data = await googleFetch(`${BUSINESS_INFO_API}/${accountName}/locations?${query.toString()}`, accessToken);
    locations.push(...(Array.isArray(data.locations) ? data.locations : []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return locations;
};

const resolveAccountName = async (accessToken) => {
  if (ACCOUNT_NAME) {
    return ACCOUNT_NAME;
  }

  const accounts = await listAccounts(accessToken);
  if (accounts.length === 1) {
    return accounts[0].name;
  }

  throw new Error("Imposta GOOGLE_GBP_ACCOUNT_NAME oppure GOOGLE_GBP_LOCATION_NAME per identificare il punto vendita.");
};

const resolveLocationName = async (accessToken) => {
  if (LOCATION_NAME) {
    return LOCATION_NAME;
  }

  const accountName = await resolveAccountName(accessToken);
  const locations = await listLocations(accessToken, accountName);

  if (!locations.length) {
    throw new Error("Non ho trovato location Google Business Profile su questo account.");
  }

  if (STORE_CODE) {
    const match = locations.find((location) => location.storeCode === STORE_CODE);
    if (match) {
      return match.name;
    }
  }

  if (LOCATION_TITLE) {
    const requestedTitle = toTitleCase(LOCATION_TITLE);
    const exact = locations.find((location) => toTitleCase(location.title) === requestedTitle);
    if (exact) {
      return exact.name;
    }
    const partial = locations.find((location) => toTitleCase(location.title).includes(requestedTitle));
    if (partial) {
      return partial.name;
    }
  }

  if (locations.length === 1) {
    return locations[0].name;
  }

  throw new Error("Imposta GOOGLE_GBP_LOCATION_NAME, GOOGLE_GBP_STORE_CODE o GOOGLE_GBP_LOCATION_TITLE per scegliere la location giusta.");
};

exports.handler = async () => {
  if (!isConfigured()) {
    return json(200, {
      configured: false,
      source: "fallback",
      message: "Google Business Profile non configurato."
    });
  }

  try {
    const accessToken = await getAccessToken();
    const locationName = await resolveLocationName(accessToken);
    const readMask = [
      "title",
      "storefrontAddress",
      "phoneNumbers",
      "websiteUri",
      "regularHours",
      "specialHours",
      "metadata"
    ].join(",");
    const location = await googleFetch(
      `${BUSINESS_INFO_API}/${locationName}?readMask=${encodeURIComponent(readMask)}`,
      accessToken
    );

    return json(200, {
      configured: true,
      source: "google-business-profile",
      syncedAt: new Date().toISOString(),
      locationName,
      title: location.title || "",
      address: formatAddress(location.storefrontAddress),
      phone: pickPrimaryPhone(location.phoneNumbers),
      website: location.websiteUri || "",
      mapsUrl: location.metadata && location.metadata.mapsUri ? location.metadata.mapsUri : "",
      schedule: normalizeHours(location.regularHours),
      hasSpecialHours: Boolean(location.specialHours && Array.isArray(location.specialHours.specialHourPeriods) && location.specialHours.specialHourPeriods.length)
    });
  } catch (error) {
    return json(500, {
      configured: true,
      source: "google-business-profile",
      error: error.message || "Non sono riuscito a leggere gli orari da Google Business Profile."
    });
  }
};
