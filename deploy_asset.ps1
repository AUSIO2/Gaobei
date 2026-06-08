# ============================================================
# 云路复材官网 - Windows 仅部署静态资源脚本 (PowerShell 版)
# 用法: .\deploy_asset.ps1
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
Write-Host "║   云路复材官网 · Windows 部署资源    ║"
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

# ---- 配置区 ----
$REMOTE_ASSET_DIR = "/root/asset"
$LOCAL_ASSET_DIR = "$PSScriptRoot\asset"

# ---- 前置检查 ----
if (-not (Get-Command ssh.exe -ErrorAction SilentlyContinue) -or -not (Get-Command scp.exe -ErrorAction SilentlyContinue)) {
    Write-Err "未检测到 ssh/scp 命令。请确保 Windows 的 OpenSSH 客户端功能已启用。"
}

if (-not (Get-Command tar.exe -ErrorAction SilentlyContinue)) {
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

$asset_tar = "$TEMP_DIR\asset.tar.gz"

Write-Info "正在打包 asset 目录 (排除 inquiries 和 .DS_Store)..."
# Windows 下的 tar.exe 默认支持 --exclude
& tar.exe -czf $asset_tar -C $LOCAL_ASSET_DIR --exclude="inquiries" --exclude=".DS_Store" .

Write-Info "正在上传打包资源到远程服务器 /tmp 目录 (若提示输入密码，请输入上面的密码)..."
& scp.exe -o StrictHostKeyChecking=no $asset_tar "${REMOTE_USER}@${REMOTE_HOST}:/tmp/asset.tar.gz"

# 清理本地临时文件
Remove-Item -Path $TEMP_DIR -Recurse -Force -ErrorAction SilentlyContinue

# ---- Step 2: 远程解压与部署 ----
Write-Info "正在远程解压资源并更新目录 (保留 inquiries 目录，若提示输入密码，请再次输入)..."

$remote_commands = @"
mkdir -p ${REMOTE_ASSET_DIR}
find ${REMOTE_ASSET_DIR} -mindepth 1 -maxdepth 1 ! -name 'inquiries' -exec rm -rf {} +
tar -xzf /tmp/asset.tar.gz -C ${REMOTE_ASSET_DIR}
rm -f /tmp/asset.tar.gz
"@

# 执行 SSH 指令
& ssh.exe -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" $remote_commands

Write-Info "资源部署成功！无需重启容器，更改已生效。"
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Windows 资源部署成功！访问地址:" -ForegroundColor Green
Write-Host "  http://${REMOTE_HOST}" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
