#!/bin/bash
# Script de déploiement rapide pour Fly.io
# Usage: ./deploy-fly.sh

set -e

echo "🚀 Déploiement Lesigne sur Fly.io"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si fly CLI est installé
if ! command -v fly &> /dev/null; then
    echo -e "${RED}❌ Fly CLI n'est pas installé${NC}"
    echo "Installez-le avec: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Vérifier si l'utilisateur est connecté
if ! fly auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vous n'êtes pas connecté à Fly.io${NC}"
    echo "Connectez-vous avec: fly auth login"
    exit 1
fi

read -p "Nom de l'app backend (default: lesigne-api): " BACKEND_APP
BACKEND_APP=${BACKEND_APP:-lesigne-api}

read -p "Nom de l'app user-panel (default: lesigne-user-panel): " USER_APP
USER_APP=${USER_APP:-lesigne-user-panel}

read -p "Nom de l'app admin-panel (default: lesigne-admin-panel): " ADMIN_APP
ADMIN_APP=${ADMIN_APP:-lesigne-admin-panel}

read -p "URL de l'API backend (ex: https://${BACKEND_APP}.fly.dev): " API_URL
API_URL=${API_URL:-https://${BACKEND_APP}.fly.dev}

echo ""
echo -e "${GREEN}📦 Déploiement du backend...${NC}"
cd server

# Créer fly.toml si nécessaire
if [ ! -f fly.toml ]; then
    if [ -f fly.toml.example ]; then
        cp fly.toml.example fly.toml
        sed -i "s/lesigne-api/${BACKEND_APP}/g" fly.toml
    else
        fly launch --no-deploy --name $BACKEND_APP
    fi
fi

# Déployer le backend
fly deploy --app $BACKEND_APP

echo ""
echo -e "${GREEN}📦 Déploiement du user-panel...${NC}"
cd ../user-panel

if [ ! -f fly.toml ]; then
    if [ -f fly.toml.example ]; then
        cp fly.toml.example fly.toml
        sed -i "s/lesigne-user-panel/${USER_APP}/g" fly.toml
    else
        fly launch --no-deploy --name $USER_APP
    fi
fi

fly deploy --app $USER_APP --build-arg VITE_API_URL=${API_URL}/api

echo ""
echo -e "${GREEN}📦 Déploiement de l'admin-panel...${NC}"
cd ../admin-panel

if [ ! -f fly.toml ]; then
    if [ -f fly.toml.example ]; then
        cp fly.toml.example fly.toml
        sed -i "s/lesigne-admin-panel/${ADMIN_APP}/g" fly.toml
    else
        fly launch --no-deploy --name $ADMIN_APP
    fi
fi

fly deploy --app $ADMIN_APP --build-arg VITE_API_URL=${API_URL}/api

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo "URLs de vos applications:"
echo "  Backend API: ${API_URL}"
echo "  User Panel: https://${USER_APP}.fly.dev"
echo "  Admin Panel: https://${ADMIN_APP}.fly.dev"
echo ""
echo "N'oubliez pas de:"
echo "  1. Configurer les secrets avec: fly secrets set KEY=value -a ${BACKEND_APP}"
echo "  2. Créer une base de données PostgreSQL si nécessaire"
echo "  3. Mettre à jour les URLs dans les variables d'environnement"

