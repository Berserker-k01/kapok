#!/bin/bash

# Script de déploiement complet pour Hostinger
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de Lesigne sur Hostinger..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    error "Ce script doit être exécuté depuis le dossier Lesignes/"
    exit 1
fi

info "Étape 1: Installation des dépendances..."
npm run install:all

info "Étape 2: Build des applications frontend..."
npm run build:all

info "Étape 3: Vérification des fichiers .env..."
if [ ! -f "server/.env" ]; then
    warn "Fichier server/.env non trouvé. Création depuis .env.example..."
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        warn "⚠️  N'oubliez pas de configurer server/.env avec vos vraies valeurs!"
    else
        error "Fichier server/.env.example non trouvé!"
        exit 1
    fi
fi

if [ ! -f "user-panel/.env" ]; then
    warn "Fichier user-panel/.env non trouvé. Création depuis .env.example..."
    if [ -f "user-panel/.env.example" ]; then
        cp user-panel/.env.example user-panel/.env
    fi
fi

if [ ! -f "admin-panel/.env" ]; then
    warn "Fichier admin-panel/.env non trouvé. Création depuis .env.example..."
    if [ -f "admin-panel/.env.example" ]; then
        cp admin-panel/.env.example admin-panel/.env
    fi
fi

info "Étape 4: Création des dossiers nécessaires..."
mkdir -p server/logs
mkdir -p server/uploads/payment-proofs

info "Étape 5: Configuration des permissions..."
chmod 755 server/uploads
chmod 755 server/uploads/payment-proofs

info "✅ Déploiement terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez les fichiers .env avec vos vraies valeurs"
echo "2. Initialisez la base de données: psql -U votre_user -d lesigne_db -f server/database/schema.sql"
echo "3. Démarrez le serveur: cd server && ./start.sh"
echo "4. Configurez Apache/Nginx pour servir les fichiers statiques"
echo ""
echo "📖 Consultez DEPLOYMENT_HOSTINGER.md pour plus de détails"
