/*
 * =============================================================================
 * Frida Script — Bypass Certificate Pinning Android (Universale)
 * =============================================================================
 *
 * Bypassa il certificate pinning sulle implementazioni piu' comuni:
 *   - Android TrustManager (default)
 *   - OkHttp 3.x / 4.x (CertificatePinner)
 *   - Retrofit / OkHttp (HostnameVerifier)
 *   - Apache HttpClient (legacy)
 *   - Conscrypt (Google)
 *   - TrustKit Android
 *   - WebView
 *
 * Utilizzo:
 *   frida -U -f com.esempio.app -l bypass-android-pinning.js --no-pause
 *
 * Per uso con il lab Raspberry Pi:
 *   1. Il telefono deve essere connesso via USB al Mac
 *   2. frida-server deve essere in esecuzione sul telefono
 *   3. mitmproxy deve essere attivo sul Raspberry Pi
 */

"use strict";

// Colori per il log
const Color = {
    RESET: "\x1b[0m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    RED: "\x1b[31m",
    CYAN: "\x1b[36m"
};

function log(msg)  { console.log(`${Color.GREEN}[+]${Color.RESET} ${msg}`); }
function warn(msg) { console.log(`${Color.YELLOW}[!]${Color.RESET} ${msg}`); }
function info(msg) { console.log(`${Color.CYAN}[*]${Color.RESET} ${msg}`); }

// =============================================================================
// Helper: crea un TrustManager che accetta tutti i certificati
// =============================================================================
function createTrustAllManager() {
    const X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
    const TrustManager = Java.registerClass({
        name: "com.fridalab.TrustAllManager",
        implements: [X509TrustManager],
        methods: {
            checkClientTrusted(chain, authType) { },
            checkServerTrusted(chain, authType) { },
            getAcceptedIssuers() { return []; }
        }
    });
    return TrustManager.$new();
}

// =============================================================================
// Helper: crea un HostnameVerifier che accetta tutti gli hostname
// =============================================================================
function createTrustAllHostnameVerifier() {
    const HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
    return Java.registerClass({
        name: "com.fridalab.TrustAllHostnameVerifier",
        implements: [HostnameVerifier],
        methods: {
            verify(hostname, session) { return true; }
        }
    }).$new();
}

// =============================================================================
// 1. Bypass TrustManagerFactory (sistema Android)
// =============================================================================
function bypassTrustManagerFactory() {
    try {
        const TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
        TrustManagerFactory.getTrustManagers.implementation = function () {
            log("TrustManagerFactory.getTrustManagers() -> bypass");
            const TrustManagers = Java.array(
                "javax.net.ssl.TrustManager",
                [createTrustAllManager()]
            );
            return TrustManagers;
        };
        log("TrustManagerFactory — bypass attivo");
    } catch (e) {
        warn("TrustManagerFactory non trovato: " + e.message);
    }
}

// =============================================================================
// 2. Bypass SSLContext.init()
// =============================================================================
function bypassSSLContext() {
    try {
        const SSLContext = Java.use("javax.net.ssl.SSLContext");
        SSLContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;",
            "[Ljavax.net.ssl.TrustManager;",
            "java.security.SecureRandom"
        ).implementation = function (km, tm, sr) {
            log("SSLContext.init() -> inietto TrustAll manager");
            const TrustManagers = Java.array(
                "javax.net.ssl.TrustManager",
                [createTrustAllManager()]
            );
            this.init(km, TrustManagers, sr);
        };
        log("SSLContext.init — bypass attivo");
    } catch (e) {
        warn("SSLContext.init non trovato: " + e.message);
    }
}

// =============================================================================
// 3. Bypass OkHttp3 CertificatePinner
// =============================================================================
function bypassOkHttp3() {
    try {
        const CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload(
            "java.lang.String",
            "java.util.List"
        ).implementation = function (hostname, peerCertificates) {
            log("OkHttp3 CertificatePinner.check(\"" + hostname + "\") -> bypass");
        };
        log("OkHttp3 CertificatePinner — bypass attivo");
    } catch (e) {
        warn("OkHttp3 CertificatePinner non trovato (normale se l'app non usa OkHttp): " + e.message);
    }

    // Anche il metodo con varargs (versioni precedenti)
    try {
        const CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload(
            "java.lang.String",
            "[Ljava.security.cert.Certificate;"
        ).implementation = function (hostname, peerCertificates) {
            log("OkHttp3 CertificatePinner.check(certs) -> bypass");
        };
    } catch (e) {
        // Overload non disponibile, ok
    }
}

// =============================================================================
// 4. Bypass OkHttp3 HostnameVerifier
// =============================================================================
function bypassOkHttpHostnameVerifier() {
    try {
        const Builder = Java.use("okhttp3.OkHttpClient$Builder");
        Builder.hostnameVerifier.implementation = function (hostnameVerifier) {
            log("OkHttpClient.Builder.hostnameVerifier() -> inietto TrustAll");
            return this.hostnameVerifier(createTrustAllHostnameVerifier());
        };
        log("OkHttp3 HostnameVerifier — bypass attivo");
    } catch (e) {
        warn("OkHttp3 HostnameVerifier non trovato: " + e.message);
    }
}

// =============================================================================
// 5. Bypass HttpsURLConnection (default Android)
// =============================================================================
function bypassHttpsURLConnection() {
    try {
        const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");

        HttpsURLConnection.setDefaultHostnameVerifier.implementation = function (v) {
            log("HttpsURLConnection.setDefaultHostnameVerifier() -> bypass");
            this.setDefaultHostnameVerifier(createTrustAllHostnameVerifier());
        };

        HttpsURLConnection.setSSLSocketFactory.implementation = function (factory) {
            log("HttpsURLConnection.setSSLSocketFactory() -> bypass");
            // Crea un SSLContext che accetta tutto
            const SSLContext = Java.use("javax.net.ssl.SSLContext");
            const ctx = SSLContext.getInstance("TLS");
            const TrustManagers = Java.array(
                "javax.net.ssl.TrustManager",
                [createTrustAllManager()]
            );
            ctx.init(null, TrustManagers, null);
            this.setSSLSocketFactory(ctx.getSocketFactory());
        };

        HttpsURLConnection.setHostnameVerifier.implementation = function (v) {
            log("HttpsURLConnection.setHostnameVerifier() -> bypass");
            this.setHostnameVerifier(createTrustAllHostnameVerifier());
        };

        log("HttpsURLConnection — bypass attivo");
    } catch (e) {
        warn("HttpsURLConnection: " + e.message);
    }
}

// =============================================================================
// 6. Bypass WebView SSL errors
// =============================================================================
function bypassWebView() {
    try {
        const WebViewClient = Java.use("android.webkit.WebViewClient");
        WebViewClient.onReceivedSslError.implementation = function (view, handler, error) {
            log("WebView SSL error -> proceed");
            handler.proceed();
        };
        log("WebView SSL — bypass attivo");
    } catch (e) {
        warn("WebView: " + e.message);
    }
}

// =============================================================================
// 7. Bypass Conscrypt (usato da molte app Google)
// =============================================================================
function bypassConscrypt() {
    try {
        const Platform = Java.use("com.android.org.conscrypt.Platform");
        Platform.checkServerTrusted.overload(
            "javax.net.ssl.X509TrustManager",
            "[Ljava.security.cert.X509Certificate;",
            "java.lang.String",
            "com.android.org.conscrypt.AbstractConscryptSocket"
        ).implementation = function (tm, chain, authType, socket) {
            log("Conscrypt.checkServerTrusted() -> bypass");
        };
        log("Conscrypt — bypass attivo");
    } catch (e) {
        warn("Conscrypt non trovato (normale se non e' un'app Google): " + e.message);
    }
}

// =============================================================================
// 8. Bypass TrustKit (libreria di pinning popolare)
// =============================================================================
function bypassTrustKit() {
    try {
        const TrustManagerImpl = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
        TrustManagerImpl.verify.overload(
            "java.lang.String",
            "javax.net.ssl.SSLSession"
        ).implementation = function (hostname, session) {
            log("TrustKit.verify(\"" + hostname + "\") -> bypass");
            return true;
        };
        log("TrustKit — bypass attivo");
    } catch (e) {
        warn("TrustKit non trovato: " + e.message);
    }
}

// =============================================================================
// 9. Bypass Network Security Config (Android 7+)
// =============================================================================
function bypassNetworkSecurityConfig() {
    try {
        const NetworkSecurityTrustManager = Java.use(
            "android.security.net.config.NetworkSecurityTrustManager"
        );
        NetworkSecurityTrustManager.checkServerTrusted.overload(
            "[Ljava.security.cert.X509Certificate;",
            "java.lang.String"
        ).implementation = function (chain, authType) {
            log("NetworkSecurityConfig.checkServerTrusted() -> bypass");
        };
        log("NetworkSecurityConfig — bypass attivo");
    } catch (e) {
        warn("NetworkSecurityConfig: " + e.message);
    }
}

// =============================================================================
// Main — Avvia tutti i bypass
// =============================================================================
info("=== Frida Lab — Bypass Certificate Pinning Android ===");
info("Attivazione bypass...\n");

Java.perform(function () {
    bypassTrustManagerFactory();
    bypassSSLContext();
    bypassOkHttp3();
    bypassOkHttpHostnameVerifier();
    bypassHttpsURLConnection();
    bypassWebView();
    bypassConscrypt();
    bypassTrustKit();
    bypassNetworkSecurityConfig();

    info("\nTutti i bypass attivati. Il traffico HTTPS sara' visibile in mitmproxy.");
    info("Apri http://fridalab.local:8081 dal Mac per la web UI.");
});
