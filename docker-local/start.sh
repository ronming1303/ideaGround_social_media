#!/bin/bash

echo "========================================"
echo "   ideaGround Local - Starting..."
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "Docker is running. Starting ideaGround..."
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Start the containers
docker-compose -f docker-compose.local.yml up --build -d

echo ""
echo "========================================"
echo "   ideaGround is starting up..."
echo "========================================"
echo ""
echo "Please wait 30 seconds for all services to initialize."
sleep 30

# Open browser (works on Mac and Linux)
if command -v open > /dev/null; then
    open http://localhost:3000
elif command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
fi

echo ""
echo "========================================"
echo "   ideaGround is ready!"
echo "========================================"
echo ""
echo "Access the app at: http://localhost:3000"
echo ""
echo "Default logins:"
echo "  Admin: admin@ideaground.local / admin123"
echo "  User:  demo@ideaground.local / demo123"
echo ""
echo "To stop: Run ./stop.sh or press Ctrl+C"
echo ""
