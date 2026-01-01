#!/bin/bash
# Backup de la base de données Lesigne
# Usage: ./backup-db.sh

BACKUP_DIR="/var/backups/lesigne"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "📦 Backup de la base de données..."

# Backup avec Docker
docker compose exec -T postgres pg_dump -U lesigne_user lesigne_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Garder seulement les 7 derniers backups
ls -t "$BACKUP_DIR"/db_*.sql.gz | tail -n +8 | xargs rm -f

echo "✅ Backup terminé: $BACKUP_DIR/db_$DATE.sql.gz"

