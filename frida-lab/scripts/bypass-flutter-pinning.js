/*
 * =============================================================================
 * Frida Script — Bypass Certificate Pinning per app Flutter (Dart/BoringSSL)
 * =============================================================================
 *
 * Le app Flutter NON usano le API Java per le connessioni di rete.
 * Usano la libreria Dart con BoringSSL (fork di OpenSSL), quindi i bypass
 * Java standard non funzionano.
 *
 * Questo script opera a livello nativo, hookando le funzioni BoringSSL
 * nella libreria libflutter.so.
 *
 * Utilizzo:
 *   frida -U -f com.esempio.app -l bypass-flutter-pinning.js --no-pause
 *
 * Note:
 *   - Funziona con Flutter 2.x e 3.x
 *   - Il pattern matching potrebbe dover essere aggiornato per nuove versioni
 */

"use strict";

const Color = {
    RESET: "\x1b[0m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    CYAN: "\x1b[36m"
};

function log(msg)  { console.log(`${Color.GREEN}[+]${Color.RESET} ${msg}`); }
function warn(msg) { console.log(`${Color.YELLOW}[!]${Color.RESET} ${msg}`); }
function info(msg) { console.log(`${Color.CYAN}[*]${Color.RESET} ${msg}`); }

info("=== Frida Lab — Bypass Certificate Pinning Flutter ===\n");

// =============================================================================
// Metodo 1: Hook ssl_verify_peer_cert in libflutter.so
// =============================================================================
function bypassFlutterBoringSSL() {
    // Cerca la libreria Flutter
    const libflutter = Module.findBaseAddress("libflutter.so");
    if (!libflutter) {
        warn("libflutter.so non trovata. Attendo il caricamento...");
        hookOnLoad();
        return;
    }

    log("libflutter.so trovata a: " + libflutter);
    patchSSLVerify(libflutter);
}

// =============================================================================
// Attendi che libflutter.so venga caricata
// =============================================================================
function hookOnLoad() {
    Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
        onEnter: function (args) {
            this.name = args[0].readCString();
        },
        onLeave: function (retval) {
            if (this.name && this.name.includes("libflutter.so")) {
                log("libflutter.so caricata, applico il bypass...");
                const base = Module.findBaseAddress("libflutter.so");
                if (base) {
                    patchSSLVerify(base);
                }
            }
        }
    });
    info("In attesa del caricamento di libflutter.so...");
}

// =============================================================================
// Patch della funzione ssl_verify_peer_cert
// =============================================================================
function patchSSLVerify(libflutterBase) {
    // Pattern per trovare ssl_verify_peer_cert in BoringSSL
    // Questa funzione restituisce 0 (ok) o un codice di errore
    // Cerchiamo il pattern della funzione che fa la verifica

    const ranges = Process.findModuleByName("libflutter.so").enumerateRanges("r-x");
    let patched = false;

    // Pattern 1: Flutter recente (3.x) — cerca "ssl_client" e
    // la funzione di verifica nelle vicinanze
    try {
        const symbols = Module.enumerateExportsSync("libflutter.so");
        for (const sym of symbols) {
            if (sym.name.includes("ssl_verify") ||
                sym.name.includes("SSL_CTX_set_custom_verify")) {
                Interceptor.attach(sym.address, {
                    onLeave: function (retval) {
                        retval.replace(0x0);
                        log("Flutter SSL verify -> 0 (success) via export");
                    }
                });
                log("Hook su export: " + sym.name);
                patched = true;
            }
        }
    } catch (e) {
        // Exports non disponibili
    }

    // Pattern 2: Cerca il pattern in memoria
    // ssl_verify_peer_cert ritorna un enum ssl_verify_result_t
    // Vogliamo forzare il return a ssl_verify_ok (0)
    if (!patched) {
        // Pattern matching per ARM64 (la maggior parte dei telefoni moderni)
        // Cerca la sequenza di istruzioni che corrisponde alla verifica del certificato
        for (const range of ranges) {
            try {
                // Pattern per "x509_verify_cert" che e' chiamata internamente
                const matches = Memory.scanSync(range.base, range.size,
                    // Pattern: verifica del certificato con confronto risultato
                    "ff 03 01 d1 f4 4f 02 a9"
                );

                if (matches.length > 0) {
                    for (const match of matches) {
                        Interceptor.attach(match.address, {
                            onLeave: function (retval) {
                                retval.replace(0x0);
                                log("Flutter SSL verify (pattern match) -> 0 (success)");
                            }
                        });
                        patched = true;
                    }
                }
            } catch (e) {
                // Range non leggibile, continua
            }
        }
    }

    // Pattern 3: Approccio alternativo — hook session_verify_cert_chain
    if (!patched) {
        try {
            const session_verify = Module.findExportByName(
                "libflutter.so",
                "session_verify_cert_chain"
            );
            if (session_verify) {
                Interceptor.attach(session_verify, {
                    onLeave: function (retval) {
                        retval.replace(0x1); // 1 = success per questa funzione
                        log("session_verify_cert_chain -> 1 (success)");
                    }
                });
                patched = true;
                log("Hook su session_verify_cert_chain");
            }
        } catch (e) {
            // Non trovato
        }
    }

    // Pattern 4: Hook generico su SSL_CTX_set_verify
    if (!patched) {
        try {
            const ssl_set_verify = Module.findExportByName(
                "libflutter.so",
                "SSL_CTX_set_verify"
            );
            if (ssl_set_verify) {
                Interceptor.attach(ssl_set_verify, {
                    onEnter: function (args) {
                        // Imposta mode a SSL_VERIFY_NONE (0)
                        args[1] = ptr(0x0);
                        log("SSL_CTX_set_verify -> SSL_VERIFY_NONE");
                    }
                });
                patched = true;
            }
        } catch (e) {
            // Non trovato
        }
    }

    if (patched) {
        info("Bypass Flutter SSL attivato!");
        info("Il traffico HTTPS dell'app Flutter sara' visibile in mitmproxy.");
    } else {
        warn("Non sono riuscito a trovare le funzioni di verifica SSL in libflutter.so");
        warn("Potrebbe essere necessario aggiornare i pattern per questa versione di Flutter.");
        warn("Prova con: objection -g <package> explore -> android sslpinning disable");
    }
}

// --- Avvia ---
bypassFlutterBoringSSL();
