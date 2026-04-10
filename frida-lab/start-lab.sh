#!/usr/bin/env bash
# =============================================================================
# Avvia il Frida Lab sul Raspberry Pi
# Esegui con: ./start-lab.sh
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
info() { echo -e "${CYAN}[*]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MITMPROXY_LOG="${SCRIPT_DIR}/logs/mitmproxy.log"

mkdir -p "${SCRIPT_DIR}/logs"

echo ""
info "=============================="
info "  Frida Lab — Avvio"
info "=============================="
echo ""

# --- 1. Verifica servizi di rete ---
log "Verifica servizi di rete..."

if ! systemctl is-active --quiet hostapd; then
    warn "hostapd non attivo, avvio..."
    sudo systemctl start hostapd
fi

if ! systemctl is-active --quiet dnsmasq; then
    warn "dnsmasq non attivo, avvio..."
    sudo systemctl start dnsmasq
fi

log "Hotspot FridaLab attivo (192.168.4.1)"

# --- 2. Verifica IP forwarding ---
if [ "$(cat /proc/sys/net/ipv4/ip_forward)" != "1" ]; then
    warn "IP forwarding disabilitato, attivo..."
    sudo sysctl -w net.ipv4.ip_forward=1
fi

# --- 3. Verifica regole iptables ---
if ! sudo iptables -t nat -C PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080 2>/dev/null; then
    warn "Regole iptables mancanti, le aggiungo..."
    sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
    sudo iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080
fi

# --- 4. Avvia mitmproxy ---
log "Avvio mitmproxy (web UI sulla porta 8081)..."

# Ferma eventuali istanze precedenti
pkill -f mitmweb 2>/dev/null || true
sleep 1

mitmweb \
    --mode transparent \
    --showhost \
    --web-host 0.0.0.0 \
    --web-port 8081 \
    --set console_eventlog_verbosity=warn \
    > "$MITMPROXY_LOG" 2>&1 &

MITM_PID=$!
sleep 2

if kill -0 "$MITM_PID" 2>/dev/null; then
    log "mitmproxy avviato (PID: $MITM_PID)"
else
    warn "mitmproxy non si e' avviato. Controlla: $MITMPROXY_LOG"
fi

# --- 5. Riepilogo ---
PI_IP=$(hostname -I | awk '{print $1}')

echo ""
info "=============================="
info "  Lab pronto!"
info "=============================="
echo ""
log "Rete:"
log "  Hotspot SSID:  FridaLab"
log "  IP Raspberry:  192.168.4.1"
log "  IP Ethernet:   ${PI_IP}"
echo ""
log "mitmproxy:"
log "  Web UI:     http://fridalab.local:8081"
log "  oppure:     http://${PI_IP}:8081"
log "  Cert CA:    http://mitm.it (dal telefono)"
log "  Log:        ${MITMPROXY_LOG}"
echo ""
log "Prossimi passi (dal Mac):"
log "  1. Connetti il telefono all'hotspot FridaLab"
log "  2. Installa il certificato CA: apri http://mitm.it dal telefono"
log "  3. Collega il telefono via USB al Mac"
log "  4. Lancia il bypass:"
log "     frida -U -f com.esempio.app -l scripts/bypass-android-pinning.js --no-pause"
echo ""
log "Per fermare: ./stop-lab.sh"
