@echo off
REM Tiger Head World Cup - Local Dev Launcher
REM This script calls PowerShell to avoid encoding issues

cd /d "%~dp0"

where powershell >nul 2>&1
if errorlevel 1 (
    echo [ERR] PowerShell not found. Please install PowerShell or run start-local.ps1 manually.
    pause
    exit /b 1
)

powershell -ExecutionPolicy Bypass -File "start-local.ps1"

pause
