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

# 清理 Windows 换行符 (\r)，防止 Windows 编辑后脚本变量末尾带 \r 导致 SSH 报错
REMOTE_HOST=$(echo "$REMOTE_HOST" | tr -d '\r')
REMOTE_USER=$(echo "$REMOTE_USER" | tr -d '\r')
REMOTE_PASS=$(echo "$REMOTE_PASS" | tr -d '\r')

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
    HAS_RSYNC=true
    HAS_SSHPASS=true

    if ! command -v rsync >/dev/null 2>&1; then
        HAS_RSYNC=false
        warn "未检测到 rsync，将自动切换为 tar 打包 + scp 传输模式（Windows/Git Bash 环境推荐）"
    fi

    if ! command -v sshpass >/dev/null 2>&1; then
        HAS_SSHPASS=false
        warn "未检测到 sshpass，将使用标准 ssh/scp 认证（如未配置免密登录，需手动输入密码。提示：.dev 中密码为 ${REMOTE_PASS}）"
    fi
}

# ---- 初始化指令 ----
setup_commands() {
    if [ "$HAS_SSHPASS" = true ] && [ -n "${REMOTE_PASS}" ]; then
        SSH_CMD="sshpass -p '${REMOTE_PASS}' ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
        SCP_CMD="sshpass -p '${REMOTE_PASS}' scp -o StrictHostKeyChecking=no"
        RSYNC_CMD="sshpass -p '${REMOTE_PASS}' rsync -avz --delete \
            --exclude='node_modules' \
            --exclude='.next' \
            --exclude='.git' \
            --exclude='.DS_Store' \
            -e 'ssh -o StrictHostKeyChecking=no'"
    else
        SSH_CMD="ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
        SCP_CMD="scp -o StrictHostKeyChecking=no"
        RSYNC_CMD="rsync -avz --delete \
            --exclude='node_modules' \
            --exclude='.next' \
            --exclude='.git' \
            --exclude='.DS_Store' \
            -e 'ssh -o StrictHostKeyChecking=no'"
    fi
}

# ---- Step 1: 同步代码与配置到远程服务器 ----
sync_code() {
    if [ "$HAS_RSYNC" = true ]; then
        info "正在通过 rsync 同步代码到 ${REMOTE_HOST}:${REMOTE_WEBSITE_DIR} ..."
        eval "${RSYNC_CMD} ${LOCAL_WEBSITE_DIR}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_WEBSITE_DIR}/"
        
        info "正在通过 rsync 同步资源配置到 ${REMOTE_HOST}:${REMOTE_ASSET_DIR} ..."
        eval "${RSYNC_CMD} ${LOCAL_ASSET_DIR}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_ASSET_DIR}/"
    else
        info "正在本地打包代码与资源 (tar) ..."
        
        TEMP_DIR="$(dirname "$0")/scratch/deploy_temp"
        mkdir -p "${TEMP_DIR}"
        
        local website_tar="${TEMP_DIR}/website.tar.gz"
        local asset_tar="${TEMP_DIR}/asset.tar.gz"
        
        info "打包 website ..."
        tar -czf "${website_tar}" -C "${LOCAL_WEBSITE_DIR}" --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude=".DS_Store" .
        
        info "打包 asset ..."
        tar -czf "${asset_tar}" -C "${LOCAL_ASSET_DIR}" .
        
        info "正在远程创建目录 ..."
        eval ${SSH_CMD} "'mkdir -p ${REMOTE_WEBSITE_DIR} ${REMOTE_ASSET_DIR}'"
        
        info "正在上传并解压代码到 ${REMOTE_HOST}:${REMOTE_WEBSITE_DIR} ..."
        eval "${SCP_CMD} '${website_tar}' '${REMOTE_USER}@${REMOTE_HOST}:/tmp/website.tar.gz'"
        eval ${SSH_CMD} "'
            rm -rf ${REMOTE_WEBSITE_DIR}
            mkdir -p ${REMOTE_WEBSITE_DIR}
            tar -xzf /tmp/website.tar.gz -C ${REMOTE_WEBSITE_DIR}
            rm -f /tmp/website.tar.gz
        '"
        
        info "正在上传并解压资源配置到 ${REMOTE_HOST}:${REMOTE_ASSET_DIR} ..."
        eval "${SCP_CMD} '${asset_tar}' '${REMOTE_USER}@${REMOTE_HOST}:/tmp/asset.tar.gz'"
        eval ${SSH_CMD} "'
            rm -rf ${REMOTE_ASSET_DIR}
            mkdir -p ${REMOTE_ASSET_DIR}
            tar -xzf /tmp/asset.tar.gz -C ${REMOTE_ASSET_DIR}
            rm -f /tmp/asset.tar.gz
        '"
        
        # 清理本地临时文件
        rm -rf "${TEMP_DIR}"
    fi
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
    setup_commands
    sync_code
    build_image
    restart_container
    health_check
}

main "$@"
