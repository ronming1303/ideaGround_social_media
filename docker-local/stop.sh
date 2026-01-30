#!/bin/bash

echo "=========================================="
echo "  ideaGround Local - Stopping..."
echo "=========================================="
echo

cd "$(dirname "$0")/.."
docker-compose -f docker-local/docker-compose.local.yml down

echo
echo "Containers stopped successfully."
