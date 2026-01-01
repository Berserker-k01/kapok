#!/bin/bash
# Script de déploiement automatique pour Hostinger Cloud Startup
# Usage: ./deploy-hostinger.sh

set -e

echo "🚀 Déploiement Lesigne sur Hostinger Cloud Startup"
echo "==================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier si on est root ou avec sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Ce script doit être exécuté avec sudo${NC}"
    exit 1
fi

# Variables
PROJECT_DIR="/var/www/lesigne"
DOMAIN_API=""
DOMAIN_USER=""
DOMAIN_ADMIN=""

# Demander les domaines
read -p "Domaine API (ex: api.votre-domaine.com): " DOMAIN_API
read -p "Domaine User Panel (ex: app.votre-domaine.com): " DOMAIN_USER
read -p "Domaine Admin Panel (ex: admin.votre-domaine.com): " DOMAIN_ADMIN

# Mise à jour du système
echo -e "${GREEN}📦 Mise à jour du système...${NC}"
apt update && apt upgrade -y

# Installation de Docker
if ! command -v docker &> /dev/null; then
    echo -e "${GREEN}🐳 Installation de Docker...${NC}"
    apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
else
    echo -e "${GREEN}✅ Docker déjà installé${NC}"
fi

# Installation de Git
if ! command -v git &> /dev/null; then
    echo -e "${GREEN}📥 Installation de Git...${NC}"
    apt install -y git
else
    echo -e "${GREEN}✅ Git déjà installé${NC}"
fi

# Créer le répertoire du projet
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Demander si on doit cloner le repo ou utiliser l'existant
if [ ! -d "$PROJECT_DIR/.git" ]; then
    read -p "URL du repository Git: " GIT_REPO
    if [ -z "$GIT_REPO" ]; then
        echo -e "${RED}❌ URL du repository requise${NC}"
        exit 1
    fi
    git clone $GIT_REPO .
else
    echo -e "${GREEN}✅ Repository déjà cloné, mise à jour...${NC}"
    git pull
fi

# Configuration de l'environnement
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    echo -e "${GREEN}⚙️  Configuration de l'environnement...${NC}"
    cd $PROJECT_DIR/server
    if [ -f "ENV_TEMPLATE.txt" ]; then
        cp ENV_TEMPLATE.txt .env
        echo -e "${YELLOW}⚠️  Veuillez éditer le fichier .env avant de continuer${NC}"
        echo "Appuyez sur Entrée quand vous avez terminé..."
        read
    fi
else
    echo -e "${GREEN}✅ Fichier .env existe déjà${NC}"
fi

# Build des frontends
echo -e "${GREEN}🏗️  Build des frontends...${NC}"
cd $PROJECT_DIR

# User Panel
echo "Building User Panel..."
cd user-panel
docker run --rm -v $(pwd):/app -w /app node:18-alpine sh -c "npm install && VITE_API_URL=https://${DOMAIN_API}/api npm run build"
cd ..

# Admin Panel
echo "Building Admin Panel..."
cd admin-panel
docker run --rm -v $(pwd):/app -w /app node:18-alpine sh -c "npm install && VITE_API_URL=https://${DOMAIN_API}/api npm run build"
cd ..

# Build et démarrage des services Docker
echo -e "${GREEN}🐳 Démarrage des services Docker...${NC}"
cd $PROJECT_DIR
docker compose build
docker compose up -d

# Installation de Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${GREEN}🌐 Installation de Nginx...${NC}"
    apt install -y nginx
else
    echo -e "${GREEN}✅ Nginx déjà installé${NC}"
fi

# Configuration Nginx pour l'API
echo -e "${GREEN}⚙️  Configuration Nginx...${NC}"
cat > /etc/nginx/sites-available/lesigne-api <<EOF
server {
    listen 80;
    server_name ${DOMAIN_API};

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Configuration Nginx pour User Panel
cat > /etc/nginx/sites-available/lesigne-user-panel <<EOF
server {
    listen 80;
    server_name ${DOMAIN_USER};

    root ${PROJECT_DIR}/user-panel/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Configuration Nginx pour Admin Panel
cat > /etc/nginx/sites-available/lesigne-admin-panel <<EOF
server {
    listen 80;
    server_name ${DOMAIN_ADMIN};

    root ${PROJECT_DIR}/admin-panel/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Activer les sites
ln -sf /etc/nginx/sites-available/lesigne-api /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/lesigne-user-panel /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/lesigne-admin-panel /etc/nginx/sites-enabled/

# Supprimer la config par défaut
rm -f /etc/nginx/sites-enabled/default

# Tester et redémarrer Nginx
nginx -t && systemctl restart nginx

# Configuration SSL avec Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${GREEN}🔒 Installation de Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
fi

echo -e "${GREEN}🔒 Configuration SSL...${NC}"
certbot --nginx -d ${DOMAIN_API} --non-interactive --agree-tos --email admin@${DOMAIN_API#*.} --redirect || true
certbot --nginx -d ${DOMAIN_USER} --non-interactive --agree-tos --email admin@${DOMAIN_USER#*.} --redirect || true
certbot --nginx -d ${DOMAIN_ADMIN} --non-interactive --agree-tos --email admin@${DOMAIN_ADMIN#*.} --redirect || true

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo "URLs de vos applications:"
echo "  API: https://${DOMAIN_API}"
echo "  User Panel: https://${DOMAIN_USER}"
echo "  Admin Panel: https://${DOMAIN_ADMIN}"
echo ""
echo "Commandes utiles:"
echo "  Voir les logs: docker compose logs -f"
echo "  Redémarrer: docker compose restart"
echo "  Arrêter: docker compose down"
echo "  Status: docker compose ps"

