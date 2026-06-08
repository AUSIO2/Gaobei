#!/bin/bash
# ============================================================
# 全量部署脚本 (服务器本地执行)
# 由 Webhook 服务自动调用
# 功能: git pull code 仓库 → 同步代码+资源 → 重建镜像 → 重启容器
# ============================================================

set -e

LOG_PREFIX="[deploy_full]"
info()  { echo "${LOG_PREFIX} [✓] $1"; }
warn()  { echo "${LOG_PREFIX} [!] $1"; }
error() { echo "${LOG_PREFIX} [✗] $1"; exit 1; }

# ---- 配置 ----
REPO_DIR="/root/repo-code"
WEBSITE_DEST="/root/website"
ASSET_DEST="/root/asset"
IMAGE_NAME="yunlu-website"
CONTAINER_NAME="yunlu-website-app"
LISTEN_PORT=3000
PUBLIC_PORT=80

# ---- Step 1: 拉取最新代码 ----
info "正在拉取 code 仓库最新代码 ..."
cd "${REPO_DIR}" || error "仓库目录不存在: ${REPO_DIR}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git fetch --depth=1 origin "${BRANCH}"
git reset --hard "origin/${BRANCH}"

# ---- Step 2: 同步 website 代码 ----
info "正在同步 website/ → ${WEBSITE_DEST}/ ..."
if command -v rsync >/dev/null 2>&1; then
    rsync -av --delete \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='.DS_Store' \
        "${REPO_DIR}/website/" "${WEBSITE_DEST}/"
else
    rm -rf "${WEBSITE_DEST}"
    mkdir -p "${WEBSITE_DEST}"
    cd "${REPO_DIR}/website"
    find . -mindepth 1 -maxdepth 1 \
        ! -name "node_modules" ! -name ".next" ! -name ".git" ! -name ".DS_Store" \
        -exec cp -r {} "${WEBSITE_DEST}/" \;
fi

# ---- Step 3: 同步 asset 资源 ----
info "正在同步 asset/ → ${ASSET_DEST}/ (排除 inquiries) ..."
if command -v rsync >/dev/null 2>&1; then
    rsync -av --delete \
        --exclude='inquiries' \
        --exclude='.DS_Store' \
        --exclude='.git' \
        "${REPO_DIR}/asset/" "${ASSET_DEST}/"
else
    find "${ASSET_DEST}" -mindepth 1 -maxdepth 1 ! -name "inquiries" -exec rm -rf {} +
    cd "${REPO_DIR}/asset"
    find . -mindepth 1 -maxdepth 1 ! -name "inquiries" ! -name ".DS_Store" -exec cp -r {} "${ASSET_DEST}/" \;
fi

# ---- Step 4: 构建 Docker 镜像 ----
info "正在构建 Docker 镜像 [${IMAGE_NAME}] ..."
cd "${WEBSITE_DEST}"
podman build -t "${IMAGE_NAME}" .

# ---- Step 5: 重启容器 ----
info "正在重启容器 [${CONTAINER_NAME}] ..."
podman rm -f "${CONTAINER_NAME}" 2>/dev/null || true
podman run -d --network=host \
    -v "${ASSET_DEST}:/asset:ro" \
    --name "${CONTAINER_NAME}" \
    "${IMAGE_NAME}"

# ---- Step 6: 端口转发 ----
if [ "${PUBLIC_PORT}" != "${LISTEN_PORT}" ]; then
    info "配置端口转发 ${PUBLIC_PORT} → ${LISTEN_PORT} ..."
    iptables -t nat -D PREROUTING -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT} 2>/dev/null || true
    iptables -t nat -D OUTPUT -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT} 2>/dev/null || true
    iptables -t nat -A PREROUTING -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT}
    iptables -t nat -A OUTPUT -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT}
fi

# ---- Step 7: 健康检查 ----
info "等待服务启动 (5秒) ..."
sleep 5
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${LISTEN_PORT} 2>/dev/null)
if [ "${STATUS}" = "200" ]; then
    info "健康检查通过 ✅ 全量部署成功！"
else
    warn "健康检查未通过 (HTTP ${STATUS})，请检查容器日志:"
    podman logs --tail 20 "${CONTAINER_NAME}"
fi
