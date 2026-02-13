#!/bin/bash
# ============================================
# Script de déploiement Assimε sur IONOS VPS Ubuntu
# Usage: ./deploy-ionos.sh
# ============================================

set -e

echo "🚀 Déploiement Assimε Platform sur IONOS VPS"
echo "=============================================="

# --- 1. Vérifier les prérequis ---
echo ""
echo "📋 Étape 1: Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installation..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installé. Vous devrez peut-être vous reconnecter."
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Installation..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

echo "✅ Docker: $(docker --version)"
echo "✅ Docker Compose: $(docker compose version 2>/dev/null || docker-compose --version)"

# --- 2. Vérifier le fichier .env ---
echo ""
echo "📋 Étape 2: Vérification de la configuration..."

if [ ! -f .env ]; then
    echo "⚠️  Fichier .env manquant ! Création depuis .env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "📝 Fichier .env créé. IMPORTANT: Éditez-le avec vos vraies valeurs !"
        echo "   nano .env"
        echo ""
        echo "   Paramètres essentiels à modifier:"
        echo "   - PGPASSWORD (mot de passe PostgreSQL)"
        echo "   - JWT_SECRET (secret JWT, long et aléatoire)"
        echo ""
        read -p "Appuyez sur Entrée après avoir édité .env, ou Ctrl+C pour annuler..."
    else
        echo "❌ Aucun fichier env.example trouvé. Créez .env manuellement."
        exit 1
    fi
fi

echo "✅ Fichier .env trouvé"

# --- 3. Construire et démarrer ---
echo ""
echo "📋 Étape 3: Construction et démarrage des conteneurs..."

# Arrêter les conteneurs existants
docker compose down 2>/dev/null || true

# Construire l'image (avec les frontends)
echo "🔨 Construction de l'image Docker (cela peut prendre quelques minutes)..."
docker compose build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker compose up -d

# --- 4. Attendre que PostgreSQL soit prêt ---
echo ""
echo "📋 Étape 4: Attente de PostgreSQL..."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U assime_user -d assime_db &>/dev/null; then
        echo "✅ PostgreSQL est prêt !"
        break
    fi
    echo "   Attente... ($i/30)"
    sleep 2
done

# --- 5. Vérifier le statut ---
echo ""
echo "📋 Étape 5: Vérification du statut..."
echo ""
docker compose ps

echo ""
echo "🔍 Logs de l'application (dernières 20 lignes):"
docker compose logs --tail=20 app

echo ""
echo "=============================================="
echo "✅ Déploiement terminé !"
echo ""
echo "📌 URLs:"
echo "   - Application: http://$(hostname -I | awk '{print $1}')"
echo "   - API Health:  http://$(hostname -I | awk '{print $1}')/api/health"
echo "   - Admin Panel: http://$(hostname -I | awk '{print $1}')/admin"
echo ""
echo "📌 Commandes utiles:"
echo "   docker compose logs -f app     # Voir les logs en temps réel"
echo "   docker compose restart app     # Redémarrer l'application"
echo "   docker compose down            # Arrêter tout"
echo "   docker compose up -d           # Redémarrer tout"
echo ""
echo "📌 Pour configurer SSL (HTTPS):"
echo "   1. Modifiez nginx/conf.d/default.conf avec votre domaine"
echo "   2. Exécutez: ./setup-ssl.sh votre-domaine.com"
echo "=============================================="

