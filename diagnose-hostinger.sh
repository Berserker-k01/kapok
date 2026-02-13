#!/bin/bash

echo "=========================================="
echo "  DIAGNOSTIC BASE DE DONNÉES - HOSTINGER"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier PostgreSQL
echo "1️⃣  Vérification de PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL installé${NC}"
    psql --version
else
    echo -e "${RED}❌ PostgreSQL n'est pas installé${NC}"
fi
echo ""

# 2. Statut du service
echo "2️⃣  Statut du service PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL est démarré${NC}"
else
    echo -e "${RED}❌ PostgreSQL n'est pas démarré${NC}"
    echo "   Essayez: sudo systemctl start postgresql"
fi
echo ""

# 3. Port d'écoute
echo "3️⃣  Port d'écoute PostgreSQL..."
if netstat -tlnp 2>/dev/null | grep 5432 &> /dev/null || ss -tlnp 2>/dev/null | grep 5432 &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL écoute sur le port 5432${NC}"
    netstat -tlnp 2>/dev/null | grep 5432 || ss -tlnp 2>/dev/null | grep 5432
else
    echo -e "${RED}❌ PostgreSQL n'écoute pas sur le port 5432${NC}"
fi
echo ""

# 4. Configuration .env
echo "4️⃣  Configuration .env..."
if [ -f "/var/www/lesigne/server/.env" ]; then
    echo -e "${GREEN}✅ Fichier .env trouvé${NC}"
    echo "Variables DB:"
    grep "^DB_" /var/www/lesigne/server/.env | sed 's/PASSWORD=.*/PASSWORD=***/' || echo "Aucune variable DB_ trouvée"
else
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé dans /var/www/lesigne/server/${NC}"
fi
echo ""

# 5. Vérifier l'utilisateur et la base de données
echo "5️⃣  Vérification utilisateur et base de données..."
if sudo -u postgres psql -c "\du" 2>/dev/null | grep -q "lesigne_user"; then
    echo -e "${GREEN}✅ Utilisateur lesigne_user existe${NC}"
else
    echo -e "${RED}❌ Utilisateur lesigne_user n'existe pas${NC}"
fi

if sudo -u postgres psql -c "\l" 2>/dev/null | grep -q "lesigne_db"; then
    echo -e "${GREEN}✅ Base de données lesigne_db existe${NC}"
else
    echo -e "${RED}❌ Base de données lesigne_db n'existe pas${NC}"
fi
echo ""

# 6. Test de connexion
echo "6️⃣  Test de connexion avec psql..."
if [ -f "/var/www/lesigne/server/.env" ]; then
    source /var/www/lesigne/server/.env
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ Connexion réussie avec psql${NC}"
    else
        echo -e "${RED}❌ Échec de la connexion avec psql${NC}"
        echo "   Essayez manuellement: psql -h localhost -U $DB_USER -d $DB_NAME"
    fi
else
    echo -e "${YELLOW}⚠️  Impossible de tester: fichier .env introuvable${NC}"
fi
echo ""

# 7. Test avec le script Node.js
echo "7️⃣  Test avec le script Node.js..."
if [ -f "/var/www/lesigne/server/diagnose-db.js" ]; then
    cd /var/www/lesigne/server
    node diagnose-db.js
else
    echo -e "${YELLOW}⚠️  Script diagnose-db.js introuvable${NC}"
fi
echo ""

# 8. Vérifier pg_hba.conf
echo "8️⃣  Localisation pg_hba.conf..."
HBA_FILE=$(sudo find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -n 1)
if [ -n "$HBA_FILE" ]; then
    echo -e "${GREEN}✅ Fichier trouvé: $HBA_FILE${NC}"
    echo "Vérifiez que ces lignes existent pour localhost:"
    echo "   host    all    all    127.0.0.1/32    md5"
    echo "   host    all    all    ::1/128         md5"
else
    echo -e "${YELLOW}⚠️  Fichier pg_hba.conf non trouvé${NC}"
fi
echo ""

# 9. Logs récents
echo "9️⃣  Derniers logs PostgreSQL (5 dernières lignes)..."
LOG_FILE=$(sudo find /var/log/postgresql -name "*.log" 2>/dev/null | head -n 1)
if [ -n "$LOG_FILE" ]; then
    echo "Fichier: $LOG_FILE"
    sudo tail -n 5 "$LOG_FILE" 2>/dev/null || echo "Impossible de lire les logs"
else
    echo -e "${YELLOW}⚠️  Aucun fichier de log trouvé${NC}"
fi
echo ""

# 10. Statut PM2
echo "🔟 Statut PM2..."
if command -v pm2 &> /dev/null; then
    pm2 list | grep lesigne-server || echo "Application lesigne-server non trouvée dans PM2"
else
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé${NC}"
fi
echo ""

echo "=========================================="
echo "  DIAGNOSTIC TERMINÉ"
echo "=========================================="
echo ""
echo "📝 Commandes utiles:"
echo "   sudo systemctl status postgresql"
echo "   sudo systemctl start postgresql"
echo "   sudo systemctl restart postgresql"
echo "   cd /var/www/lesigne/server && node diagnose-db.js"
echo "   pm2 logs lesigne-server"



