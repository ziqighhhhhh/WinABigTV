# 虎头电池世界杯预测活动 - 本地测试启动器 (PowerShell)
# 保存为 UTF-8 with BOM

$Host.UI.RawUI.WindowTitle = "Tiger Head - 本地测试启动器"

function Write-Step($number, $text) {
    Write-Host "[$number/5] $text" -ForegroundColor Cyan
}

function Write-Ok($text) {
    Write-Host "    [OK] $text" -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host "    [WARN] $text" -ForegroundColor Yellow
}

function Write-Err($text) {
    Write-Host "    [ERR] $text" -ForegroundColor Red
}

function Write-Tip($text) {
    Write-Host "    [TIP] $text" -ForegroundColor DarkYellow
}

Clear-Host
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Tiger Head World Cup - Local Dev" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# 1. 检查项目路径
Write-Step 1 "检查项目路径..."
if (Test-Path "package.json") {
    Write-Ok "检测到项目目录"
} else {
    Write-Err "未检测到 package.json"
    Write-Host "请将脚本放在 app 目录下运行"
    Read-Host "按回车键退出"
    exit 1
}
Write-Host ""

# 2. 检查依赖
Write-Step 2 "检查依赖..."
if (Test-Path "node_modules") {
    Write-Ok "node_modules 已存在"
} else {
    Write-Warn "node_modules 不存在，正在安装依赖..."
    Write-Host "这可能需要几分钟，请耐心等待..." -ForegroundColor DarkGray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Err "依赖安装失败"
        Read-Host "按回车键退出"
        exit 1
    }
    Write-Ok "依赖安装完成"
}
Write-Host ""

# 3. 检查 .env 文件
Write-Step 3 "检查环境变量配置..."
if (Test-Path ".env") {
    Write-Ok ".env 文件已存在"
} else {
    Write-Warn ".env 文件不存在，正在创建默认配置..."
    @"
# Backend
APP_ID=tiger-head-worldcup
APP_SECRET=your-secret-key-change-me

# Database (MySQL)
# Example for XAMPP/WAMP: mysql://root:@localhost:3306/worldcup
# Example for Docker: mysql://root:password@localhost:3306/worldcup
DATABASE_URL=mysql://root:password@localhost:3306/worldcup

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Ok ".env 文件已创建"
    Write-Tip "请用文本编辑器打开 .env 文件，修改数据库配置"
}
Write-Host ""

# 4. 获取网络地址
Write-Step 4 "获取网络地址..."
Write-Host "本机可通过以下地址访问：" -ForegroundColor White
Write-Host ""
Write-Host "手机扫码 / 局域网访问：" -ForegroundColor Cyan

$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notmatch '^169\.' }
if ($ips) {
    foreach ($ip in $ips) {
        Write-Host "    http://$($ip.IPAddress):3000" -ForegroundColor Yellow
    }
} else {
    Write-Warn "未检测到局域网 IP，请检查网络连接"
}

Write-Host ""
Write-Host "本机浏览器访问：" -ForegroundColor Cyan
Write-Host "    http://localhost:3000" -ForegroundColor Yellow
Write-Host "    http://127.0.0.1:3000" -ForegroundColor Yellow
Write-Host ""

# 5. 数据库检查
Write-Step 5 "数据库检查..."
Write-Tip "请确保 MySQL 数据库已启动"

$mysql = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysql) {
    Write-Warn "未检测到 MySQL 客户端"
    Write-Host "    如果使用 XAMPP/WAMP，请手动启动 MySQL" -ForegroundColor DarkGray
    Write-Host "    如果使用 Docker，请运行：" -ForegroundColor DarkGray
    Write-Host "    docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=worldcup mysql:8" -ForegroundColor DarkGray
} else {
    Write-Ok "检测到 MySQL 客户端"
}

Write-Host ""
Write-Tip "数据库配置在 .env 文件中"
Write-Host "    DATABASE_URL=mysql://user:password@host:port/database" -ForegroundColor DarkGray
Write-Host ""
Write-Tip "首次运行需要执行迁移"
Write-Host "    npx drizzle-kit migrate" -ForegroundColor DarkGray
Write-Host ""
Write-Tip "首次运行需要 Seed 管理员"
Write-Host "    npx tsx db/seed.ts" -ForegroundColor DarkGray
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "   正在启动开发服务器..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor DarkGray
Write-Host ""

# 启动开发服务器
try {
    npm run dev
} finally {
    Write-Host ""
    Write-Host "服务器已停止" -ForegroundColor Red
    Read-Host "按回车键退出"
}
