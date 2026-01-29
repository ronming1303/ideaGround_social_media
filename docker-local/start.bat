@echo off
echo ========================================
echo    ideaGround Local - Starting...
echo ========================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running. Starting ideaGround...
echo.

:: Navigate to docker-local directory
cd /d "%~dp0"

:: Start the containers
docker-compose -f docker-compose.local.yml up --build -d

echo.
echo ========================================
echo    ideaGround is starting up...
echo ========================================
echo.
echo Please wait 30 seconds for all services to initialize.
echo.
timeout /t 30 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo    ideaGround is ready!
echo ========================================
echo.
echo Access the app at: http://localhost:3000
echo.
echo Default logins:
echo   Admin: admin@ideaground.local / admin123
echo   User:  demo@ideaground.local / demo123
echo.
echo To stop: Run stop.bat or press Ctrl+C
echo.
pause
