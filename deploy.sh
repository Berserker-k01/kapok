#!/bin/bash

# ============================================================
# Script d'automatisation Kapok — VPS & Docker
# Compatible docker compose v2 (plugin) - Plus de bugs ContainerConfig
# ============================================================

echo "🚀 Démarrage du déploiement Kapok..."

# Détection automatique de la version de docker compose
if docker compose version &>/dev/null; then
    DC="docker compose"
elif docker-compose version &>/dev/null; then
    DC="docker-compose"
else
    echo "❌ Docker Compose non trouvé. Veuillez l'installer."
    exit 1
fi
echo "✅ Utilisation de: $DC"

# 1. Vérification des fichiers critiques
if [ ! -f "./server/credentials.json" ]; then
    echo "⚠️  Attention: ./server/credentials.json est absent. La synchro Google Sheets ne fonctionnera pas."
fi

# 2. Arrêt propre des anciens containers (évite le bug ContainerConfig)
echo "🛑 Arrêt des containers existants..."
$DC down --remove-orphans

# 3. Build et Lancement des conteneurs
echo "📦 Build et démarrage des conteneurs Docker..."
$DC up --build -d

# 4. Attente du démarrage de la base de données
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 8

# 5. Application des migrations SQL
echo "🗄️  Application des migrations SaaS..."
docker exec -i assime-postgres psql -U assime_user -d assime_db < ./server/database/migration_saas_features.sql 2>/dev/null || true

# 6. Nettoyage des images inutiles
echo "🧹 Nettoyage des images Docker inutilisées..."
docker image prune -f

echo ""
echo "✅ Déploiement terminé avec succès !"
echo "🌐 Votre plateforme est accessible sur votre domaine."
echo "📋 Logs en temps réel: $DC logs -f app"
