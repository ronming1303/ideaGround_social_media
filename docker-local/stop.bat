@echo off
echo ==========================================
echo   ideaGround Local - Stopping...
echo ==========================================
echo.

cd /d "%~dp0.."
docker-compose -f docker-local/docker-compose.local.yml down

echo.
echo Containers stopped successfully.
pause
