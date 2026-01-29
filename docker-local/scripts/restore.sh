#!/bin/bash

# Restore ideaGround MongoDB data
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.gz>"
    echo "Example: ./restore.sh ./backups/ideaground_backup_20260125.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite existing data!"
read -p "Are you sure you want to restore from $BACKUP_FILE? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Restoring database..."
    cat "$BACKUP_FILE" | docker exec -i ideaground-mongodb mongorestore --archive --gzip --drop
    
    if [ $? -eq 0 ]; then
        echo "✅ Database restored successfully!"
    else
        echo "❌ Restore failed!"
        exit 1
    fi
else
    echo "Restore cancelled."
fi
