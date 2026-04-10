# Guida Installazione Completa — Frida Lab

## Raspberry Pi 5 + Mac — Setup da zero

---

# PARTE 1: PREPARAZIONE (prima che arrivi il Pi)

## 1.1 — Installa il software sul Mac

Apri il Terminale sul Mac ed esegui questi comandi uno alla volta.

### Homebrew (gestore pacchetti per Mac)

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Python 3

```
brew install python3
```

### ADB (Android Debug Bridge) — per comunicare col telefono

```
brew install android-platform-tools
```

### Frida (il tool principale)

```
pip3 install frida-tools
```

### Objection (helper per Frida, opzionale ma consigliato)

```
pip3 install objection
```

### Raspberry Pi Imager (per flashare la SD)

```
brew install --cask raspberry-pi-imager
```

### Verifica che tutto sia installato

```
python3 --version
adb --version
frida --version
```

Tutti e tre devono restituire un numero di versione senza errori.

---

## 1.2 — Prepara il telefono Android

1. Vai in **Impostazioni > Info telefono**
2. Tocca **"Numero build"** 7 volte di fila — comparira' "Sei uno sviluppatore"
3. Torna in **Impostazioni > Sistema > Opzioni sviluppatore**
4. Attiva **Debug USB**

---

# PARTE 2: QUANDO ARRIVA IL RASPBERRY PI

## 2.1 — Flash del sistema operativo sulla MicroSD

1. Inserisci la **MicroSD da 64GB** nel Mac (usa l'adattatore se serve)
2. Apri **Raspberry Pi Imager**
3. Configura:

```
Dispositivo:  Raspberry Pi 5
Sistema:      Raspberry Pi OS (64-bit) — Debian Bookworm
Storage:      la tua MicroSD da 64GB
```

4. Clicca l'icona **ingranaggio** (impostazioni avanzate) e imposta:

```
Hostname:     fridalab
Nome utente:  pi
Password:     [scegli una password sicura e annotala]
Wi-Fi:        [il nome e password del tuo Wi-Fi di casa]
SSH:          Abilita autenticazione con password
Fuso orario:  Europe/Rome
Layout tastiera: it
```

5. Clicca **Scrivi** e attendi (circa 5-10 minuti)

---

## 2.2 — Assembla il Raspberry Pi

1. Inserisci la MicroSD nel Pi (slot sotto la scheda)
2. Monta i dissipatori adesivi sul processore (inclusi nel kit)
3. Chiudi il case
4. Collega il cavo **Ethernet dal Pi al tuo router**
5. Collega l'**alimentatore 27W** — il Pi si accende automaticamente
6. Attendi 2 minuti per il primo avvio

---

## 2.3 — Primo collegamento via SSH

Dal Terminale del Mac:

```
ssh pi@fridalab.local
```

Se chiede "Are you sure you want to continue connecting?" scrivi **yes**.
Inserisci la password che hai scelto al punto 2.1.

Dovresti vedere il prompt:

```
pi@fridalab:~ $
```

**Sei dentro il Pi.**

---

## 2.4 — Aggiorna il sistema

Sul Pi (dentro la sessione SSH), esegui:

```
sudo apt update && sudo apt upgrade -y
```

Attendi il completamento (puo' richiedere 5-15 minuti).

---

## 2.5 — Copia i file del lab sul Pi

Apri un **nuovo tab** del Terminale sul Mac (il primo tab resta connesso via SSH).

```
cd ~/frida-lab
scp -r setup/ scripts/ start-lab.sh stop-lab.sh pi@fridalab.local:~/frida-lab/
```

Inserisci la password del Pi quando richiesta.

---

## 2.6 — Esegui lo script di setup automatico

Torna nel tab SSH (quello connesso al Pi):

```
cd ~/frida-lab/setup
chmod +x setup-pi.sh
sudo ./setup-pi.sh
```

Lo script fara' tutto automaticamente:
- Installa hostapd (hotspot Wi-Fi)
- Installa dnsmasq (server DHCP)
- Configura iptables (proxy trasparente)
- Installa mitmproxy
- Abilita IP forwarding

Al termine vedrai:

```
[+] ==========================================
[+]   Setup completato!
[+] ==========================================
[+] Hotspot Wi-Fi:
[+]   SSID:     FridaLab
[+]   Password: fridalab2024
```

---

## 2.7 — Riavvia il Pi

```
sudo reboot
```

Attendi 1 minuto, poi riconnettiti:

```
ssh pi@fridalab.local
```

---

## 2.8 — Cambia la password dell'hotspot (IMPORTANTE)

```
sudo nano /etc/hostapd/hostapd.conf
```

Trova la riga:

```
wpa_passphrase=fridalab2024
```

Cambiala con una password a tua scelta. Salva con **Ctrl+O, Invio, Ctrl+X**.

```
sudo systemctl restart hostapd
```

---

# PARTE 3: INSTALLAZIONE FRIDA SUL TELEFONO

## 3.1 — Collega il telefono al Mac via USB

1. Collega il cavo USB dal telefono al Mac
2. Sul telefono comparira' "Consenti debug USB?" — tocca **Consenti**
3. Sul Mac verifica:

```
adb devices
```

Deve mostrare qualcosa come:

```
List of devices attached
ABC12345    device
```

Se dice "unauthorized", sblocca il telefono e accetta il prompt.

---

## 3.2 — Installa frida-server sul telefono

### Se il telefono ha il ROOT:

```
cd ~/frida-lab/setup
chmod +x deploy-frida-server.sh
./deploy-frida-server.sh
```

Lo script scarica e installa automaticamente la versione corretta.

### Se il telefono NON ha il ROOT:

Usa objection per patchare le singole app:

```
# Scarica l'APK dell'app da analizzare (es. da APKMirror)
objection patchapk --source app-scaricata.apk

# Disinstalla la versione originale dal telefono
adb uninstall com.esempio.app

# Installa la versione patchata
adb install app-scaricata.objection.apk
```

---

# PARTE 4: AVVIO DEL LAB

Ogni volta che vuoi usare il lab, segui questi passi.

## Passo 1 — Avvia il lab sul Pi

```
ssh pi@fridalab.local "cd ~/frida-lab && ./start-lab.sh"
```

## Passo 2 — Connetti il telefono all'hotspot

Sul telefono:
- Vai in **Impostazioni > Wi-Fi**
- Connettiti a **FridaLab**
- Inserisci la password che hai impostato

## Passo 3 — Installa il certificato CA (solo la prima volta)

Sul telefono:
1. Apri il **browser** (Chrome)
2. Vai su **http://mitm.it**
3. Tocca **Android**
4. Scarica il certificato
5. Vai in **Impostazioni > Sicurezza > Credenziali attendibili > Installa**
6. Seleziona il file scaricato e conferma

## Passo 4 — Collega il telefono via USB al Mac

Il telefono deve essere:
- Connesso via **Wi-Fi** all'hotspot FridaLab (per il traffico)
- Connesso via **USB** al Mac (per Frida)

## Passo 5 — Verifica che tutto funzioni

```
frida-ps -U
```

Deve mostrare la lista dei processi sul telefono.

## Passo 6 — Avvia il bypass su un'app

```
# App normali:
frida -U -f com.esempio.app -l scripts/bypass-android-pinning.js --no-pause

# App protette (Instagram, WhatsApp, bancarie):
frida -U -f com.esempio.app -l scripts/frida-antidetect.js --no-pause

# App Flutter:
frida -U -f com.esempio.app -l scripts/bypass-flutter-pinning.js --no-pause
```

## Passo 7 — Apri la web UI di mitmproxy

Sul Mac, apri il browser e vai su:

```
http://fridalab.local:8081
```

Qui vedi tutto il traffico in tempo reale.

## Quando hai finito

```
ssh pi@fridalab.local "cd ~/frida-lab && ./stop-lab.sh"
```

---

# PARTE 5: ESEMPIO PRATICO — ANALISI DI UN'APP METEO

Simulazione completa di una sessione di analisi su un'app meteo installata
sul tuo telefono. Le app meteo sono un ottimo punto di partenza perche' hanno
protezioni semplici e inviano dati interessanti.

## Scenario

Vuoi verificare:
- Quali dati personali l'app meteo invia ai suoi server
- Se usa tracker o analytics di terze parti
- Se i cookie sono protetti correttamente
- Se la tua posizione GPS viene condivisa con terzi

## Passo 1 — Identifica il package dell'app

```
frida-ps -Ua | grep -i meteo
```

Output esempio:

```
 4521  Il Meteo       it.ilmeteo.ilmeteo
```

Il package e': **it.ilmeteo.ilmeteo**

## Passo 2 — Avvia il bypass e l'app

```
frida -U -f it.ilmeteo.ilmeteo -l scripts/bypass-android-pinning.js --no-pause
```

Output nel terminale:

```
[*] === Frida Lab — Bypass Certificate Pinning Android ===
[*] Attivazione bypass...

[+] TrustManagerFactory — bypass attivo
[+] SSLContext.init — bypass attivo
[+] OkHttp3 CertificatePinner — bypass attivo
[+] HttpsURLConnection — bypass attivo
[+] WebView SSL — bypass attivo

[*] Tutti i bypass attivati.
```

L'app si apre sul telefono. Usala normalmente: guarda il meteo, cambia citta',
apri le previsioni orarie.

## Passo 3 — Analizza il traffico nella web UI

Apri **http://fridalab.local:8081** sul Mac. Vedrai una lista di richieste.

### Esempio di quello che potresti vedere:

```
GET  https://api.ilmeteo.it/v2/forecast?lat=45.46&lon=9.19&city=Milano
     Cookie: session=abc123; user_pref=metric
     User-Agent: IlMeteo/5.2.1 Android/14

POST https://api.ilmeteo.it/v2/user/location
     Body: {"latitude": 45.4642, "longitude": 9.1900, "accuracy": 12.5}

GET  https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js
     Cookie: IDE=xyz789; DSID=aaa111

POST https://firebaselogging-pa.googleapis.com/v1/firelog/legacy/batchlog
     Body: {"log_event": [{"event_code": "APP_OPEN", "timestamp": ...}]}

GET  https://graph.facebook.com/v18.0/...
     Cookie: fbp=fb.1.1234567890
```

## Passo 4 — Cosa hai scoperto

### Richiesta 1: API meteo
```
GET https://api.ilmeteo.it/v2/forecast?lat=45.46&lon=9.19&city=Milano
```
**Analisi**: L'app invia la tua posizione GPS esatta al server.
E' normale per un'app meteo, ma nota che la latitudine e longitudine
hanno molti decimali — identificano la tua posizione con precisione di
pochi metri.

### Richiesta 2: Google Ads
```
GET https://pagead2.googlesyndication.com/...
```
**Analisi**: L'app carica pubblicita' da Google. Il cookie "IDE" e' un
identificatore di tracking che Google usa per profilarti su tutti i siti
e app che usi. Questo cookie ti segue ovunque.

### Richiesta 3: Firebase Analytics
```
POST https://firebaselogging-pa.googleapis.com/...
```
**Analisi**: L'app invia eventi analytics a Firebase (Google). Registra
quando apri l'app, quali schermate visiti, quanto tempo ci stai.
Queste informazioni vengono usate per analytics e profilazione.

### Richiesta 4: Facebook SDK
```
GET https://graph.facebook.com/...
```
**Analisi**: L'app contiene il Facebook SDK anche se non ha funzionalita'
social. Questo tracker invia dati a Meta per la profilazione pubblicitaria.

## Passo 5 — Controlla i cookie salvati

```
cat ~/frida-lab/logs/captured-cookies.json | python3 -m json.tool
```

Output esempio:

```json
{
  "captures": [
    {
      "timestamp": "2026-04-10T15:30:01",
      "domain": "api.ilmeteo.it",
      "cookies": {
        "session": "abc123def456",
        "user_pref": "metric"
      }
    },
    {
      "timestamp": "2026-04-10T15:30:02",
      "domain": "api.ilmeteo.it",
      "type": "set-cookie",
      "new_cookies": [
        {
          "name": "session",
          "value": "abc123def456",
          "secure": true,
          "httponly": false,
          "samesite": "non impostato"
        }
      ]
    },
    {
      "timestamp": "2026-04-10T15:30:03",
      "domain": "pagead2.googlesyndication.com",
      "cookies": {
        "IDE": "xyz789",
        "DSID": "aaa111"
      },
      "authorization": "Bearer eyJhbGciOiJS..."
    }
  ]
}
```

## Passo 6 — Valutazione sicurezza

Basandoti sui dati raccolti, compila la checklist:

| Controllo | Risultato | Note |
|-----------|-----------|------|
| Traffico solo HTTPS? | Si | Bene, nessuna richiesta HTTP in chiaro |
| Cookie con flag Secure? | Si | Il cookie di sessione ha Secure |
| Cookie con flag HttpOnly? | NO | Il cookie puo' essere letto da JavaScript — rischio XSS |
| SameSite impostato? | NO | Manca protezione CSRF |
| Tracker di terze parti? | Si | Google Ads, Firebase, Facebook SDK |
| Dati GPS condivisi? | Si | Posizione esatta inviata al server e a terzi |
| Dati in eccesso? | Si | Precisione GPS troppo alta per un'app meteo |

## Conclusione dell'analisi

Dall'analisi hai scoperto che:

1. L'app protegge la connessione (HTTPS) ma i cookie non sono configurati
   al meglio (manca HttpOnly e SameSite)
2. La tua posizione GPS viene inviata con precisione eccessiva
3. Tre tracker di terze parti raccolgono dati su di te
4. Un attaccante sulla stessa rete (Wi-Fi pubblico) che riuscisse a fare
   MITM potrebbe rubare il cookie di sessione (manca HttpOnly)

Questa e' esattamente l'analisi che puoi fare su qualsiasi app installata
sul tuo telefono.

---

# RIEPILOGO COMANDI RAPIDI

## Avvio lab
```
ssh pi@fridalab.local "cd ~/frida-lab && ./start-lab.sh"
```

## Lista app sul telefono
```
frida-ps -Ua
```

## Bypass pinning (app standard)
```
frida -U -f <package> -l scripts/bypass-android-pinning.js --no-pause
```

## Bypass pinning (app protette)
```
frida -U -f <package> -l scripts/frida-antidetect.js --no-pause
```

## Bypass pinning (app Flutter)
```
frida -U -f <package> -l scripts/bypass-flutter-pinning.js --no-pause
```

## Web UI mitmproxy
```
http://fridalab.local:8081
```

## Leggi cookie salvati
```
cat ~/frida-lab/logs/captured-cookies.json | python3 -m json.tool
```

## Stop lab
```
ssh pi@fridalab.local "cd ~/frida-lab && ./stop-lab.sh"
```

---

*Guida creata per uso personale — test di sicurezza solo sui propri dispositivi.*
