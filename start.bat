@echo off
title TimeFlux - Smart Countdown

echo.
echo  +----------------------------------------------------------+
echo  ^|                                                          ^|
echo  ^|  _____ _            _____ _                              ^|
echo  ^| ^|_   _(_)_ __ ___  ^|  ___^| ^|_   ___  __                  ^|
echo  ^|   ^| ^| ^| ^| '_ ` _ \ ^| ^|_  ^| ^| ^| ^| ^\ \/ /                  ^|
echo  ^|   ^| ^| ^| ^| ^| ^| ^| ^| ^|^|  _^| ^| ^| ^|_^| ^|^>  ^<                   ^|
echo  ^|   ^|_^| ^|_^|_^| ^|_^| ^|_^|^|_^|   ^|_^|\__,_/_/\_\                  ^|
echo  ^|                                                          ^|
echo  ^|              Smart Countdown Timer                       ^|
echo  +----------------------------------------------------------+
echo.

cd /d "%~dp0"

echo  [*] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  [X] Node.js is not installed! Please install Node.js first.
    echo      Download: https://nodejs.org/
    pause
    exit /b 1
)

echo  [OK] Node.js found.
echo.

if not exist "node_modules" (
    echo  [*] Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo  [X] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed successfully.
    echo.
)

echo  [*] Starting TimeFlux development server...
echo.
echo  ----------------------------------------------------------
echo   The application will open in your default browser.
echo   Press Ctrl+C to stop the server.
echo  ----------------------------------------------------------
echo.

call npm run dev

pause
