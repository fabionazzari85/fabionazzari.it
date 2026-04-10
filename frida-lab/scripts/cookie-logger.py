"""
mitmproxy addon — Cookie & Token Logger
========================================

Cattura automaticamente cookie, token di autenticazione e header sensibili
dal traffico che passa attraverso mitmproxy. Salva tutto in un file JSON
organizzato per dominio e timestamp.

Utilizzo:
    mitmweb --mode transparent --showhost --web-host 0.0.0.0 \
        -s scripts/cookie-logger.py

I dati vengono salvati in: logs/captured-cookies.json

ATTENZIONE: Questo file conterra' dati sensibili (cookie di sessione, token).
Non condividerlo e cancellalo dopo l'analisi.
"""

import json
import os
from datetime import datetime
from mitmproxy import http

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
LOG_FILE = os.path.join(LOG_DIR, "captured-cookies.json")


def load_log():
    """Carica il file di log esistente o crea uno nuovo."""
    os.makedirs(LOG_DIR, exist_ok=True)
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {"captures": []}
    return {"captures": []}


def save_log(data):
    """Salva il log su disco."""
    with open(LOG_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def request(flow: http.HTTPFlow):
    """Intercetta le richieste e salva cookie/token."""
    headers = flow.request.headers
    capture = {}

    # Cookie dalla richiesta
    if "cookie" in headers:
        cookies_raw = headers["cookie"]
        cookies = {}
        for pair in cookies_raw.split(";"):
            pair = pair.strip()
            if "=" in pair:
                key, value = pair.split("=", 1)
                cookies[key.strip()] = value.strip()
        if cookies:
            capture["cookies"] = cookies

    # Authorization header
    if "authorization" in headers:
        capture["authorization"] = headers["authorization"]

    # X-CSRFToken e simili
    for header_name in ["x-csrftoken", "x-csrf-token", "x-auth-token",
                        "x-access-token", "x-api-key"]:
        if header_name in headers:
            capture[header_name] = headers[header_name]

    # Salva solo se c'e' qualcosa di interessante
    if capture:
        capture["timestamp"] = datetime.now().isoformat()
        capture["domain"] = flow.request.pretty_host
        capture["url"] = flow.request.pretty_url
        capture["method"] = flow.request.method

        data = load_log()
        data["captures"].append(capture)
        save_log(data)

        # Log in console
        cookie_count = len(capture.get("cookies", {}))
        has_auth = "authorization" in capture
        print(f"[cookie-logger] {capture['domain']} — "
              f"{cookie_count} cookie, auth={'si' if has_auth else 'no'}")


def response(flow: http.HTTPFlow):
    """Intercetta Set-Cookie dalle risposte."""
    set_cookies = flow.response.headers.get_all("set-cookie")
    if not set_cookies:
        return

    parsed = []
    for sc in set_cookies:
        parts = sc.split(";")
        if "=" in parts[0]:
            name, value = parts[0].split("=", 1)
            cookie_info = {
                "name": name.strip(),
                "value": value.strip(),
            }
            # Analizza i flag di sicurezza
            flags = [p.strip().lower() for p in parts[1:]]
            cookie_info["secure"] = any("secure" in f for f in flags)
            cookie_info["httponly"] = any("httponly" in f for f in flags)
            cookie_info["samesite"] = next(
                (f.split("=")[1] for f in flags if "samesite" in f), "non impostato"
            )
            parsed.append(cookie_info)

    if parsed:
        capture = {
            "timestamp": datetime.now().isoformat(),
            "domain": flow.request.pretty_host,
            "type": "set-cookie",
            "new_cookies": parsed,
        }

        data = load_log()
        data["captures"].append(capture)
        save_log(data)

        for c in parsed:
            secure = "Secure" if c["secure"] else "NO Secure"
            httponly = "HttpOnly" if c["httponly"] else "NO HttpOnly"
            print(f"[cookie-logger] SET {c['name']} @ {capture['domain']} "
                  f"— {secure}, {httponly}, SameSite={c['samesite']}")
