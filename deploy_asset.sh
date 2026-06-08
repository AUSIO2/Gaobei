#!/bin/bash
# ============================================================
# 云路复材官网 - 仅部署静态资源脚本
# 用法: ./deploy_asset.sh
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

# ---- 配置区 ----
REMOTE_ASSET_DIR="/root/asset"
LOCAL_ASSET_DIR="$(cd "$(dirname "$0")/asset" && pwd)"

# ---- 前置检查 ----
check_deps() {
    HAS_RSYNC=true
    HAS_SSHPASS=true

    if ! command -v rsync >/dev/null 2>&1; then
        HAS_RSYNC=false
        warn "未检测到 rsync，将自动切换为 tar 打包 + scp 传输模式"
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
            --exclude='inquiries' \
            --exclude='.DS_Store' \
            -e 'ssh -o StrictHostKeyChecking=no'"
    else
        SSH_CMD="ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST}"
        SCP_CMD="scp -o StrictHostKeyChecking=no"
        RSYNC_CMD="rsync -avz --delete \
            --exclude='inquiries' \
            --exclude='.DS_Store' \
            -e 'ssh -o StrictHostKeyChecking=no'"
    fi
}

# ---- 同步资源配置到远程服务器 ----
sync_assets() {
    if [ "$HAS_RSYNC" = true ]; then
        info "正在通过 rsync 增量同步资源到 ${REMOTE_HOST}:${REMOTE_ASSET_DIR} (已排除 inquiries 目录) ..."
        eval "${RSYNC_CMD} ${LOCAL_ASSET_DIR}/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_ASSET_DIR}/"
    else
        info "正在本地打包资源 (tar) (已排除 inquiries 目录) ..."
        
        TEMP_DIR="$(dirname "$0")/scratch/deploy_temp"
        mkdir -p "${TEMP_DIR}"
        
        local asset_tar="${TEMP_DIR}/asset.tar.gz"
        
        # 打包本地资源，排除 inquiries 目录和 .DS_Store
        tar -czf "${asset_tar}" -C "${LOCAL_ASSET_DIR}" --exclude="inquiries" --exclude=".DS_Store" .
        
        info "正在上传并解压资源到 ${REMOTE_HOST}:${REMOTE_ASSET_DIR} (保留 inquiries 目录) ..."
        eval "${SCP_CMD} '${asset_tar}' '${REMOTE_USER}@${REMOTE_HOST}:/tmp/asset.tar.gz'"
        
        # 在远程端清理旧资源，但保留 inquiries 文件夹中的用户提交数据
        eval ${SSH_CMD} "'
            mkdir -p ${REMOTE_ASSET_DIR}
            find ${REMOTE_ASSET_DIR} -mindepth 1 -maxdepth 1 ! -name \"inquiries\" -exec rm -rf {} +
            tar -xzf /tmp/asset.tar.gz -C ${REMOTE_ASSET_DIR}
            rm -f /tmp/asset.tar.gz
        '"
        
        # 清理本地临时文件
        rm -rf "${TEMP_DIR}"
    fi
    info "资源同步完成"
}

# ---- 主流程 ----
main() {
    echo ""
    echo "╔══════════════════════════════════════╗"
    echo "║   云路复材官网 · 仅部署资源文件      ║"
    echo "╚══════════════════════════════════════╝"
    echo ""

    check_deps
    setup_commands
    sync_assets

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  资源部署成功！无需重启容器，更改已生效。${NC}"
    echo -e "${GREEN}  访问地址: http://${REMOTE_HOST}${NC}"
    echo -e "${GREEN}========================================${NC}"
}

main "$@"
