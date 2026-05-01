const adminConfig = window.BIO_ADMIN_CONFIG || {};
const TOKEN_STORAGE_KEY = adminConfig.tokenStorageKey || "fabio-bio-admin-token-v1";

const dom = {
  loginPanel: document.getElementById("login-panel"),
  editorPanel: document.getElementById("editor-panel"),
  loginForm: document.getElementById("login-form"),
  passwordInput: document.getElementById("password-input"),
  loginStatus: document.getElementById("login-status"),
  editorStatus: document.getElementById("editor-status"),
  localeTabs: document.getElementById("locale-tabs"),
  updatedLabel: document.getElementById("updated-at-label"),
  saveButton: document.getElementById("save-button"),
  logoutButton: document.getElementById("logout-button"),
  sections: document.getElementById("editor-sections")
};

let adminToken = "";
let bioData = null;
let activeLocale = "it";

const createId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

const blankSocial = () => ({
  id: createId("social"),
  label: "Nuovo social",
  href: "",
  icon: "instagram",
  enabled: true
});

const blankLink = () => ({
  id: createId("link"),
  label: "Nuovo link",
  description: "",
  href: "",
  tag: "",
  featured: false,
  enabled: true
});

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("it-IT", {
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

const setStatus = (target, message, type = "default") => {
  target.textContent = message || "";
  target.className = "admin-status";
  if (type === "error") {
    target.style.color = "#7a2721";
  } else if (type === "success") {
    target.style.color = "#1d6a5d";
  } else {
    target.style.color = "";
  }
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
  }

  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
};

const authHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  "Content-Type": "application/json"
});

const ensureLocaleState = () => {
  if (!bioData?.locales?.[activeLocale]) {
    return;
  }

  const currentLocale = bioData.locales[activeLocale];
  currentLocale.socials = Array.isArray(currentLocale.socials) ? currentLocale.socials : [];
  currentLocale.links = Array.isArray(currentLocale.links) ? currentLocale.links : [];
};

const inputField = (labelText, value, onInput, options = {}) => {
  const field = document.createElement("div");
  field.className = "admin-field";

  const label = document.createElement("label");
  label.textContent = labelText;

  const input = document.createElement(options.multiline ? "textarea" : "input");
  input.className = options.multiline ? "admin-textarea" : "admin-input";
  input.value = value || "";
  if (options.placeholder) {
    input.placeholder = options.placeholder;
  }
  input.addEventListener("input", (event) => onInput(event.target.value));

  field.append(label, input);
  return field;
};

const selectField = (labelText, value, choices, onInput) => {
  const field = document.createElement("div");
  field.className = "admin-field";

  const label = document.createElement("label");
  label.textContent = labelText;

  const select = document.createElement("select");
  select.className = "admin-select";

  choices.forEach((choice) => {
    const option = document.createElement("option");
    option.value = choice.value;
    option.textContent = choice.label;
    if (choice.value === value) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener("change", (event) => onInput(event.target.value));

  field.append(label, select);
  return field;
};

const checkboxField = (labelText, value, onInput) => {
  const wrapper = document.createElement("label");
  wrapper.className = "admin-checkbox";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(value);
  checkbox.addEventListener("change", (event) => onInput(event.target.checked));

  const text = document.createElement("span");
  text.textContent = labelText;

  wrapper.append(checkbox, text);
  return wrapper;
};

const moveItem = (list, fromIndex, direction) => {
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= list.length) {
    return;
  }
  [list[fromIndex], list[toIndex]] = [list[toIndex], list[fromIndex]];
  renderEditor();
};

const itemControls = (list, index, onRemove) => {
  const actions = document.createElement("div");
  actions.className = "admin-item-actions";

  const upButton = document.createElement("button");
  upButton.type = "button";
  upButton.className = "admin-button is-soft";
  upButton.textContent = "Su";
  upButton.addEventListener("click", () => moveItem(list, index, -1));

  const downButton = document.createElement("button");
  downButton.type = "button";
  downButton.className = "admin-button is-soft";
  downButton.textContent = "Giu";
  downButton.addEventListener("click", () => moveItem(list, index, 1));

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "admin-button is-danger";
  removeButton.textContent = "Rimuovi";
  removeButton.addEventListener("click", onRemove);

  actions.append(upButton, downButton, removeButton);
  return actions;
};

const renderProfileSection = (localeData) => {
  const section = document.createElement("section");
  section.className = "admin-section";

  const title = document.createElement("h2");
  title.textContent = "Testi principali";

  const copy = document.createElement("p");
  copy.className = "admin-section-copy";
  copy.textContent =
    "Qui cambi il blocco in alto: nome, titolo, sottotitolo e immagine della pagina pubblica.";

  const grid = document.createElement("div");
  grid.className = "admin-grid";

  grid.append(
    inputField("Eyebrow", localeData.profile.eyebrow, (value) => {
      localeData.profile.eyebrow = value;
    }),
    inputField("Titolo", localeData.profile.title, (value) => {
      localeData.profile.title = value;
    }),
    inputField("Immagine", localeData.profile.image, (value) => {
      localeData.profile.image = value;
    }, {placeholder: "/assets/... oppure https://..."}),
    inputField("Alt immagine", localeData.profile.alt, (value) => {
      localeData.profile.alt = value;
    })
  );

  section.append(title, copy, grid);
  section.appendChild(
    inputField("Sottotitolo", localeData.profile.subtitle, (value) => {
      localeData.profile.subtitle = value;
    }, {multiline: true})
  );

  return section;
};

const renderSocialSection = (localeData) => {
  const section = document.createElement("section");
  section.className = "admin-section";

  const title = document.createElement("h2");
  title.textContent = "Social";

  const copy = document.createElement("p");
  copy.className = "admin-section-copy";
  copy.textContent =
    "Questi pulsanti tondi compaiono sopra ai link principali.";

  const list = document.createElement("div");
  list.className = "admin-item-list";

  if (!localeData.socials.length) {
    const empty = document.createElement("div");
    empty.className = "admin-empty";
    empty.textContent = "Nessun social presente.";
    list.appendChild(empty);
  }

  localeData.socials.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "admin-item-card";

    const head = document.createElement("div");
    head.className = "admin-item-head";

    const itemTitle = document.createElement("p");
    itemTitle.className = "admin-item-title";
    itemTitle.textContent = `Social ${index + 1}`;

    head.append(
      itemTitle,
      itemControls(localeData.socials, index, () => {
        localeData.socials.splice(index, 1);
        renderEditor();
      })
    );

    const grid = document.createElement("div");
    grid.className = "admin-grid";
    grid.append(
      inputField("Label", item.label, (value) => {
        item.label = value;
      }),
      selectField(
        "Icona",
        item.icon,
        [
          {label: "Instagram", value: "instagram"},
          {label: "Facebook", value: "facebook"},
          {label: "YouTube", value: "youtube"},
          {label: "LinkedIn", value: "linkedin"},
          {label: "TikTok", value: "tiktok"},
          {label: "WhatsApp", value: "whatsapp"},
          {label: "Mail", value: "mail"},
          {label: "Mappa", value: "map"},
          {label: "Shop", value: "shop"},
          {label: "Globo", value: "globe"}
        ],
        (value) => {
          item.icon = value;
        }
      ),
      inputField("URL", item.href, (value) => {
        item.href = value;
      }, {placeholder: "https://..."}),
      (() => {
        const box = document.createElement("div");
        box.className = "admin-field";
        const label = document.createElement("label");
        label.textContent = "Stato";
        const row = document.createElement("div");
        row.className = "admin-checkbox-row";
        row.appendChild(
          checkboxField("Attivo", item.enabled, (checked) => {
            item.enabled = checked;
          })
        );
        box.append(label, row);
        return box;
      })()
    );

    card.append(head, grid);
    list.appendChild(card);
  });

  const actions = document.createElement("div");
  actions.className = "admin-button-row";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "admin-button";
  addButton.textContent = "Aggiungi social";
  addButton.addEventListener("click", () => {
    localeData.socials.push(blankSocial());
    renderEditor();
  });

  actions.appendChild(addButton);
  section.append(title, copy, list, actions);
  return section;
};

const renderLinksSection = (localeData) => {
  const section = document.createElement("section");
  section.className = "admin-section";

  const title = document.createElement("h2");
  title.textContent = "Link principali";

  const copy = document.createElement("p");
  copy.className = "admin-section-copy";
  copy.textContent =
    "Questi sono i pulsanti principali della pagina pubblica. Puoi aggiungerli, riordinarli, disattivarli o cambiarne i testi.";

  const list = document.createElement("div");
  list.className = "admin-item-list";

  if (!localeData.links.length) {
    const empty = document.createElement("div");
    empty.className = "admin-empty";
    empty.textContent = "Nessun link presente.";
    list.appendChild(empty);
  }

  localeData.links.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "admin-item-card";

    const head = document.createElement("div");
    head.className = "admin-item-head";

    const itemTitle = document.createElement("p");
    itemTitle.className = "admin-item-title";
    itemTitle.textContent = `Link ${index + 1}`;

    head.append(
      itemTitle,
      itemControls(localeData.links, index, () => {
        localeData.links.splice(index, 1);
        renderEditor();
      })
    );

    const grid = document.createElement("div");
    grid.className = "admin-grid";
    grid.append(
      inputField("Titolo", item.label, (value) => {
        item.label = value;
      }),
      inputField("Tag", item.tag, (value) => {
        item.tag = value;
      }),
      inputField("URL", item.href, (value) => {
        item.href = value;
      }, {placeholder: "https://... oppure /contatti"}),
      (() => {
        const box = document.createElement("div");
        box.className = "admin-field";
        const label = document.createElement("label");
        label.textContent = "Opzioni";
        const row = document.createElement("div");
        row.className = "admin-checkbox-row";
        row.append(
          checkboxField("In evidenza", item.featured, (checked) => {
            item.featured = checked;
          }),
          checkboxField("Attivo", item.enabled, (checked) => {
            item.enabled = checked;
          })
        );
        box.append(label, row);
        return box;
      })()
    );

    const descriptionField = inputField("Descrizione", item.description, (value) => {
      item.description = value;
    }, {multiline: true});

    card.append(head, grid, descriptionField);
    list.appendChild(card);
  });

  const actions = document.createElement("div");
  actions.className = "admin-button-row";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "admin-button";
  addButton.textContent = "Aggiungi link";
  addButton.addEventListener("click", () => {
    localeData.links.push(blankLink());
    renderEditor();
  });

  actions.appendChild(addButton);
  section.append(title, copy, list, actions);
  return section;
};

const renderLocaleTabs = () => {
  dom.localeTabs.innerHTML = "";

  [
    {id: "it", label: "Italiano"},
    {id: "en", label: "English"}
  ].forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `admin-tab${activeLocale === item.id ? " is-active" : ""}`;
    button.textContent = item.label;
    button.addEventListener("click", () => {
      activeLocale = item.id;
      renderEditor();
    });
    dom.localeTabs.appendChild(button);
  });
};

const renderEditor = () => {
  ensureLocaleState();
  renderLocaleTabs();

  const localeData = bioData.locales[activeLocale];
  dom.updatedLabel.textContent = bioData.updatedAt
    ? `Ultimo salvataggio: ${formatDate(bioData.updatedAt)}`
    : "";

  dom.sections.innerHTML = "";
  dom.sections.append(
    renderProfileSection(localeData),
    renderSocialSection(localeData),
    renderLinksSection(localeData)
  );
};

const showLogin = () => {
  dom.loginPanel.classList.remove("hidden");
  dom.editorPanel.classList.add("hidden");
};

const showEditor = () => {
  dom.loginPanel.classList.add("hidden");
  dom.editorPanel.classList.remove("hidden");
};

const loadEditorData = async () => {
  const payload = await requestJson(adminConfig.apiEndpoint, {
    headers: authHeaders()
  });

  bioData = payload.data;
  showEditor();
  renderEditor();
  setStatus(dom.editorStatus, "Pannello caricato correttamente.", "success");
};

const login = async (password) => {
  const payload = await requestJson(adminConfig.authEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({password})
  });

  adminToken = payload.token;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, adminToken);
  await loadEditorData();
};

const saveData = async () => {
  dom.saveButton.disabled = true;
  setStatus(dom.editorStatus, "Salvataggio in corso...", "default");

  try {
    const payload = await requestJson(adminConfig.apiEndpoint, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({data: bioData})
    });

    bioData = payload.data;
    renderEditor();
    setStatus(dom.editorStatus, "Link aggiornati correttamente.", "success");
  } catch (error) {
    if (error.status === 401) {
      adminToken = "";
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      showLogin();
      setStatus(
        dom.loginStatus,
        "Sessione scaduta. Reinserisci la password.",
        "error"
      );
    } else {
      setStatus(
        dom.editorStatus,
        error.message ||
          "Non sono riuscito a salvare i dati. Verifica la configurazione Netlify.",
        "error"
      );
    }
  } finally {
    dom.saveButton.disabled = false;
  }
};

dom.loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(dom.loginStatus, "Accesso in corso...", "default");

  try {
    await login(dom.passwordInput.value);
    dom.passwordInput.value = "";
  } catch (error) {
    setStatus(
      dom.loginStatus,
      error.message ||
        "Accesso non riuscito. Se sei in anteprima file locale, il login funziona solo su Netlify o con netlify dev.",
      "error"
    );
  }
});

dom.logoutButton?.addEventListener("click", () => {
  adminToken = "";
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  showLogin();
  setStatus(dom.loginStatus, "Sessione chiusa.", "default");
});

dom.saveButton?.addEventListener("click", saveData);

window.addEventListener("DOMContentLoaded", async () => {
  adminToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";

  if (!adminToken) {
    showLogin();
    return;
  }

  try {
    await loadEditorData();
  } catch (error) {
    adminToken = "";
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    showLogin();
    setStatus(
      dom.loginStatus,
      "Il token salvato non e piu valido. Inserisci di nuovo la password.",
      "error"
    );
  }
});
