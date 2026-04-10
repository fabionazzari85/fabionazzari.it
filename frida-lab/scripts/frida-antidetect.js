/*
 * =============================================================================
 * Frida Script — Anti-Detection + Bypass Pinning Avanzato
 * =============================================================================
 *
 * Le app piu' protette (Instagram, WhatsApp, app bancarie) rilevano Frida
 * tramite diversi metodi. Questo script cerca di nascondere la presenza
 * di Frida prima di applicare il bypass del certificate pinning.
 *
 * Tecniche anti-detection implementate:
 *   1. Nasconde le porte di ascolto di Frida (/proc/net/tcp)
 *   2. Nasconde le librerie Frida dalla memoria (/proc/self/maps)
 *   3. Nasconde i thread di Frida (/proc/self/task)
 *   4. Bypassa i controlli su file tipici di Frida
 *   5. Blocca il rilevamento tramite ptrace
 *   6. Nasconde le proprieta' di sistema tipiche di ambienti root/hook
 *
 * Utilizzo:
 *   frida -U -f com.esempio.app -l frida-antidetect.js --no-pause
 *
 * Nota: Carica questo script PRIMA degli altri script di bypass.
 *       Oppure usalo da solo — include gia' il bypass del pinning.
 */

"use strict";

const Color = {
    RESET: "\x1b[0m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    CYAN: "\x1b[36m",
    RED: "\x1b[31m"
};

function log(msg)  { console.log(`${Color.GREEN}[+]${Color.RESET} ${msg}`); }
function warn(msg) { console.log(`${Color.YELLOW}[!]${Color.RESET} ${msg}`); }
function info(msg) { console.log(`${Color.CYAN}[*]${Color.RESET} ${msg}`); }

info("=== Frida Lab — Anti-Detection + Bypass Avanzato ===\n");

// =============================================================================
// PARTE 1: ANTI-DETECTION (livello nativo)
// =============================================================================

// --------------------------------------------------------------------------
// 1a. Nascondi Frida da /proc/self/maps
//     Le app leggono questo file per cercare "frida", "gadget", "agent"
// --------------------------------------------------------------------------
function hideFromProcMaps() {
    try {
        const openPtr = Module.findExportByName("libc.so", "open");
        const readPtr = Module.findExportByName("libc.so", "read");

        // Parole che le app cercano per rilevare Frida
        const FRIDA_SIGNATURES = [
            "frida",
            "gadget",
            "linjector",
            "agent",
            "gmain",
            "gum-js-loop"
        ];

        // Hook su fopen per /proc/self/maps
        const fopen = new NativeFunction(
            Module.findExportByName("libc.so", "fopen"),
            "pointer",
            ["pointer", "pointer"]
        );

        Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
            onEnter: function (args) {
                this.path = args[0].readCString();
            },
            onLeave: function (retval) {
                if (this.path && (
                    this.path.includes("/proc/self/maps") ||
                    this.path.includes("/proc/" + Process.id + "/maps")
                )) {
                    // Segna questo file descriptor per filtraggio
                    this.isMapsFile = true;
                }
            }
        });

        // Hook su fgets per filtrare le righe sospette
        Interceptor.attach(Module.findExportByName("libc.so", "fgets"), {
            onLeave: function (retval) {
                if (!retval.isNull()) {
                    try {
                        var line = retval.readCString();
                        if (line) {
                            var lower = line.toLowerCase();
                            for (var i = 0; i < FRIDA_SIGNATURES.length; i++) {
                                if (lower.includes(FRIDA_SIGNATURES[i])) {
                                    // Sovrascrivi la riga con una vuota
                                    retval.writeUtf8String("");
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        // Ignora errori di lettura
                    }
                }
            }
        });

        log("Anti-detect: /proc/self/maps — filtro attivo");
    } catch (e) {
        warn("Anti-detect maps: " + e.message);
    }
}

// --------------------------------------------------------------------------
// 1b. Nascondi le porte di Frida da /proc/net/tcp
//     Frida ascolta di default sulla porta 27042
// --------------------------------------------------------------------------
function hideFromProcNet() {
    try {
        // Porta 27042 in hex (little-endian) = 69A2
        const FRIDA_PORT_HEX = "69A2";

        Interceptor.attach(Module.findExportByName("libc.so", "fgets"), {
            onLeave: function (retval) {
                if (!retval.isNull()) {
                    try {
                        var line = retval.readCString();
                        if (line && line.includes(FRIDA_PORT_HEX)) {
                            retval.writeUtf8String("");
                        }
                    } catch (e) { }
                }
            }
        });

        log("Anti-detect: /proc/net/tcp — porta Frida nascosta");
    } catch (e) {
        warn("Anti-detect net: " + e.message);
    }
}

// --------------------------------------------------------------------------
// 1c. Nascondi i thread di Frida
//     Le app enumerano /proc/self/task e cercano thread con nomi sospetti
// --------------------------------------------------------------------------
function hideFridaThreads() {
    try {
        const FRIDA_THREAD_NAMES = [
            "gmain",
            "gdbus",
            "gum-js-loop",
            "frida",
            "agent",
            "linjector"
        ];

        // Hook su opendir per /proc/self/task
        Interceptor.attach(Module.findExportByName("libc.so", "opendir"), {
            onEnter: function (args) {
                this.path = args[0].readCString();
            },
            onLeave: function (retval) {
                // Log per debug se serve
            }
        });

        // Hook su pthread_getname_np per nascondere nomi thread
        try {
            Interceptor.attach(Module.findExportByName("libc.so", "pthread_getname_np"), {
                onLeave: function (retval) {
                    try {
                        var name = this.context.x1 || this.context.r1;
                        if (name) {
                            var threadName = name.readCString();
                            if (threadName) {
                                var lower = threadName.toLowerCase();
                                for (var i = 0; i < FRIDA_THREAD_NAMES.length; i++) {
                                    if (lower.includes(FRIDA_THREAD_NAMES[i])) {
                                        name.writeUtf8String("app_thread");
                                        break;
                                    }
                                }
                            }
                        }
                    } catch (e) { }
                }
            });
        } catch (e) {
            // pthread_getname_np potrebbe non essere disponibile
        }

        log("Anti-detect: thread Frida nascosti");
    } catch (e) {
        warn("Anti-detect threads: " + e.message);
    }
}

// --------------------------------------------------------------------------
// 1d. Blocca il rilevamento tramite ptrace
//     Alcune app chiamano ptrace(PTRACE_TRACEME) per impedire il debug.
//     Se ptrace fallisce, sanno che qualcuno le sta gia' tracciando.
// --------------------------------------------------------------------------
function bypassPtrace() {
    try {
        const PTRACE_TRACEME = 0;

        Interceptor.attach(Module.findExportByName("libc.so", "ptrace"), {
            onEnter: function (args) {
                this.request = args[0].toInt32();
            },
            onLeave: function (retval) {
                if (this.request === PTRACE_TRACEME) {
                    retval.replace(ptr(0)); // Simula successo
                    log("Anti-detect: ptrace(PTRACE_TRACEME) -> 0 (simulato)");
                }
            }
        });

        log("Anti-detect: ptrace bypass attivo");
    } catch (e) {
        warn("Anti-detect ptrace: " + e.message);
    }
}

// --------------------------------------------------------------------------
// 1e. Nascondi file legati a Frida / root dal filesystem
//     Alcune app controllano l'esistenza di file come:
//     /data/local/tmp/frida-server, /system/bin/su, ecc.
// --------------------------------------------------------------------------
function hideFilesFromAccess() {
    try {
        const HIDDEN_PATHS = [
            "frida",
            "magisk",
            "/system/bin/su",
            "/system/xbin/su",
            "/sbin/su",
            "supersu",
            "/data/local/tmp/frida"
        ];

        // Hook su access() — usato per verificare se un file esiste
        Interceptor.attach(Module.findExportByName("libc.so", "access"), {
            onEnter: function (args) {
                var path = args[0].readCString();
                if (path) {
                    var lower = path.toLowerCase();
                    for (var i = 0; i < HIDDEN_PATHS.length; i++) {
                        if (lower.includes(HIDDEN_PATHS[i])) {
                            // Cambia il path in qualcosa che non esiste
                            args[0].writeUtf8String("/proc/nofile");
                            log("Anti-detect: access(\"" + path + "\") -> nascosto");
                            break;
                        }
                    }
                }
            }
        });

        // Hook su stat() — altro metodo per verificare file
        Interceptor.attach(Module.findExportByName("libc.so", "stat"), {
            onEnter: function (args) {
                try {
                    var path = args[0].readCString();
                    if (path) {
                        var lower = path.toLowerCase();
                        for (var i = 0; i < HIDDEN_PATHS.length; i++) {
                            if (lower.includes(HIDDEN_PATHS[i])) {
                                args[0].writeUtf8String("/proc/nofile");
                                break;
                            }
                        }
                    }
                } catch (e) { }
            }
        });

        log("Anti-detect: file Frida/root nascosti dal filesystem");
    } catch (e) {
        warn("Anti-detect files: " + e.message);
    }
}

// --------------------------------------------------------------------------
// 1f. Bypass controlli su System.getProperty e Build
//     Le app controllano proprieta' come ro.debuggable, ro.build.tags
// --------------------------------------------------------------------------
function bypassSystemProperties() {
    try {
        Java.perform(function () {
            // Hook System.getProperty
            var System = Java.use("java.lang.System");
            System.getProperty.overload("java.lang.String").implementation = function (key) {
                // Nascondi proprieta' sospette
                if (key === "ro.debuggable") {
                    return "0";
                }
                return this.getProperty(key);
            };

            // Hook Build.TAGS — "test-keys" indica un build custom/root
            var Build = Java.use("android.os.Build");
            var tags = Build.TAGS.value;
            if (tags && tags.includes("test-keys")) {
                Build.TAGS.value = "release-keys";
                log("Anti-detect: Build.TAGS cambiato a 'release-keys'");
            }
        });

        log("Anti-detect: proprieta' di sistema mascherate");
    } catch (e) {
        warn("Anti-detect properties: " + e.message);
    }
}

// =============================================================================
// PARTE 2: BYPASS CERTIFICATE PINNING AVANZATO
//          (include le stesse tecniche dello script base + extra)
// =============================================================================

function advancedPinningBypass() {
    Java.perform(function () {

        // --- TrustManagerFactory ---
        try {
            var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
            TrustManagerFactory.getTrustManagers.implementation = function () {
                var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
                var manager = Java.registerClass({
                    name: "com.antidetect.TrustAll",
                    implements: [X509TrustManager],
                    methods: {
                        checkClientTrusted: function (chain, authType) { },
                        checkServerTrusted: function (chain, authType) { },
                        getAcceptedIssuers: function () { return []; }
                    }
                });
                return Java.array("javax.net.ssl.TrustManager", [manager.$new()]);
            };
            log("Bypass: TrustManagerFactory");
        } catch (e) { }

        // --- SSLContext.init ---
        try {
            var SSLContext = Java.use("javax.net.ssl.SSLContext");
            SSLContext.init.overload(
                "[Ljavax.net.ssl.KeyManager;",
                "[Ljavax.net.ssl.TrustManager;",
                "java.security.SecureRandom"
            ).implementation = function (km, tm, sr) {
                var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
                var manager = Java.registerClass({
                    name: "com.antidetect.TrustAll2",
                    implements: [X509TrustManager],
                    methods: {
                        checkClientTrusted: function (chain, authType) { },
                        checkServerTrusted: function (chain, authType) { },
                        getAcceptedIssuers: function () { return []; }
                    }
                });
                var trustAll = Java.array("javax.net.ssl.TrustManager", [manager.$new()]);
                this.init(km, trustAll, sr);
            };
            log("Bypass: SSLContext.init");
        } catch (e) { }

        // --- OkHttp3 CertificatePinner ---
        try {
            var CertificatePinner = Java.use("okhttp3.CertificatePinner");
            CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function (hostname) {
                log("Bypass: OkHttp3 pin check -> " + hostname);
            };
        } catch (e) { }

        try {
            var CertificatePinner = Java.use("okhttp3.CertificatePinner");
            CertificatePinner.check.overload("java.lang.String", "[Ljava.security.cert.Certificate;").implementation = function () {
                log("Bypass: OkHttp3 pin check (certs)");
            };
        } catch (e) { }

        // --- OkHttp3 HostnameVerifier ---
        try {
            var HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
            var verifier = Java.registerClass({
                name: "com.antidetect.HostVerifier",
                implements: [HostnameVerifier],
                methods: {
                    verify: function (hostname, session) { return true; }
                }
            });
            var Builder = Java.use("okhttp3.OkHttpClient$Builder");
            Builder.hostnameVerifier.implementation = function () {
                return this.hostnameVerifier(verifier.$new());
            };
            log("Bypass: OkHttp3 HostnameVerifier");
        } catch (e) { }

        // --- HttpsURLConnection ---
        try {
            var HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
            var HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
            var allVerifier = Java.registerClass({
                name: "com.antidetect.AllVerifier",
                implements: [HostnameVerifier],
                methods: {
                    verify: function () { return true; }
                }
            });
            HttpsURLConnection.setDefaultHostnameVerifier.implementation = function () {
                this.setDefaultHostnameVerifier(allVerifier.$new());
            };
            HttpsURLConnection.setHostnameVerifier.implementation = function () {
                this.setHostnameVerifier(allVerifier.$new());
            };
            log("Bypass: HttpsURLConnection");
        } catch (e) { }

        // --- WebView ---
        try {
            var WebViewClient = Java.use("android.webkit.WebViewClient");
            WebViewClient.onReceivedSslError.implementation = function (view, handler) {
                handler.proceed();
            };
            log("Bypass: WebView SSL");
        } catch (e) { }

        // --- Conscrypt ---
        try {
            var Platform = Java.use("com.android.org.conscrypt.Platform");
            Platform.checkServerTrusted.overload(
                "javax.net.ssl.X509TrustManager",
                "[Ljava.security.cert.X509Certificate;",
                "java.lang.String",
                "com.android.org.conscrypt.AbstractConscryptSocket"
            ).implementation = function () {
                log("Bypass: Conscrypt checkServerTrusted");
            };
        } catch (e) { }

        // --- NetworkSecurityConfig (Android 7+) ---
        try {
            var NSTM = Java.use("android.security.net.config.NetworkSecurityTrustManager");
            NSTM.checkServerTrusted.overload(
                "[Ljava.security.cert.X509Certificate;",
                "java.lang.String"
            ).implementation = function () {
                log("Bypass: NetworkSecurityConfig");
            };
        } catch (e) { }

        // --- TrustKit ---
        try {
            var TrustKit = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
            TrustKit.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function () {
                return true;
            };
            log("Bypass: TrustKit");
        } catch (e) { }

        // --- Appcelerator Titanium PinningTrustManager ---
        try {
            var PTM = Java.use("appcelerator.https.PinningTrustManager");
            PTM.checkServerTrusted.implementation = function () { };
            log("Bypass: Appcelerator PinningTrustManager");
        } catch (e) { }

        // --- PhoneGap / Cordova SSLCertificateChecker ---
        try {
            var SSLCC = Java.use("nl.xservices.plugins.SSLCertificateChecker");
            SSLCC.execute.implementation = function (action, args, context) {
                context.success("CONNECTION_SECURE");
                return true;
            };
            log("Bypass: PhoneGap SSLCertificateChecker");
        } catch (e) { }

        // --- Cronet (Google Chrome net stack) ---
        try {
            var CronetEngine = Java.use("org.chromium.net.CronetEngine$Builder");
            CronetEngine.enablePublicKeyPinningBypassForLocalTrustAnchors.implementation = function (v) {
                return this.enablePublicKeyPinningBypassForLocalTrustAnchors(true);
            };
            log("Bypass: Cronet public key pinning");
        } catch (e) { }

    });
}

// =============================================================================
// PARTE 3: ANTI-ROOT DETECTION
// =============================================================================

function bypassRootDetection() {
    Java.perform(function () {

        // --- RootBeer (libreria popolare per root detection) ---
        try {
            var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
            RootBeer.isRooted.implementation = function () {
                log("Anti-root: RootBeer.isRooted() -> false");
                return false;
            };
            RootBeer.isRootedWithoutBusyBoxCheck.implementation = function () {
                return false;
            };
        } catch (e) { }

        // --- SafetyNet / Play Integrity ---
        try {
            var SafetyNet = Java.use("com.google.android.gms.safetynet.SafetyNetApi");
            // SafetyNet e' piu' complesso da bypassare, logghiamo l'attempt
            warn("SafetyNet rilevato — potrebbe servire un modulo Magisk dedicato");
        } catch (e) { }

        // --- Generic root checks ---
        try {
            var Runtime = Java.use("java.lang.Runtime");
            var originalExec = Runtime.exec.overload("java.lang.String");
            originalExec.implementation = function (cmd) {
                // Blocca comandi usati per root detection
                if (cmd === "su" || cmd === "which su" || cmd.includes("/su")) {
                    log("Anti-root: bloccato exec(\"" + cmd + "\")");
                    throw Java.use("java.io.IOException").$new("Permission denied");
                }
                return originalExec.call(this, cmd);
            };
        } catch (e) { }

        // --- File.exists() per path di root ---
        try {
            var File = Java.use("java.io.File");
            var originalExists = File.exists;
            File.exists.implementation = function () {
                var path = this.getAbsolutePath();
                var rootPaths = [
                    "/system/bin/su", "/system/xbin/su", "/sbin/su",
                    "/data/local/su", "/data/local/bin/su",
                    "/system/app/Superuser.apk", "/system/app/SuperSU.apk",
                    "/data/adb/magisk", "/system/bin/magisk"
                ];
                for (var i = 0; i < rootPaths.length; i++) {
                    if (path === rootPaths[i]) {
                        log("Anti-root: File.exists(\"" + path + "\") -> false");
                        return false;
                    }
                }
                return originalExists.call(this);
            };
        } catch (e) { }

        // --- PackageManager check per app di root ---
        try {
            var PM = Java.use("android.app.ApplicationPackageManager");
            var originalGetPackageInfo = PM.getPackageInfo.overload("java.lang.String", "int");
            originalGetPackageInfo.implementation = function (name, flags) {
                var rootPackages = [
                    "com.topjohnwu.magisk",
                    "eu.chainfire.supersu",
                    "com.koushikdutta.superuser",
                    "com.thirdparty.superuser",
                    "com.noshufou.android.su"
                ];
                for (var i = 0; i < rootPackages.length; i++) {
                    if (name === rootPackages[i]) {
                        log("Anti-root: getPackageInfo(\"" + name + "\") -> not found");
                        throw Java.use("android.content.pm.PackageManager$NameNotFoundException").$new(name);
                    }
                }
                return originalGetPackageInfo.call(this, name, flags);
            };
        } catch (e) { }

    });
}

// =============================================================================
// AVVIO — Ordine importante: prima anti-detection, poi bypass
// =============================================================================

info("Fase 1: Attivazione anti-detection (livello nativo)...\n");

hideFromProcMaps();
hideFromProcNet();
hideFridaThreads();
bypassPtrace();
hideFilesFromAccess();

info("\nFase 2: Attivazione anti-root detection...\n");

bypassSystemProperties();
bypassRootDetection();

info("\nFase 3: Attivazione bypass certificate pinning...\n");

advancedPinningBypass();

info("\n=== Tutti i moduli attivati ===");
info("Anti-detection: attivo");
info("Anti-root: attivo");
info("Bypass SSL pinning: attivo");
info("\nSe l'app si chiude comunque, potrebbe avere protezioni aggiuntive.");
info("Prova ad avviarla piu' volte — alcune detection sono basate su timing.");
