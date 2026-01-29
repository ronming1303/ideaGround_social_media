#!/bin/bash

# Backup ideaGround MongoDB data
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/ideaground_backup_$TIMESTAMP.gz"

mkdir -p "$BACKUP_DIR"

echo "Creating backup of ideaGround database..."
docker exec ideaground-mongodb mongodump --db=ideaground --archive --gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Backup failed!"
    exit 1
fi
