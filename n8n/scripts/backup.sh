#!/bin/bash
# Backup Configuration
BACKUP_DIR="/opt/tkraft-automation/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR/postgres"
mkdir -p "$BACKUP_DIR/n8n"

echo "Starting Tkraft n8n backup process..."

# 1. Back up Postgres Database
docker exec n8n-postgres pg_dump -U n8n_admin n8n_db > "$BACKUP_DIR/postgres/n8n_db_$TIMESTAMP.sql"
if [ $? -eq 0 ]; then
    echo "Postgres backup succeeded: $BACKUP_DIR/postgres/n8n_db_$TIMESTAMP.sql"
else
    echo "ERROR: Postgres database backup failed!"
    exit 1
fi

# 2. Back up n8n configuration data directory
tar -czf "$BACKUP_DIR/n8n/n8n_data_$TIMESTAMP.tar.gz" -C /opt/tkraft-automation/data n8n
if [ $? -eq 0 ]; then
    echo "n8n data directory backup succeeded: $BACKUP_DIR/n8n/n8n_data_$TIMESTAMP.tar.gz"
else
    echo "ERROR: n8n configuration directory backup failed!"
    exit 1
fi

# 3. Clean up historical backups exceeding retention threshold
find "$BACKUP_DIR/postgres" -type f -mtime +$RETENTION_DAYS -name "*.sql" -delete
find "$BACKUP_DIR/n8n" -type f -mtime +$RETENTION_DAYS -name "*.tar.gz" -delete

echo "Backup process completed successfully."
