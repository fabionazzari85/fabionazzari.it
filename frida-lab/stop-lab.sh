#!/usr/bin/env bash
# =============================================================================
# Ferma il Frida Lab sul Raspberry Pi
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo ""
log "Arresto Frida Lab..."

# Ferma mitmproxy
if pkill -f mitmweb 2>/dev/null; then
    log "mitmproxy fermato"
else
    warn "mitmproxy non era in esecuzione"
fi

if pkill -f mitmproxy 2>/dev/null; then
    log "mitmproxy (CLI) fermato"
fi

# Rimuovi regole iptables di redirect
sudo iptables -t nat -D PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080 2>/dev/null || true
sudo iptables -t nat -D PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080 2>/dev/null || true
log "Regole iptables proxy rimossi"

echo ""
log "Lab fermato."
log "L'hotspot FridaLab resta attivo (usa 'sudo systemctl stop hostapd' per fermarlo)"
