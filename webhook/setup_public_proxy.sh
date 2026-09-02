#!/bin/bash
# 在官网服务器安装 Caddy，并按域名代理官网与管理端。

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEV_CONFIG_FILE="${PROJECT_DIR}/.dev"

[ -f "${DEV_CONFIG_FILE}" ] || error "找不到 .dev"
# shellcheck source=/dev/null
source "${DEV_CONFIG_FILE}"

REMOTE_HOST=$(echo "$REMOTE_HOST" | tr -d '\r')
REMOTE_USER=$(echo "$REMOTE_USER" | tr -d '\r')
REMOTE_PASS=$(echo "$REMOTE_PASS" | tr -d '\r')

if command -v sshpass >/dev/null 2>&1 && [ -n "${REMOTE_PASS}" ]; then
    SSH_CMD=(sshpass -e ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}")
    export SSHPASS="${REMOTE_PASS}"
else
    SSH_CMD=(ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}")
fi

"${SSH_CMD[@]}" 'bash -s' <<'REMOTE_EOF'
set -e

BACKUP_DIR="/root/deploy-backups/$(date +%Y%m%d-%H%M%S)-proxy"
mkdir -p "${BACKUP_DIR}"
iptables-save > "${BACKUP_DIR}/iptables.rules" 2>/dev/null || true
[ -f /etc/caddy/Caddyfile ] && cp /etc/caddy/Caddyfile "${BACKUP_DIR}/Caddyfile" || true

if ! command -v caddy >/dev/null 2>&1; then
  dnf install -y dnf-plugins-core
  dnf copr enable -y @caddy/caddy epel-8-x86_64
  dnf install -y caddy
fi

mkdir -p /etc/caddy
cat > /etc/caddy/Caddyfile <<'CADDY'
www.gaobei-tech.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}

admin.gaobei-tech.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:9001
  header Strict-Transport-Security "max-age=31536000"
}

http://43.137.10.128 {
  reverse_proxy 127.0.0.1:3000
}
CADDY

caddy fmt --overwrite /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile
systemctl enable caddy
systemctl restart caddy

while iptables -t nat -C PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000 2>/dev/null; do
  iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
done
while iptables -t nat -C OUTPUT -p tcp --dport 80 -j REDIRECT --to-port 3000 2>/dev/null; do
  iptables -t nat -D OUTPUT -p tcp --dport 80 -j REDIRECT --to-port 3000
done

touch /root/webhook/.env
if grep -q '^REVERSE_PROXY_MODE=' /root/webhook/.env; then
  sed -i 's/^REVERSE_PROXY_MODE=.*/REVERSE_PROXY_MODE=caddy/' /root/webhook/.env
else
  echo 'REVERSE_PROXY_MODE=caddy' >> /root/webhook/.env
fi
systemctl restart gaobei-webhook
podman start yunlu-website-app 2>/dev/null || true
systemctl restart caddy

systemctl --no-pager --full status caddy | sed -n '1,20p'
echo "backup=${BACKUP_DIR}"
REMOTE_EOF

info "Caddy 配置完成"
echo -e "  官网:   ${CYAN}https://www.gaobei-tech.com${NC}"
echo -e "  管理端: ${CYAN}https://admin.gaobei-tech.com${NC}"
