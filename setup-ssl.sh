#!/bin/bash
# ============================================
# Script de configuration SSL Let's Encrypt
# Usage: ./setup-ssl.sh votre-domaine.com
# ============================================

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Usage: ./setup-ssl.sh votre-domaine.com"
    exit 1
fi

echo "🔒 Configuration SSL pour: $DOMAIN"
echo ""

# 1. Mettre à jour la config Nginx avec le domaine
echo "📝 Mise à jour de la configuration Nginx..."
sed -i "s/server_name _;/server_name $DOMAIN;/g" nginx/conf.d/default.conf
sed -i "s/votre-domaine.com/$DOMAIN/g" nginx/conf.d/default.conf

# 2. Redémarrer Nginx en HTTP pour la validation
docker compose restart nginx

# 3. Obtenir le certificat
echo "📋 Obtention du certificat SSL..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@$DOMAIN \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# 4. Activer HTTPS dans Nginx
echo "🔧 Activation HTTPS..."
# Décommenter les lignes SSL
sed -i 's/# listen 443 ssl http2;/listen 443 ssl http2;/' nginx/conf.d/default.conf
sed -i 's/# ssl_certificate /ssl_certificate /' nginx/conf.d/default.conf
sed -i 's/# ssl_certificate_key /ssl_certificate_key /' nginx/conf.d/default.conf
sed -i 's/# include \/etc\/letsencrypt/include \/etc\/letsencrypt/' nginx/conf.d/default.conf
sed -i 's/# ssl_dhparam /ssl_dhparam /' nginx/conf.d/default.conf

# Décommenter la redirection HTTP → HTTPS
sed -i '/# server {/{n;s/# //}' nginx/conf.d/default.conf

# 5. Redémarrer
docker compose restart nginx

echo ""
echo "✅ SSL configuré pour https://$DOMAIN"
echo "📝 Le certificat sera renouvelé automatiquement par Certbot."

