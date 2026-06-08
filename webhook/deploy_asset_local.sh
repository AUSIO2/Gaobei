#!/bin/bash
# ============================================================
# 资源部署脚本 (服务器本地执行)
# 由 Webhook 服务自动调用
# 功能: git pull asset 仓库 → 同步到 /root/asset
# ============================================================

set -e

LOG_PREFIX="[deploy_asset]"
info()  { echo "${LOG_PREFIX} [✓] $1"; }
warn()  { echo "${LOG_PREFIX} [!] $1"; }
error() { echo "${LOG_PREFIX} [✗] $1"; exit 1; }

# ---- 配置 ----
REPO_DIR="/root/repo-asset"
ASSET_DEST="/root/asset"

# ---- Step 1: 拉取最新代码 ----
info "正在拉取 asset 仓库最新代码 ..."
cd "${REPO_DIR}" || error "仓库目录不存在: ${REPO_DIR}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git fetch --depth=1 origin "${BRANCH}"
git reset --hard "origin/${BRANCH}"

# ---- Step 2: 同步 asset 到部署目录 ----
info "正在同步 asset/ → ${ASSET_DEST}/ (排除 inquiries) ..."

if command -v rsync >/dev/null 2>&1; then
    rsync -av --delete \
        --exclude='inquiries' \
        --exclude='.DS_Store' \
        --exclude='.git' \
        "${REPO_DIR}/asset/" "${ASSET_DEST}/"
else
    # fallback: 手动同步
    find "${ASSET_DEST}" -mindepth 1 -maxdepth 1 ! -name "inquiries" -exec rm -rf {} +
    cd "${REPO_DIR}/asset"
    # 复制除 inquiries 和 .DS_Store 外的所有内容
    find . -mindepth 1 -maxdepth 1 ! -name "inquiries" ! -name ".DS_Store" -exec cp -r {} "${ASSET_DEST}/" \;
fi

info "资源部署完成 ✅ (无需重启容器)"
