#!/bin/bash
# ============================================================
# 云路复材官网 - 一键部署脚本
# 用法: ./deploy.sh
# ============================================================

set -e

# ---- 颜色与输出函数 ----
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ---- 密钥配置加载 ----
DEV_CONFIG_FILE="$(dirname "$0")/.dev"
if [ -f "${DEV_CONFIG_FILE}" ]; then
    source "${DEV_CONFIG_FILE}"
else
    error "找不到密钥配置文件 .dev，请在项目根目录下创建该文件并配置 REMOTE_HOST, REMOTE_USER 和 REMOTE_PASS。"
fi

# ---- 配置区（按需修改） ----
REMOTE_WEBSITE_DIR="/root/website"
REMOTE_ASSET_DIR="/root/asset"
LOCAL_WEBSITE_DIR="$(cd "$(dirname "$0")/website" && pwd)"
LOCAL_ASSET_DIR="$(cd "$(dirname "$0")/asset" && pwd)"
IMAGE_NAME="yunlu-website"
CONTAINER_NAME="yunlu-website-app"
LISTEN_PORT=3000        # 容器内 Next.js 端口
PUBLIC_PORT=80           # 对外暴露端口

# ---- 前置检查 ----
check_deps() {
    command -v rsync  >/dev/null 2>&1 || error "请先安装 rsync"
    command -v sshpass >/dev/null 2>&1 || error "请先安装 sshpass (brew install sshpass 或 brew install hudochenkov/sshpass/sshpass)"
}

SSH_CMD="sshpass -p '${REMOTE_PASS}' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
SCP_CMD="sshpass -p '${REMOTE_PASS}' scp -o StrictHostKeyChecking=no"
RSYNC_CMD="sshpass -p '${REMOTE_PASS}' rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    -e 'ssh -o StrictHostKeyChecking=no'"

# ---- Step 1: 同步代码与配置到远程服务器 ----
sync_code() {
    info "正在同步代码到 ${REMOTE_HOST}:${REMOTE_WEBSITE_DIR} ..."
    eval "${RSYNC_CMD} ${LOCAL_WEBSITE_DIR}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_WEBSITE_DIR}/"
    
    info "正在同步资源配置到 ${REMOTE_HOST}:${REMOTE_ASSET_DIR} ..."
    eval "${RSYNC_CMD} ${LOCAL_ASSET_DIR}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_ASSET_DIR}/"
    
    info "所有代码与配置同步完成"
}

# ---- Step 2: 远程构建 Docker 镜像 ----
build_image() {
    info "正在远程构建 Docker 镜像 [${IMAGE_NAME}] ..."
    eval ${SSH_CMD} "'cd ${REMOTE_WEBSITE_DIR} && podman build -t ${IMAGE_NAME} .'"
    info "镜像构建成功"
}

# ---- Step 3: 重启容器并挂载配置卷 ----
restart_container() {
    info "正在重启容器 [${CONTAINER_NAME}] ..."
    eval ${SSH_CMD} "'
        podman rm -f ${CONTAINER_NAME} 2>/dev/null || true
        podman run -d --network=host -v ${REMOTE_ASSET_DIR}:/asset:ro --name ${CONTAINER_NAME} ${IMAGE_NAME}
    '"

    # 配置 iptables 端口转发 (80 -> 3000)
    if [ "${PUBLIC_PORT}" != "${LISTEN_PORT}" ]; then
        info "配置端口转发 ${PUBLIC_PORT} -> ${LISTEN_PORT} ..."
        eval ${SSH_CMD} "'
            iptables -t nat -D PREROUTING -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT} 2>/dev/null || true
            iptables -t nat -D OUTPUT -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT} 2>/dev/null || true
            iptables -t nat -A PREROUTING -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT}
            iptables -t nat -A OUTPUT -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT}
        '"
    fi
    info "容器已启动"
}

# ---- Step 4: 健康检查 ----
health_check() {
    info "等待服务启动 ..."
    sleep 3
    local status
    status=$(eval ${SSH_CMD} "'curl -s -o /dev/null -w \"%{http_code}\" http://127.0.0.1:${LISTEN_PORT}'" 2>/dev/null)
    if [ "${status}" = "200" ]; then
        info "健康检查通过 ✅"
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  部署成功！访问地址:${NC}"
        echo -e "${GREEN}  http://${REMOTE_HOST}${NC}"
        echo -e "${GREEN}========================================${NC}"
    else
        warn "健康检查未通过 (HTTP ${status})，请检查容器日志:"
        eval ${SSH_CMD} "'podman logs --tail 20 ${CONTAINER_NAME}'"
    fi
}

# ---- 主流程 ----
main() {
    echo ""
    echo "╔══════════════════════════════════════╗"
    echo "║   云路复材官网 · 一键部署            ║"
    echo "╚══════════════════════════════════════╝"
    echo ""

    check_deps
    sync_code
    build_image
    restart_container
    health_check
}

main "$@"
