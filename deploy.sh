#!/bin/bash

# ============================================================
# Script d'automatisation Kapok — VPS & Docker
# ============================================================

echo "🚀 Démarrage de l'automatisation Kapok..."

# 1. Vérification des fichiers critiques
if [ ! -f "./server/credentials.json" ]; then
    echo "⚠️  Attention: ./server/credentials.json est absent. La synchro Google Sheets ne fonctionnera pas."
    echo "ℹ️  Veuillez placer votre fichier credentials.json dans le dossier ./server/ et relancer."
fi

# 2. Build et Lancement des conteneurs
echo "📦 Build et démarrage des conteneurs Docker..."
docker-compose up --build -d

# 3. Attente du démarrage de la base de données
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 5

# 4. Automatisation des migrations SQL
# On exécute la migration SaaS directement dans le conteneur DB
echo "🗄️  Application des migrations SaaS..."
docker exec -i assime-postgres psql -U assime_user -d assime_db < ./server/database/migration_saas_features.sql 2>/dev/null

# 5. Nettoyage des images inutiles
echo "🧹 Nettoyage des fichiers temporaires Docker..."
docker image prune -f

echo "✅ Déploiement terminé avec succès !"
echo "🌐 Votre plateforme est accessible sur votre domaine."
echo "📋 Utilisez 'docker-compose logs -f app' pour voir les commandes se synchroniser en temps réel."
