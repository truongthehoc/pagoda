@echo off
chcp 65001 > nul
cd /d "%~dp0"
title He Thong Pagoda - Chinh Dien Tam Bao

echo ========================================================
echo     DANG KHOI CHAY HE THONG PAGODA (CHINH DIEN TAM BAO)
echo ========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Node.js tren he thong!
    echo Vui long cai dat Node.js tai: https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo [HE THONG] Dang cai dat thu vien node_modules...
    call npm.cmd install
    if errorlevel 1 (
        echo [LOI] Khong the cai dat thu vien.
        pause
        exit /b 1
    )
)

echo [HE THONG] Dang khoi dong Backend va Frontend...
echo.
node start.js %*

echo.
echo [THONG BAO] He thong da dong.
pause
