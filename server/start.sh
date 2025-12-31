#!/bin/bash

# Script de démarrage pour Hostinger
# Usage: ./start.sh

echo "🚀 Démarrage de Lesigne API..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 n'est pas installé. Installation..."
    npm install -g pm2
fi

# Aller dans le dossier server
cd "$(dirname "$0")"

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé. Copiez .env.example vers .env et configurez-le."
    exit 1
fi

# Créer le dossier de logs si nécessaire
mkdir -p logs

# Démarrer avec PM2
echo "📦 Démarrage avec PM2..."
pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
pm2 save

echo "✅ Serveur démarré avec succès!"
echo "📊 Voir les logs: pm2 logs lesigne-api"
echo "📈 Voir le statut: pm2 status"

