@echo off
chcp 65001 >nul
title Tiger Head - 本地测试启动器
color 0A
setlocal enabledelayedexpansion

echo ============================================
echo   虎头电池世界杯预测活动 - 本地测试启动器
echo ============================================
echo.

REM 检查是否在 app 目录
echo [1/5] 检查项目路径...
if exist "package.json" (
    echo     [OK] 检测到项目目录
echo.
) else (
    echo     [ERR] 未检测到 package.json
    echo     请将脚本放在 app 目录下运行
    pause
    exit /b 1
)

REM 检查 node_modules
echo [2/5] 检查依赖...
if exist "node_modules" (
    echo     [OK] node_modules 已存在
) else (
    echo     [WARN] node_modules 不存在，正在安装依赖...
    echo     这可能需要几分钟，请耐心等待...
    call npm install
    if errorlevel 1 (
        echo     [ERR] 依赖安装失败
        pause
        exit /b 1
    )
    echo     [OK] 依赖安装完成
)
echo.

REM 检查 .env 文件
echo [3/5] 检查环境变量配置...
if exist ".env" (
    echo     [OK] .env 文件已存在
) else (
    echo     [WARN] .env 文件不存在，正在创建默认配置...
    echo.
    echo # ── Backend ───────────────────────────────────────────────────── > .env
    echo APP_ID=tiger-head-worldcup >> .env
    echo APP_SECRET=your-secret-key-change-me >> .env
    echo. >> .env
    echo # ── Database ─────────────────────────────────────────────────── >> .env
    echo DATABASE_URL=mysql://root:password@localhost:3306/worldcup >> .env
    echo. >> .env
    echo # ── Admin ────────────────────────────────────────────────────── >> .env
    echo ADMIN_USERNAME=admin >> .env
    echo ADMIN_PASSWORD=admin123 >> .env
    echo.
    echo     [OK] .env 文件已创建
    echo     [TIP] 请用文本编辑器打开 .env 文件，修改数据库配置
)
echo.

REM 获取本机 IP 地址
echo [4/5] 获取网络地址...
echo     本机可通过以下地址访问：
echo.
echo     手机扫码/局域网访问：

REM 使用 PowerShell 获取 IP（更可靠）
powershell -Command "Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -ne '127.0.0.1' } ^| ForEach-Object { Write-Host ('        http://' + $_.IPAddress + ':3000') }" 2>nul

REM 如果 PowerShell 命令失败，使用备用方法
if errorlevel 1 (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
        set "ip=%%a"
        set "ip=!ip:~1!"
        if not "!ip!"=="127.0.0.1" (
            echo         http://!ip!:3000
        )
    )
)

echo.
echo     本机浏览器访问：
echo         http://localhost:3000
echo         http://127.0.0.1:3000
echo.

REM 提示数据库
echo [5/5] 数据库检查...
echo     [TIP] 请确保 MySQL 数据库已启动

REM 检查 mysql 命令是否存在
where mysql >nul 2>&1
if errorlevel 1 (
    echo     [WARN] 未检测到 MySQL 客户端
    echo            如果您使用 XAMPP/WAMP，请手动启动 MySQL
    echo            如果您使用 Docker，请运行：docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=worldcup mysql:8
) else (
    echo     [OK] 检测到 MySQL 客户端
)

echo.
echo     数据库配置在 .env 文件中：
echo         DATABASE_URL=mysql://用户名:密码@主机:端口/数据库名
echo.
echo     首次运行需要执行迁移：
echo         npx drizzle-kit migrate
echo.
echo     首次运行需要 Seed 管理员：
echo         npx tsx db/seed.ts
echo.

echo ============================================
echo   正在启动开发服务器...
echo ============================================
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动开发服务器
call npm run dev

REM 如果服务器退出
echo.
echo 服务器已停止
echo.
pause
