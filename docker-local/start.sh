#!/bin/bash

echo "=========================================="
echo "  ideaGround Local - Starting..."
echo "=========================================="
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "Docker is running. Building and starting containers..."
echo "This may take a few minutes on first run."
echo

cd "$(dirname "$0")/.."
docker-compose -f docker-local/docker-compose.local.yml up --build
