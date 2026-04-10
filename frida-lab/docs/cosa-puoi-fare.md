# Cosa puoi fare con Frida + Raspberry Pi sulla tua rete

Guida pratica ai casi d'uso per security research personale.
Tutto va eseguito **solo sui tuoi dispositivi e sulla tua rete**.

---

## 1. Intercettare traffico HTTPS delle tue app

**Obiettivo**: Vedere in chiaro cosa le app installate sul tuo telefono inviano e ricevono.

**Cosa scopri**:
- Quali dati personali vengono inviati (posizione, contatti, identificativi)
- A quali server si collegano le app (tracker, analytics, terze parti)
- Se le credenziali vengono trasmesse in modo sicuro
- Se ci sono dati sensibili nei cookie o negli header

**Come**:
```bash
# Dal Mac — avvia il bypass sull'app
frida -U -f com.esempio.app -l scripts/bypass-android-pinning.js --no-pause

# Apri la web UI di mitmproxy dal browser del Mac
# http://fridalab.local:8081
# Usa l'app sul telefono e osserva le richieste
```

---

## 2. Analizzare i cookie e i token di sessione

**Obiettivo**: Capire come le tue app gestiscono l'autenticazione.

**Cosa scopri**:
- Se i cookie hanno i flag di sicurezza corretti (Secure, HttpOnly, SameSite)
- Se i token JWT contengono dati sensibili nel payload
- Quanto durano le sessioni (scadenza token)
- Se viene usato il refresh token correttamente

**Come**:
In mitmproxy web UI, clicca su una richiesta e guarda:
- Tab **Request** > Headers > `Cookie`, `Authorization`
- Tab **Response** > Headers > `Set-Cookie`

---

## 3. Verificare la sicurezza delle API

**Obiettivo**: Testare se le API usate dalle tue app sono robuste.

**Cosa scopri**:
- Se le API accettano input non validato
- Se ci sono endpoint nascosti o non documentati
- Se le risposte contengono dati in eccesso (over-fetching)
- Se i rate limit sono configurati

**Come**:
```bash
# Osserva le chiamate API in mitmproxy
# Poi replica le richieste con curl per testare:
curl -X GET "https://api.esempio.com/user/profile" \
  -H "Authorization: Bearer <token_intercettato>" \
  -H "Content-Type: application/json"
```

---

## 4. Controllare il traffico in background

**Obiettivo**: Scoprire cosa fanno le app quando non le usi attivamente.

**Cosa scopri**:
- App che inviano dati a tracker senza il tuo consenso
- Sincronizzazioni in background eccessive
- Connessioni a server sospetti
- App che "telefonano a casa" troppo frequentemente

**Come**:
```bash
# Avvia mitmproxy e lascia il telefono connesso all'hotspot
# Non usare il telefono per un po'
# In mitmproxy web UI, filtra per dominio:
# ~d tracker | ~d analytics | ~d ads
```

---

## 5. Ispezionare le app IoT / Smart Home

**Obiettivo**: Verificare la sicurezza dei dispositivi connessi in casa.

**Cosa scopri**:
- Se i dispositivi IoT comunicano in chiaro (HTTP invece di HTTPS)
- Quali dati raccolgono (audio, video, telemetria)
- Se i firmware update sono verificati (signed)
- Se le credenziali sono hardcoded

**Come**:
Connetti i dispositivi IoT all'hotspot FridaLab (se supportano Wi-Fi)
e osserva il traffico in mitmproxy. Per le app companion:
```bash
frida -U -f com.smartdevice.app -l scripts/bypass-android-pinning.js --no-pause
```

---

## 6. Hooking di funzioni a runtime con Frida

Oltre al bypass del pinning, Frida puo' fare molto di piu'.

### Tracciare chiamate a funzioni specifiche
```javascript
// Esempio: logga ogni volta che l'app accede alla posizione GPS
Java.perform(function() {
    var LocationManager = Java.use("android.location.LocationManager");
    LocationManager.getLastKnownLocation.implementation = function(provider) {
        console.log("[GPS] App richiede posizione via: " + provider);
        var location = this.getLastKnownLocation(provider);
        if (location) {
            console.log("[GPS] Lat: " + location.getLatitude() +
                       " Lon: " + location.getLongitude());
        }
        return location;
    };
});
```

### Monitorare accesso a file e SharedPreferences
```javascript
// Logga quando l'app legge/scrive nelle SharedPreferences
Java.perform(function() {
    var SharedPreferences = Java.use("android.app.SharedPreferencesImpl");
    SharedPreferences.getString.implementation = function(key, defValue) {
        var value = this.getString(key, defValue);
        console.log("[SharedPrefs] GET " + key + " = " + value);
        return value;
    };
});
```

### Tracciare operazioni crittografiche
```javascript
// Vedi cosa viene cifrato/decifrato dall'app
Java.perform(function() {
    var Cipher = Java.use("javax.crypto.Cipher");
    Cipher.doFinal.overload("[B").implementation = function(input) {
        console.log("[Crypto] Cipher.doFinal()");
        console.log("[Crypto] Input:  " + bytesToHex(input));
        var result = this.doFinal(input);
        console.log("[Crypto] Output: " + bytesToHex(result));
        return result;
    };
});

function bytesToHex(bytes) {
    var hex = [];
    for (var i = 0; i < bytes.length; i++) {
        hex.push(('0' + (bytes[i] & 0xFF).toString(16)).slice(-2));
    }
    return hex.join('');
}
```

---

## 7. Analisi DNS

**Obiettivo**: Vedere a quali domini si connettono i tuoi dispositivi.

**Come**: dnsmasq sul Pi logga gia' tutte le query DNS.
```bash
# Sul Pi, guarda i log DNS:
sudo tail -f /var/log/syslog | grep dnsmasq

# Vedrai righe come:
# query[A] tracking.example.com from 192.168.4.12
# query[A] api.social.com from 192.168.4.12
```

---

## 8. Testare la robustezza del certificate pinning

**Obiettivo**: Verificare se le tue app (o quelle che sviluppi) implementano
il pinning correttamente.

**Livelli di protezione**:

| Livello | Protezione | Bypass |
|---------|-----------|--------|
| Nessun pinning | Solo CA di sistema | Non serve Frida, basta mitmproxy |
| Pinning base (TrustManager) | Verifica certificato specifico | Script Frida universale |
| OkHttp CertificatePinner | Pin su hash della chiave pubblica | Script Frida universale |
| Flutter/BoringSSL | Pinning a livello nativo | Script Flutter specifico |
| Anti-Frida + obfuscation | Rileva Frida e si chiude | Richiede analisi avanzata |

---

## Checklist sicurezza personale

Dopo aver analizzato il traffico delle tue app, verifica:

- [ ] Le app trasmettono dati solo via HTTPS?
- [ ] I cookie hanno i flag Secure e HttpOnly?
- [ ] I token di sessione hanno una scadenza ragionevole?
- [ ] Le app inviano solo i dati strettamente necessari?
- [ ] Ci sono tracker/analytics di terze parti non dichiarati?
- [ ] Le password vengono hashate prima dell'invio?
- [ ] I dispositivi IoT usano connessioni cifrate?
- [ ] Le app in background non inviano dati sospetti?

---

## Note importanti

- Esegui questi test **solo sui tuoi dispositivi** e sulla **tua rete**
- Non intercettare traffico di app bancarie/finanziarie in produzione per
  evitare di esporre accidentalmente le tue credenziali — usa un account di test
- I risultati di mitmproxy possono contenere dati sensibili: non condividerli
- Aggiorna regolarmente Frida e mitmproxy per compatibilita' con nuove versioni delle app
