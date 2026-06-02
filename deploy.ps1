# ============================================================
# 云路复材官网 - Windows 一键部署脚本 (PowerShell 版)
# 用法: .\deploy.ps1
# ============================================================

# 发生错误时停止执行
$ErrorActionPreference = "Stop"

# ---- Helper Functions for Output ----
function Write-Info {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
    Exit 1
}

Write-Host ""
Write-Host "╔══════════════════════════════════════╗"
Write-Host "║   云路复材官网 · Windows 部署        ║"
Write-Host "╚══════════════════════════════════════╝"
Write-Host ""

# ---- 密钥配置加载 ----
$DEV_CONFIG_FILE = "$PSScriptRoot\.dev"
if (Test-Path $DEV_CONFIG_FILE) {
    Get-Content $DEV_CONFIG_FILE | ForEach-Object {
        # 匹配 key = value 格式，并移除可能的引号
        if ($_ -match "^\s*([^#=]+)\s*=\s*(.*)$") {
            $key = $Matches[1].Trim()
            $val = $Matches[2].Trim()
            # 剥除两侧单/双引号
            $val = $val -replace "^['`"]|['`"]$" , ""
            Set-Variable -Name $key -Value $val -Scope Script
        }
    }
} else {
    Write-Err "找不到密钥配置文件 .dev，请在项目根目录下创建该文件并配置 REMOTE_HOST, REMOTE_USER 和 REMOTE_PASS。"
}

# 验证配置
if (-not $REMOTE_HOST -or -not $REMOTE_USER) {
    Write-Err "请确保 .dev 文件中配置了 REMOTE_HOST 和 REMOTE_USER。"
}

# ---- 配置区（按需修改） ----
$REMOTE_WEBSITE_DIR = "/root/website"
$REMOTE_ASSET_DIR = "/root/asset"
$LOCAL_WEBSITE_DIR = "$PSScriptRoot\website"
$LOCAL_ASSET_DIR = "$PSScriptRoot\asset"
$IMAGE_NAME = "yunlu-website"
$CONTAINER_NAME = "yunlu-website-app"
$LISTEN_PORT = 3000        # 容器内 Next.js 端口
$PUBLIC_PORT = 80           # 对外暴露端口

# ---- 前置检查 ----
if (-not (Get-Command ssh -ErrorAction SilentlyContinue) -or -not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Err "未检测到 ssh/scp 命令。请确保 Windows 的 OpenSSH 客户端功能已启用。"
}

if (-not (Get-Command tar -ErrorAction SilentlyContinue)) {
    Write-Err "未检测到 tar 命令。请确保系统环境支持 tar (Windows 10/11 默认自带)。"
}

if ($REMOTE_PASS) {
    Write-Warn "提示：在 Windows (PowerShell) 下部署，如果未配置 SSH 免密登录，您将需要在上传时手动输入密码。"
    Write-Warn "您的 .dev 密码为: ${REMOTE_PASS} (可复制备用)"
}

# ---- Step 1: 本地打包与上传 ----
Write-Info "正在本地创建临时打包目录..."
$TEMP_DIR = "$PSScriptRoot\scratch\deploy_temp"
if (-not (Test-Path $TEMP_DIR)) {
    New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null
}

$website_tar = "$TEMP_DIR\website.tar.gz"
$asset_tar = "$TEMP_DIR\asset.tar.gz"

Write-Info "正在打包 website 目录..."
# Windows 下的 tar.exe 默认支持 --exclude
& tar.exe -czf $website_tar -C $LOCAL_WEBSITE_DIR --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude=".DS_Store" .

Write-Info "正在打包 asset 目录..."
& tar.exe -czf $asset_tar -C $LOCAL_ASSET_DIR .

Write-Info "正在上传打包文件到远程服务器 /tmp 目录 (若提示输入密码，请输入上面的密码)..."
& scp.exe -o StrictHostKeyChecking=no $website_tar "${REMOTE_USER}@${REMOTE_HOST}:/tmp/website.tar.gz"
& scp.exe -o StrictHostKeyChecking=no $asset_tar "${REMOTE_USER}@${REMOTE_HOST}:/tmp/asset.tar.gz"

# 清理本地临时文件
Remove-Item -Path $TEMP_DIR -Recurse -Force -ErrorAction SilentlyContinue

# ---- Step 2: 远程解压与执行部署 ----
Write-Info "正在远程解压代码并重启容器 (若提示输入密码，请输入上面的密码)..."

$remote_commands = @"
mkdir -p ${REMOTE_WEBSITE_DIR} ${REMOTE_ASSET_DIR}

rm -rf ${REMOTE_WEBSITE_DIR}
mkdir -p ${REMOTE_WEBSITE_DIR}
tar -xzf /tmp/website.tar.gz -C ${REMOTE_WEBSITE_DIR}
rm -f /tmp/website.tar.gz

rm -rf ${REMOTE_ASSET_DIR}
mkdir -p ${REMOTE_ASSET_DIR}
tar -xzf /tmp/asset.tar.gz -C ${REMOTE_ASSET_DIR}
rm -f /tmp/asset.tar.gz

echo "[远程] 正在构建 Docker 镜像 [${IMAGE_NAME}] ..."
cd ${REMOTE_WEBSITE_DIR}
podman build -t ${IMAGE_NAME} .

echo "[远程] 正在重启容器 [${CONTAINER_NAME}] ..."
podman rm -f ${CONTAINER_NAME} 2>/dev/null || true
podman run -d --network=host -v ${REMOTE_ASSET_DIR}:/asset:ro --name ${CONTAINER_NAME} ${IMAGE_NAME}
"@

if ($PUBLIC_PORT -ne $LISTEN_PORT) {
    $remote_commands += @"

echo "[远程] 配置端口转发 ${PUBLIC_PORT} -> ${LISTEN_PORT} ..."
iptables -t nat -D PREROUTING -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT} 2>/dev/null || true
iptables -t nat -D OUTPUT -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT} 2>/dev/null || true
iptables -t nat -A PREROUTING -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT}
iptables -t nat -A OUTPUT -p tcp --dport ${PUBLIC_PORT} -j REDIRECT --to-port ${LISTEN_PORT}
"@
}

# 执行 SSH 指令
& ssh.exe -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" $remote_commands

# ---- Step 3: 健康检查 ----
Write-Info "等待服务启动 (3秒)..."
Start-Sleep -Seconds 3

# 远程执行 curl 检查 http_code
$status = & ssh.exe -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${LISTEN_PORT}" 2>$null
if ($status) {
    $status = $status.Trim()
}

if ($status -eq "200") {
    Write-Info "健康检查通过 ✅"
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Windows 部署成功！访问地址:" -ForegroundColor Green
    Write-Host "  http://${REMOTE_HOST}" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Warn "健康检查未通过 (HTTP $status)，请检查容器日志:"
    & ssh.exe -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" "podman logs --tail 20 ${CONTAINER_NAME}"
}
