#!/bin/bash
# ============================================================
# 云路复材官网 - Webhook 服务一键安装脚本
# 在本地运行，通过 SSH 自动完成服务器端所有配置
# 用法: ./webhook/setup_webhook.sh
# ============================================================

set -e

# ---- 颜色与输出函数 ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step()  { echo -e "\n${CYAN}── $1 ──${NC}"; }

# ---- 密钥配置加载 ----
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DEV_CONFIG_FILE="${PROJECT_DIR}/.dev"

if [ -f "${DEV_CONFIG_FILE}" ]; then
    source "${DEV_CONFIG_FILE}"
else
    error "找不到密钥配置文件 .dev"
fi

REMOTE_HOST=$(echo "$REMOTE_HOST" | tr -d '\r')
REMOTE_USER=$(echo "$REMOTE_USER" | tr -d '\r')
REMOTE_PASS=$(echo "$REMOTE_PASS" | tr -d '\r')

# ---- Webhook Secret ----
if [ -z "${WEBHOOK_SECRET}" ]; then
    WEBHOOK_SECRET=$(openssl rand -hex 20)
    echo "WEBHOOK_SECRET=\"${WEBHOOK_SECRET}\"" >> "${DEV_CONFIG_FILE}"
    warn "已自动生成 WEBHOOK_SECRET 并追加到 .dev 文件"
fi
WEBHOOK_SECRET=$(echo "$WEBHOOK_SECRET" | tr -d '\r')

# ---- 检查本地依赖 ----
HAS_SSHPASS=true
if ! command -v sshpass >/dev/null 2>&1; then
    HAS_SSHPASS=false
    warn "未检测到 sshpass，需手动输入密码。提示: 密码为 ${REMOTE_PASS}"
fi

# ---- SSH / SCP 指令 ----
if [ "$HAS_SSHPASS" = true ] && [ -n "${REMOTE_PASS}" ]; then
    SSH_CMD="sshpass -p '${REMOTE_PASS}' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
    SCP_CMD="sshpass -p '${REMOTE_PASS}' scp -o StrictHostKeyChecking=no"
else
    SSH_CMD="ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
    SCP_CMD="scp -o StrictHostKeyChecking=no"
fi

# ---- Gitee 仓库地址 ----
GITEE_ASSET_REPO="https://gitee.com/AUSIO2/Gaobei2.git"
GITEE_CODE_REPO="https://gitee.com/AUSIO2/Gaobei.git"

# ---- 主流程 ----
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   云路复材官网 · Webhook 服务一键安装    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Step 1: 创建并上传服务器端安装脚本 (避免复杂的 SSH 引号问题)
step "Step 1/4: 准备服务器端安装脚本"

TEMP_DIR="${PROJECT_DIR}/scratch/deploy_temp"
mkdir -p "${TEMP_DIR}"

cat > "${TEMP_DIR}/server_setup.sh" << 'SETUP_EOF'
#!/bin/bash
set -e

echo "=== 修复软件源 ==="
# 禁用所有坏掉的 TencentOS 仓库
for repo in BaseOS AppStream Extras PowerTools docker-ce-stable epel epel-modular; do
    dnf config-manager --set-disabled "$repo" 2>/dev/null || true
done

# 添加阿里云 CentOS 8 Stream 镜像
if [ ! -f /etc/yum.repos.d/CentOS-Stream-Ali.repo ]; then
    cat > /etc/yum.repos.d/CentOS-Stream-Ali.repo << 'REPOEOF'
[ali-baseos]
name=CentOS Stream 8 - BaseOS (Aliyun Mirror)
baseurl=https://mirrors.aliyun.com/centos/8-stream/BaseOS/x86_64/os/
gpgcheck=0
enabled=1

[ali-appstream]
name=CentOS Stream 8 - AppStream (Aliyun Mirror)
baseurl=https://mirrors.aliyun.com/centos/8-stream/AppStream/x86_64/os/
gpgcheck=0
enabled=1
REPOEOF
    echo "已添加阿里云镜像源"
fi

echo "=== 安装依赖 ==="
INSTALL_REPOS="--disablerepo=* --enablerepo=ali-baseos --enablerepo=ali-appstream --enablerepo=nodesource-nodejs"

if ! command -v git >/dev/null 2>&1; then
    echo "安装 git ..."
    dnf install -y $INSTALL_REPOS git
else
    echo "git 已安装: $(git --version)"
fi

if ! command -v node >/dev/null 2>&1; then
    # 先确保 nodesource 仓库已配置
    if [ ! -f /etc/yum.repos.d/nodesource-nodejs.repo ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    fi
    echo "安装 nodejs ..."
    dnf install -y $INSTALL_REPOS nodejs
else
    echo "node 已安装: $(node --version)"
fi

if ! command -v rsync >/dev/null 2>&1; then
    echo "安装 rsync ..."
    dnf install -y $INSTALL_REPOS rsync
else
    echo "rsync 已安装"
fi

echo "=== 验证 ==="
git --version
node --version
SETUP_EOF

cat > "${TEMP_DIR}/clone_repos.sh" << CLONE_EOF
#!/bin/bash
set -e

echo "=== Clone asset 仓库 (Gitee) ==="
if [ -d /root/repo-asset/.git ]; then
    echo "repo-asset 已存在，执行 git pull"
    cd /root/repo-asset && git pull
else
    rm -rf /root/repo-asset
    git clone --depth=1 ${GITEE_ASSET_REPO} /root/repo-asset
fi

echo "=== Clone code 仓库 (Gitee) ==="
if [ -d /root/repo-code/.git ]; then
    echo "repo-code 已存在，执行 git pull"
    cd /root/repo-code && git pull
else
    rm -rf /root/repo-code
    git clone --depth=1 ${GITEE_CODE_REPO} /root/repo-code
fi

echo "=== Clone 完成 ==="
ls -la /root/repo-asset/
ls -la /root/repo-code/
CLONE_EOF

cat > "${TEMP_DIR}/start_service.sh" << SERVICE_EOF
#!/bin/bash
set -e

echo "=== 设置文件权限 ==="
chmod +x /root/webhook/deploy_asset_local.sh
chmod +x /root/webhook/deploy_full_local.sh

echo "=== 创建环境变量文件 ==="
echo "WEBHOOK_SECRET=${WEBHOOK_SECRET}" > /root/webhook/.env

echo "=== 安装 systemd 服务 ==="
cp /root/webhook/webhook.service /etc/systemd/system/gaobei-webhook.service
systemctl daemon-reload
systemctl enable gaobei-webhook.service
systemctl restart gaobei-webhook.service

echo "=== 等待启动 ==="
sleep 2
systemctl status gaobei-webhook.service --no-pager || true

echo "=== 健康检查 ==="
curl -s http://127.0.0.1:9000/health || echo "健康检查失败"
SERVICE_EOF

info "脚本准备完成"

# Step 2: 上传并执行安装
step "Step 2/4: 安装服务器端依赖 (git, node, rsync)"
eval "${SCP_CMD} '${TEMP_DIR}/server_setup.sh' '${REMOTE_USER}@${REMOTE_HOST}:/tmp/server_setup.sh'"
eval ${SSH_CMD} "'bash /tmp/server_setup.sh'"
info "依赖安装完成"

# Step 3: Clone 仓库
step "Step 3/4: 从 Gitee 克隆仓库"
eval "${SCP_CMD} '${TEMP_DIR}/clone_repos.sh' '${REMOTE_USER}@${REMOTE_HOST}:/tmp/clone_repos.sh'"
eval ${SSH_CMD} "'bash /tmp/clone_repos.sh'"
info "仓库克隆完成"

# Step 4: 上传 webhook 文件并启动服务
step "Step 4/4: 部署 Webhook 服务"
eval ${SSH_CMD} "'mkdir -p /root/webhook'"
eval "${SCP_CMD} '${SCRIPT_DIR}/server.js' '${REMOTE_USER}@${REMOTE_HOST}:/root/webhook/server.js'"
eval "${SCP_CMD} '${SCRIPT_DIR}/deploy_asset_local.sh' '${REMOTE_USER}@${REMOTE_HOST}:/root/webhook/deploy_asset_local.sh'"
eval "${SCP_CMD} '${SCRIPT_DIR}/deploy_full_local.sh' '${REMOTE_USER}@${REMOTE_HOST}:/root/webhook/deploy_full_local.sh'"
eval "${SCP_CMD} '${SCRIPT_DIR}/webhook.service' '${REMOTE_USER}@${REMOTE_HOST}:/root/webhook/webhook.service'"
eval "${SCP_CMD} '${TEMP_DIR}/start_service.sh' '${REMOTE_USER}@${REMOTE_HOST}:/tmp/start_service.sh'"
eval ${SSH_CMD} "'bash /tmp/start_service.sh'"
info "Webhook 服务已启动"

# 清理临时文件
rm -rf "${TEMP_DIR}"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Webhook 服务安装完成！${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  服务地址: ${CYAN}http://${REMOTE_HOST}:9000/webhook${NC}"
echo -e "  健康检查: ${CYAN}http://${REMOTE_HOST}:9000/health${NC}"
echo -e "  Webhook Secret: ${CYAN}${WEBHOOK_SECRET}${NC}"
echo ""
echo -e "  ${YELLOW}请在 Gitee 仓库中配置 Webhook:${NC}"
echo ""
echo -e "  1. ${CYAN}https://gitee.com/AUSIO2/Gaobei2/hooks${NC}  (asset 仓库)"
echo -e "  2. ${CYAN}https://gitee.com/AUSIO2/Gaobei/hooks${NC}   (code 仓库)"
echo ""
echo -e "  配置参数:"
echo -e "    URL:     ${CYAN}http://${REMOTE_HOST}:9000/webhook${NC}"
echo -e "    密码:    ${CYAN}${WEBHOOK_SECRET}${NC}"
echo -e "    事件:    ${CYAN}Push${NC}"
echo ""
echo -e "  ${YELLOW}查看日志:${NC}"
echo -e "    ${CYAN}ssh ${REMOTE_USER}@${REMOTE_HOST} 'journalctl -u gaobei-webhook -f'${NC}"
echo ""
