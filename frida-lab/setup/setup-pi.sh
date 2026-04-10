#!/usr/bin/env bash
# =============================================================================
# Setup Raspberry Pi 5 come proxy trasparente per Frida Lab
# Esegui con: sudo ./setup-pi.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[-]${NC} $1"; exit 1; }

# --- Controllo privilegi ---
if [ "$EUID" -ne 0 ]; then
    err "Esegui questo script come root: sudo ./setup-pi.sh"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log "=== Frida Lab — Setup Raspberry Pi 5 ==="
log "Questo script configurera' il Pi come hotspot Wi-Fi + proxy trasparente"
echo ""

# --- 1. Aggiornamento sistema ---
log "1/7 — Aggiornamento sistema..."
apt update && apt upgrade -y

# --- 2. Installazione pacchetti ---
log "2/7 — Installazione pacchetti necessari..."
apt install -y \
    python3-pip \
    python3-venv \
    hostapd \
    dnsmasq \
    iptables \
    iptables-persistent \
    adb \
    net-tools \
    wireless-tools \
    iw

# --- 3. Configurazione IP statico per wlan0 ---
log "3/7 — Configurazione interfaccia Wi-Fi (IP statico)..."

# Usa NetworkManager se disponibile (default su Bookworm), altrimenti dhcpcd
if systemctl is-active --quiet NetworkManager; then
    log "NetworkManager rilevato, configurazione via nmcli..."
    nmcli con delete FridaLab-AP 2>/dev/null || true
    nmcli con add type wifi ifname wlan0 con-name FridaLab-AP \
        autoconnect no \
        ssid FridaLab \
        wifi.mode ap \
        wifi.band bg \
        wifi.channel 7 \
        ipv4.method manual \
        ipv4.addresses 192.168.4.1/24 \
        wifi-sec.key-mgmt wpa-psk \
        wifi-sec.psk "fridalab2024"
else
    # Fallback: configurazione manuale
    cat > /etc/dhcpcd.conf.d/fridalab.conf << 'DHCP_EOF'
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
DHCP_EOF
fi

# --- 4. Configurazione hostapd (Access Point Wi-Fi) ---
log "4/7 — Configurazione Access Point Wi-Fi..."
cp "${SCRIPT_DIR}/hostapd.conf" /etc/hostapd/hostapd.conf

# Imposta hostapd per usare il nostro file di configurazione
if ! grep -q "^DAEMON_CONF=" /etc/default/hostapd 2>/dev/null; then
    echo 'DAEMON_CONF="/etc/hostapd/hostapd.conf"' >> /etc/default/hostapd
else
    sed -i 's|^DAEMON_CONF=.*|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd
fi

systemctl unmask hostapd
systemctl enable hostapd

# --- 5. Configurazione dnsmasq (DHCP server) ---
log "5/7 — Configurazione DHCP server (dnsmasq)..."
cp "${SCRIPT_DIR}/dnsmasq.conf" /etc/dnsmasq.d/fridalab.conf
systemctl enable dnsmasq

# --- 6. IP forwarding + iptables (proxy trasparente) ---
log "6/7 — Configurazione IP forwarding e regole iptables..."

# Abilita IP forwarding permanente
if ! grep -q "^net.ipv4.ip_forward=1" /etc/sysctl.conf; then
    echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
fi
sysctl -w net.ipv4.ip_forward=1

# NAT: il traffico dal Wi-Fi esce su Ethernet
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Proxy trasparente: redirige HTTP/HTTPS verso mitmproxy
iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 443 -j REDIRECT --to-port 8080

# Permetti il traffico forwarded
iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT
iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT

# Salva le regole iptables
netfilter-persistent save

# --- 7. Installazione mitmproxy ---
log "7/7 — Installazione mitmproxy..."

# Crea virtual environment per evitare conflitti
python3 -m venv /opt/fridalab-venv
/opt/fridalab-venv/bin/pip install --upgrade pip
/opt/fridalab-venv/bin/pip install mitmproxy

# Crea symlink per accesso globale
ln -sf /opt/fridalab-venv/bin/mitmproxy /usr/local/bin/mitmproxy
ln -sf /opt/fridalab-venv/bin/mitmweb /usr/local/bin/mitmweb
ln -sf /opt/fridalab-venv/bin/mitmdump /usr/local/bin/mitmdump

# --- Riepilogo ---
echo ""
log "=========================================="
log "  Setup completato!"
log "=========================================="
echo ""
log "Hotspot Wi-Fi:"
log "  SSID:     FridaLab"
log "  Password: fridalab2024"
log "  IP Pi:    192.168.4.1"
echo ""
log "Prossimi passi:"
log "  1. Riavvia il Pi: sudo reboot"
log "  2. Dal Mac, installa Frida: pip3 install frida-tools"
log "  3. Connetti il telefono all'hotspot FridaLab"
log "  4. Sul Pi avvia il lab: ~/frida-lab/start-lab.sh"
echo ""
warn "IMPORTANTE: Cambia la password dell'hotspot in /etc/hostapd/hostapd.conf"
