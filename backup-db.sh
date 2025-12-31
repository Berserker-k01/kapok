#!/bin/bash

# Script de backup de la base de données
# Usage: ./backup-db.sh

set -e

# Configuration
BACKUP_DIR="${HOME}/backups/lesigne"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-lesigne_db}"
DB_USER="${DB_USER:-lesigne_user}"
DB_HOST="${DB_HOST:-localhost}"

# Créer le dossier de backup
mkdir -p "$BACKUP_DIR"

# Nom du fichier de backup
BACKUP_FILE="$BACKUP_DIR/lesigne_$DATE.sql"

echo "📦 Création du backup de la base de données..."

# Créer le backup
PGPASSWORD="${DB_PASSWORD}" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

# Compresser le backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup créé: $BACKUP_FILE"

# Garder seulement les 7 derniers backups
echo "🧹 Nettoyage des anciens backups..."
ls -t "$BACKUP_DIR"/lesigne_*.sql.gz | tail -n +8 | xargs rm -f

echo "✅ Backup terminé!"

# Optionnel: Envoyer le backup vers un stockage externe
# Exemple avec S3, FTP, etc.

