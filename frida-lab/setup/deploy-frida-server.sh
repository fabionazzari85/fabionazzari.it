#!/usr/bin/env bash
# =============================================================================
# Scarica e installa frida-server sul telefono Android connesso via USB
# Esegui dal Mac o dal Pi con il telefono collegato via USB
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[-]${NC} $1"; exit 1; }

# --- Verifica adb ---
if ! command -v adb &> /dev/null; then
    err "adb non trovato. Installa Android Platform Tools."
fi

# --- Verifica dispositivo collegato ---
log "Verifica dispositivo Android..."
DEVICE_COUNT=$(adb devices | grep -c "device$" || true)
if [ "$DEVICE_COUNT" -eq 0 ]; then
    err "Nessun dispositivo Android trovato. Verifica:
    1. USB Debugging attivo sul telefono
    2. Cavo USB collegato
    3. Autorizzazione USB accettata sul telefono"
fi

DEVICE_ID=$(adb devices | grep "device$" | head -1 | awk '{print $1}')
log "Dispositivo trovato: $DEVICE_ID"

# --- Rileva architettura del telefono ---
ARCH=$(adb shell getprop ro.product.cpu.abi)
log "Architettura CPU: $ARCH"

case "$ARCH" in
    arm64-v8a) FRIDA_ARCH="arm64" ;;
    armeabi-v7a) FRIDA_ARCH="arm" ;;
    x86_64) FRIDA_ARCH="x86_64" ;;
    x86) FRIDA_ARCH="x86" ;;
    *) err "Architettura non supportata: $ARCH" ;;
esac

# --- Ottieni la versione di Frida installata sul Mac/Pi ---
if command -v frida &> /dev/null; then
    FRIDA_VERSION=$(frida --version)
else
    warn "Frida non installato localmente, uso l'ultima versione disponibile..."
    FRIDA_VERSION=$(curl -s https://api.github.com/repos/frida/frida/releases/latest | grep '"tag_name"' | head -1 | cut -d'"' -f4)
fi
log "Versione Frida: $FRIDA_VERSION"

# --- Scarica frida-server ---
FILENAME="frida-server-${FRIDA_VERSION}-android-${FRIDA_ARCH}.xz"
DOWNLOAD_URL="https://github.com/frida/frida/releases/download/${FRIDA_VERSION}/${FILENAME}"

TMPDIR=$(mktemp -d)
log "Download frida-server da GitHub..."
log "URL: $DOWNLOAD_URL"

if ! curl -L -o "${TMPDIR}/${FILENAME}" "$DOWNLOAD_URL"; then
    err "Download fallito. Verifica la versione: $FRIDA_VERSION"
fi

# --- Decomprimi ---
log "Decompressione..."
xz -d "${TMPDIR}/${FILENAME}"
BINARY="${TMPDIR}/frida-server-${FRIDA_VERSION}-android-${FRIDA_ARCH}"

# --- Verifica root ---
log "Verifica accesso root sul telefono..."
ROOT_CHECK=$(adb shell "su -c 'id'" 2>&1 || true)
if echo "$ROOT_CHECK" | grep -q "uid=0"; then
    log "Root disponibile!"
    HAS_ROOT=true
else
    warn "Root NON disponibile. Frida-server ha bisogno di root per funzionare."
    warn "Alternative senza root:"
    warn "  - Usa 'objection patchapk' per iniettare Frida nell'APK"
    warn "  - Usa Frida Gadget"
    HAS_ROOT=false
fi

# --- Deploy sul telefono ---
log "Upload frida-server sul telefono..."
adb push "$BINARY" /data/local/tmp/frida-server

log "Impostazione permessi..."
adb shell "chmod 755 /data/local/tmp/frida-server"

# --- Avvia frida-server ---
if [ "$HAS_ROOT" = true ]; then
    log "Arresto eventuali istanze precedenti..."
    adb shell "su -c 'killall frida-server'" 2>/dev/null || true

    log "Avvio frida-server..."
    adb shell "su -c '/data/local/tmp/frida-server -D &'" &
    sleep 2

    # Verifica
    if adb shell "su -c 'ps'" | grep -q frida-server; then
        log "frida-server in esecuzione!"
    else
        warn "frida-server potrebbe non essere partito. Verifica manualmente:"
        warn "  adb shell \"su -c '/data/local/tmp/frida-server -D &'\""
    fi
else
    warn "Senza root, frida-server non puo' essere avviato automaticamente."
    warn "Usa objection per il bypass del pinning senza root."
fi

# --- Pulizia ---
rm -rf "$TMPDIR"

# --- Riepilogo ---
echo ""
log "=========================================="
log "  frida-server installato!"
log "=========================================="
echo ""
log "Test rapido (dal Mac):"
log "  frida-ps -U          # lista processi sul telefono"
log "  frida-ps -Ua         # lista app installate"
echo ""
log "Per avviare manualmente:"
log "  adb shell \"su -c '/data/local/tmp/frida-server -D &'\""
