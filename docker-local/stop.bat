@echo off
echo Stopping ideaGround...
cd /d "%~dp0"
docker-compose -f docker-compose.local.yml down
echo ideaGround stopped.
pause
