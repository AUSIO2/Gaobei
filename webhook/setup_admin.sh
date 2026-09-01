#!/bin/bash
# ============================================================
# 高倍管理端一键部署脚本（本地运行，SSH 到服务器）
# 用法: ./webhook/setup_admin.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step()  { echo -e "\n${CYAN}── $1 ──${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEV_CONFIG_FILE="${PROJECT_DIR}/.dev"

if [ -f "${DEV_CONFIG_FILE}" ]; then
    # shellcheck source=/dev/null
    source "${DEV_CONFIG_FILE}"
else
    error "找不到密钥配置文件 .dev"
fi

REMOTE_HOST=$(echo "$REMOTE_HOST" | tr -d '\r')
REMOTE_USER=$(echo "$REMOTE_USER" | tr -d '\r')
REMOTE_PASS=$(echo "$REMOTE_PASS" | tr -d '\r')

if [ -z "${ADMIN_ACCESS_KEY}" ]; then
    ADMIN_ACCESS_KEY=$(openssl rand -hex 24)
    echo "ADMIN_ACCESS_KEY=\"${ADMIN_ACCESS_KEY}\"" >> "${DEV_CONFIG_FILE}"
    warn "已自动生成 ADMIN_ACCESS_KEY 并追加到 .dev"
fi
ADMIN_ACCESS_KEY=$(echo "$ADMIN_ACCESS_KEY" | tr -d '\r')

if [ -z "${SESSION_SECRET}" ]; then
    SESSION_SECRET=$(openssl rand -hex 32)
    echo "SESSION_SECRET=\"${SESSION_SECRET}\"" >> "${DEV_CONFIG_FILE}"
    warn "已自动生成 SESSION_SECRET 并追加到 .dev"
fi
SESSION_SECRET=$(echo "$SESSION_SECRET" | tr -d '\r')

ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.gaobei-tech.com}"
SITE_URL="${SITE_URL:-https://www.gaobei-tech.com}"
ADMIN_COOKIE_SECURE="${ADMIN_COOKIE_SECURE:-1}"

HAS_SSHPASS=true
if ! command -v sshpass >/dev/null 2>&1; then
    HAS_SSHPASS=false
    warn "未检测到 sshpass，需手动输入密码"
fi

if [ "$HAS_SSHPASS" = true ] && [ -n "${REMOTE_PASS}" ]; then
    SSH_CMD="sshpass -p '${REMOTE_PASS}' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
    SCP_CMD="sshpass -p '${REMOTE_PASS}' scp -o StrictHostKeyChecking=no -r"
else
    SSH_CMD="ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
    SCP_CMD="scp -o StrictHostKeyChecking=no -r"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   高倍管理端 · 一键部署到服务器          ║"
echo "╚══════════════════════════════════════════╝"

step "1/4 本地构建 admin"
cd "${PROJECT_DIR}/admin"
# Ensure env for build (ASSET_DIR not needed at build time)
npm ci
npm run build
info "构建完成"

step "2/4 同步构建产物到服务器"
eval "${SSH_CMD} 'mkdir -p /root/admin /root/asset-backups'"
# standalone output
if [ -d "${PROJECT_DIR}/admin/.next/standalone" ]; then
  eval "${SCP_CMD} '${PROJECT_DIR}/admin/.next/standalone/.' '${REMOTE_USER}@${REMOTE_HOST}:/root/admin/'"
  eval "${SSH_CMD} 'mkdir -p /root/admin/.next'"
  eval "${SCP_CMD} '${PROJECT_DIR}/admin/.next/static' '${REMOTE_USER}@${REMOTE_HOST}:/root/admin/.next/'"
  if [ -d "${PROJECT_DIR}/admin/public" ]; then
    eval "${SCP_CMD} '${PROJECT_DIR}/admin/public' '${REMOTE_USER}@${REMOTE_HOST}:/root/admin/'"
  fi
else
  error "未找到 .next/standalone，请确认 next.config 设置了 output: standalone"
fi
info "文件已同步"

step "3/4 写入环境变量与 systemd"
eval "${SSH_CMD}" << REMOTE_EOF
set -e
cat > /root/admin/.env << ENV
ASSET_DIR=/root/asset
BACKUP_DIR=/root/asset-backups
ADMIN_ACCESS_KEY=${ADMIN_ACCESS_KEY}
SESSION_SECRET=${SESSION_SECRET}
SITE_URL=${SITE_URL}
ADMIN_COOKIE_SECURE=${ADMIN_COOKIE_SECURE}
PORT=9001
HOSTNAME=127.0.0.1
ADMIN_MODE=1
ENV
# Ensure asset mount is writable for admin (container still ro)
chmod -R u+w /root/asset || true
touch /root/webhook/.env
if grep -q '^ADMIN_MODE=' /root/webhook/.env; then
  sed -i 's/^ADMIN_MODE=.*/ADMIN_MODE=1/' /root/webhook/.env
else
  echo 'ADMIN_MODE=1' >> /root/webhook/.env
fi
REMOTE_EOF

eval "${SCP_CMD} '${SCRIPT_DIR}/admin.service' '${REMOTE_USER}@${REMOTE_HOST}:/etc/systemd/system/gaobei-admin.service'"

# Fix ExecStart path - standalone server.js is at /root/admin/server.js or /root/admin/admin/server.js
eval "${SSH_CMD}" << 'REMOTE_EOF'
set -e
if [ -f /root/admin/server.js ]; then
  sed -i 's|WorkingDirectory=.*|WorkingDirectory=/root/admin|' /etc/systemd/system/gaobei-admin.service
  sed -i 's|ExecStart=.*|ExecStart=/usr/bin/node server.js|' /etc/systemd/system/gaobei-admin.service
elif [ -f /root/admin/admin/server.js ]; then
  sed -i 's|WorkingDirectory=.*|WorkingDirectory=/root/admin/admin|' /etc/systemd/system/gaobei-admin.service
  sed -i 's|ExecStart=.*|ExecStart=/usr/bin/node server.js|' /etc/systemd/system/gaobei-admin.service
  # copy env
  cp /root/admin/.env /root/admin/admin/.env 2>/dev/null || true
fi
systemctl daemon-reload
systemctl enable gaobei-admin
systemctl restart gaobei-admin
systemctl restart gaobei-webhook || true
systemctl --no-pager status gaobei-admin || true
# 管理端仅监听本机；移除旧的公网端口规则（如存在）
if command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --permanent --remove-port=9001/tcp || true
  firewall-cmd --reload || true
fi
REMOTE_EOF
info "服务已启动"

step "4/4 完成"
echo ""
info "管理端已仅监听服务器本机端口，公网由 HTTPS 反向代理提供:"
echo -e "  ${CYAN}https://${ADMIN_DOMAIN}/login${NC}"
echo -e "  管理密钥: ${CYAN}${ADMIN_ACCESS_KEY}${NC}"
echo ""
warn "请在 Gitee Gaobei2 禁用 asset webhook，避免覆盖管理端修改"
warn "并可在服务器 /root/webhook/.env 或部署脚本中设置 ADMIN_MODE=1 跳过 asset rsync"
echo ""
