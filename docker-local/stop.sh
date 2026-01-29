#!/bin/bash
echo "Stopping ideaGround..."
cd "$(dirname "$0")"
docker-compose -f docker-compose.local.yml down
echo "ideaGround stopped."
