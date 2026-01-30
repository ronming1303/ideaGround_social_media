@echo off
echo ==========================================
echo   ideaGround Local - Starting...
echo ==========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running. Building and starting containers...
echo This may take a few minutes on first run.
echo.

cd /d "%~dp0.."
docker-compose -f docker-local/docker-compose.local.yml up --build

pause
