# Frida Lab — Raspberry Pi 5 Certificate Pinning Bypass

Lab personale per security research su rete locale.
Setup a due macchine: **Mac** (postazione di lavoro + Frida) e **Raspberry Pi 5**
(proxy trasparente + hotspot Wi-Fi) per analizzare il traffico HTTPS delle
proprie app native Android.

> **Disclaimer**: Questo progetto e' pensato esclusivamente per test di sicurezza
> sui propri dispositivi e sulla propria rete. Non utilizzare questi strumenti
> su dispositivi o reti altrui senza esplicita autorizzazione.

---

## Indice

1. [Panoramica architettura](#panoramica-architettura)
2. [Prerequisiti](#prerequisiti)
3. [Setup Raspberry Pi](#setup-raspberry-pi)
4. [Setup Mac](#setup-mac)
5. [Configurazione rete](#configurazione-rete)
6. [Installazione Frida](#installazione-frida)
7. [Configurazione mitmproxy](#configurazione-mitmproxy)
8. [Bypass Certificate Pinning](#bypass-certificate-pinning)
9. [Utilizzo](#utilizzo)
10. [Cosa puoi analizzare](#cosa-puoi-analizzare)
11. [Troubleshooting](#troubleshooting)

---

## Panoramica architettura

```
                          Rete locale
                              |
+----------+   USB    +------+------+          +---------------------+          +----------+
|  Mac     |--------->|  Telefono   |  Wi-Fi   |   Raspberry Pi 5    | Ethernet | Internet |
|  - Frida |          |  Android    |--------->|   - mitmproxy       |--------->|          |
|  - adb   |          |  (target)   |          |   - hotspot Wi-Fi   |          |          |
+----------+          +-------------+          +---------------------+          +----------+
      |                                               |
      |         SSH (per gestione)                     |
      +------------------------------------------------+
      |
      v
 Web UI mitmproxy
 http://fridalab.local:8081
```

**Come funziona:**

1. Il **Raspberry Pi** crea un hotspot Wi-Fi e fa da proxy trasparente (mitmproxy)
2. Il **telefono Android** si connette all'hotspot — tutto il suo traffico passa dal Pi
3. Dal **Mac** lanci Frida via USB verso il telefono per disabilitare il certificate pinning
4. mitmproxy sul Pi intercetta e decrittografa il traffico HTTPS
5. Vedi tutto in chiaro nella **web UI** di mitmproxy dal Mac

**Perche' due macchine?**
- Il Mac e' piu' comodo per lavorare con Frida, scrivere script, analizzare i risultati
- Il Pi fa il lavoro "sporco" di rete: hotspot, proxy, routing — sempre acceso, basso consumo
- Il telefono e' connesso via Wi-Fi al Pi (traffico) e via USB al Mac (Frida)

---

## Prerequisiti

### Hardware
- **Raspberry Pi 5 4GB** (kit db-tronic con case, alimentatore 27W, SD 64GB)
- **Cavo Ethernet** per connettere il Pi al router
- **Mac** (laptop) — la tua postazione di lavoro
- **Telefono Android** (con USB debugging attivo)
- **Cavo USB** per collegare il telefono al Mac

### Software — Mac
- [Raspberry Pi Imager](https://www.raspberrypi.com/software/) per flashare la SD
- Python 3 + pip (`brew install python3`)
- Frida (`pip3 install frida-tools`)
- ADB (`brew install android-platform-tools`)
- Objection opzionale (`pip3 install objection`)

### Sul telefono Android
- **USB Debugging** abilitato (Impostazioni > Opzioni sviluppatore)
- **Root** consigliato ma non obbligatorio (Frida puo' funzionare anche senza)

---

## Setup Raspberry Pi

Il Pi fa solo da proxy/hotspot — non serve installare Frida sopra.

### 1. Flash del sistema operativo

1. Scarica e installa **Raspberry Pi Imager** sul Mac
2. Inserisci la microSD nel PC
3. In Raspberry Pi Imager:
   - Dispositivo: **Raspberry Pi 5**
   - OS: **Raspberry Pi OS (64-bit)** — Debian Bookworm
   - Storage: la tua microSD da 64GB
4. Clicca la rotella delle impostazioni e configura:
   - Hostname: `fridalab`
   - Utente: `pi` / password a tua scelta
   - Wi-Fi: la tua rete (per il setup iniziale)
   - SSH: **Abilita**
   - Locale: `Europe/Rome`, tastiera `it`
5. Scrivi e attendi il completamento

### 2. Primo avvio

```bash
# Inserisci la SD nel Pi, collega Ethernet al router, accendi
# Dal tuo PC, connettiti via SSH:
ssh pi@fridalab.local

# Aggiorna il sistema
sudo apt update && sudo apt upgrade -y
```

### 3. Setup automatico

Copia lo script di setup sul Pi e eseguilo:

```bash
# Dal Mac, copia i file sul Pi:
scp -r frida-lab/ pi@fridalab.local:~/

# Sul Pi:
cd ~/frida-lab/setup
chmod +x setup-pi.sh
sudo ./setup-pi.sh
```

Lo script installa tutto il necessario automaticamente.
Vedi [setup/setup-pi.sh](setup/setup-pi.sh) per i dettagli.

---

## Setup Mac

Sul Mac installi Frida e gli strumenti di analisi.

```bash
# 1. Installa Homebrew (se non l'hai gia')
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Installa ADB (Android Debug Bridge)
brew install android-platform-tools

# 3. Installa Python e Frida
brew install python3
pip3 install frida-tools
pip3 install objection   # opzionale ma consigliato

# 4. Verifica
frida --version
adb --version

# 5. Clona questo repo
git clone <repo-url> ~/frida-lab
```

### Collegamento telefono via USB

1. Collega il telefono Android al Mac via cavo USB
2. Sul telefono, accetta l'autorizzazione USB debugging
3. Verifica: `adb devices` (deve mostrare il dispositivo)

---

## Configurazione rete

Il Pi funziona come **access point Wi-Fi + proxy trasparente**.

### Schema di rete

```
Internet <--[Ethernet]--> Pi (192.168.4.1) <--[Wi-Fi AP]--> Telefono
                           |
                      mitmproxy :8080
                      web UI    :8081
```

### Connessione del telefono

1. Il setup crea un hotspot Wi-Fi:
   - **SSID**: `FridaLab`
   - **Password**: `fridalab2024` (cambiala in `setup/hostapd.conf`)
2. Connetti il telefono Android a questa rete
3. Il traffico verra' automaticamente reindirizzato attraverso mitmproxy

---

## Installazione Frida

Frida gira sul **Mac** (client) e comunica col **telefono** (server) via USB.

### Sul Mac (gia' fatto nel Setup Mac)

```bash
pip3 install frida-tools
frida --version
```

### Sul telefono Android

Frida ha bisogno di un componente server che gira sul telefono.

#### Opzione A: Telefono con root

```bash
# Dal Mac, esegui lo script di deploy:
cd ~/frida-lab/setup
chmod +x deploy-frida-server.sh
./deploy-frida-server.sh
```

Lo script scarica automaticamente la versione corretta di frida-server
per l'architettura del tuo telefono e la installa via ADB.

#### Opzione B: Telefono senza root

Senza root puoi usare Frida in modalita' "gadget" iniettandolo nell'APK:

```bash
# Dal Mac:
pip3 install objection

# Patcha l'APK dell'app che vuoi analizzare
objection patchapk --source app-originale.apk

# Installa l'APK patchato sul telefono
adb install app-patchata.apk
```

---

## Configurazione mitmproxy

### Avvio

```bash
# Avvia mitmproxy in modalita' trasparente
mitmproxy --mode transparent --showhost

# Oppure con la web interface (consigliato):
mitmweb --mode transparent --showhost --web-host 0.0.0.0
```

### Accedi alla Web UI

Dal tuo PC (connesso alla stessa rete del Pi):
```
http://fridalab.local:8081
```

### Installazione certificato CA sul telefono

1. Col telefono connesso all'hotspot FridaLab, apri il browser
2. Vai su `http://mitm.it`
3. Scarica il certificato per Android
4. Installalo (Impostazioni > Sicurezza > Installa certificato)

> **Nota**: Questo certificato permette a mitmproxy di decrittare il traffico
> HTTPS. Le app con certificate pinning lo rifiuteranno comunque —
> per quello serve Frida.

---

## Bypass Certificate Pinning

### Come funziona il certificate pinning

Le app "pinnano" (fissano) il certificato del proprio server nel codice.
Anche se installi il certificato CA di mitmproxy sul telefono, l'app
verifica che il certificato sia esattamente quello atteso e rifiuta
la connessione se non corrisponde.

Frida inietta codice JavaScript nel processo dell'app a runtime,
sovrascrivendo le funzioni di verifica del certificato.

### Script disponibili

| Script | Descrizione |
|--------|-------------|
| `scripts/bypass-android-pinning.js` | Bypass universale per Android (TrustManager, OkHttp, ecc.) |
| `scripts/bypass-flutter-pinning.js` | Bypass specifico per app Flutter |

### Utilizzo rapido

```bash
# Lista app sul telefono
frida-ps -U

# Bypass pinning su un'app specifica
frida -U -f com.esempio.app -l scripts/bypass-android-pinning.js --no-pause

# Con objection (piu' semplice)
objection -g com.esempio.app explore
# Poi dentro objection:
# android sslpinning disable
```

---

## Utilizzo

### Workflow completo passo-passo

```bash
# === SUL PI (via SSH dal Mac) ===

# 1. Accendi il Pi e connettiti via SSH dal Mac
ssh pi@fridalab.local

# 2. Avvia il lab (mitmproxy + verifica servizi rete)
cd ~/frida-lab
./start-lab.sh

# === SUL MAC ===

# 3. Connetti il telefono all'hotspot Wi-Fi "FridaLab"

# 4. Collega il telefono al Mac via USB

# 5. Verifica che Frida veda il telefono
frida-ps -U

# 6. Identifica il package dell'app da analizzare
frida-ps -Ua  # mostra solo le app installate

# 7. Lancia l'app con bypass del pinning
frida -U -f com.esempio.app -l scripts/bypass-android-pinning.js --no-pause

# 8. Usa l'app normalmente sul telefono

# 9. Osserva il traffico nella web UI di mitmproxy (dal browser del Mac)
#    http://fridalab.local:8081
```

### Script helper (sul Pi)

```bash
# Avvia tutto con un comando
ssh pi@fridalab.local "cd ~/frida-lab && ./start-lab.sh"

# Ferma tutto
ssh pi@fridalab.local "cd ~/frida-lab && ./stop-lab.sh"
```

---

## Troubleshooting

### Frida non si connette al telefono
```bash
# Verifica che USB debugging sia attivo
adb devices
# Deve mostrare il tuo dispositivo

# Verifica che frida-server sia in esecuzione
adb shell "ps | grep frida"

# Riavvia frida-server
adb shell "su -c 'killall frida-server; /data/local/tmp/frida-server &'"
```

### L'app crasha quando lancio Frida
- Prova a usare `frida -U --no-pause -f` (spawn) invece di `-n` (attach)
- Alcune app hanno detection anti-Frida: prova lo script con anti-detection

### mitmproxy non vede traffico
```bash
# Verifica che il forwarding IP sia attivo
cat /proc/sys/net/ipv4/ip_forward
# Deve essere 1

# Verifica le regole iptables
sudo iptables -t nat -L -n

# Verifica che il telefono usi il Pi come gateway
# Sul telefono: Impostazioni > Wi-Fi > FridaLab > dettagli
```

### Il telefono non si connette all'hotspot
```bash
# Verifica lo stato dell'access point
sudo systemctl status hostapd
sudo systemctl status dnsmasq

# Riavvia i servizi
sudo systemctl restart hostapd
sudo systemctl restart dnsmasq
```

### L'app rileva il proxy/Frida
Alcune app hanno protezioni anti-tampering. Soluzioni:
- Usa lo script con **anti-detection** (nasconde la presenza di Frida)
- Prova **objection** che ha bypass piu' avanzati
- Per app Flutter, usa lo script specifico `bypass-flutter-pinning.js`

---

## Cosa puoi analizzare

Con questo lab puoi fare molte cose sui tuoi dispositivi. Leggi la guida
completa: **[docs/cosa-puoi-fare.md](docs/cosa-puoi-fare.md)**

In breve:
- **Intercettare traffico HTTPS** — vedere cosa inviano le tue app
- **Analizzare cookie e token** — verificare la sicurezza dell'autenticazione
- **Testare le API** — controllare la robustezza degli endpoint
- **Monitorare traffico in background** — scoprire tracker e analytics nascosti
- **Ispezionare dispositivi IoT** — verificare la sicurezza della smart home
- **Hooking a runtime** — tracciare GPS, SharedPreferences, operazioni crypto
- **Analisi DNS** — vedere a quali domini si connettono i tuoi dispositivi

---

## Risorse utili

- [Frida Documentation](https://frida.re/docs/home/)
- [mitmproxy Documentation](https://docs.mitmproxy.org/)
- [Objection Wiki](https://github.com/sensepost/objection/wiki)
- [OWASP Mobile Testing Guide](https://mas.owasp.org/)
