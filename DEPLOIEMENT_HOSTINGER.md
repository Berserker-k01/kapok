# 🚀 Guide de Déploiement - Hostinger Cloud Startup

Guide complet pour déployer votre SaaS Lesigne sur Hostinger Cloud Startup (VPS managé).

> **💡 Astuce :** Utilisez le script `deploy-hostinger.sh` pour un déploiement automatique en une seule commande !

---

## 📋 Prérequis

- ✅ Accès SSH à votre VPS Hostinger Cloud Startup
- ✅ Domaine(s) configuré(s) dans Hostinger
- ✅ Accès root (connecté en tant que root directement, pas besoin de sudo)

---

## 🚀 Déploiement Rapide (Script Automatique)

Pour déployer automatiquement, utilisez le script fourni :

```bash
# Télécharger le script sur votre serveur
cd /var/www
git clone https://github.com/votre-username/lesigne.git
cd lesigne

# Rendre le script exécutable et l'exécuter
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh

# Note: Si vous êtes déjà connecté en root, pas besoin de sudo
# Si vous êtes un utilisateur normal, utilisez: sudo ./deploy-hostinger.sh
```

Le script vous guidera à travers tout le processus.

---

## 🎯 Option 1 : Docker Compose (RECOMMANDÉ)

**Avantages :**
- ✅ Isolation complète des services
- ✅ Configuration déjà prête dans le projet
- ✅ Facile à maintenir et mettre à jour
- ✅ Pas de conflit de ports

### Étape 1 : Connexion SSH

```bash
# Se connecter en tant que root (sur Hostinger Cloud Startup)
ssh root@votre-ip-hostinger

# Note: Si vous êtes connecté en root, vous n'avez pas besoin de sudo
# pour les commandes d'administration
```

### Étape 2 : Installation de Docker et Docker Compose

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer les dépendances
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le dépôt Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Vérifier l'installation
docker --version
docker compose version

# Démarrer Docker au boot
systemctl enable docker
systemctl start docker
```

### Étape 3 : Installation de Git et clonage du projet

```bash
# Installer Git si nécessaire (pas besoin de sudo si vous êtes root)
apt install -y git

# Créer un répertoire pour l'application
mkdir -p /var/www
cd /var/www

# Cloner votre repository
git clone https://github.com/votre-username/lesigne.git
cd lesigne

# Si vous utilisez un dépôt privé, configurez les credentials
# git config --global user.name "Votre Nom"
# git config --global user.email "votre@email.com"
```

### Étape 4 : Configuration de l'environnement

```bash
cd /var/www/lesigne

# Créer le fichier .env à la racine (pour Docker Compose)
cp .env.example .env
nano .env
```

**Variables essentielles à configurer dans `.env` :**

```env
# Base de données
DB_PASSWORD=GENERER_UN_MOT_DE_PASSE_SECURISE

# JWT Secret
JWT_SECRET=GENERER_UNE_CLE_SECRETE_TRES_LONGUE

# URLs de vos applications
FRONTEND_URL=https://app.votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_live_...

# OpenAI (optionnel)
OPENAI_API_KEY=sk-...
```

**Générer des mots de passe sécurisés :**

```bash
# Pour DB_PASSWORD
openssl rand -base64 32

# Pour JWT_SECRET
openssl rand -base64 64
```

**Note :** Docker Compose utilisera automatiquement ce fichier `.env` pour les variables d'environnement.

### Étape 6 : Build et démarrage des services

```bash
cd /var/www/lesigne

# Build des images Docker
docker compose build

# Démarrer tous les services
docker compose up -d

# Vérifier le statut
docker compose ps

# Voir les logs
docker compose logs -f
```

### Étape 7 : Configuration Nginx (Reverse Proxy)

```bash
# Installer Nginx
apt install -y nginx

# Créer la configuration pour l'API
nano /etc/nginx/sites-available/lesigne-api
```

**Configuration API (`/etc/nginx/sites-available/lesigne-api`) :**

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Configuration User Panel :**

```bash
nano /etc/nginx/sites-available/lesigne-user-panel
```

```nginx
server {
    listen 80;
    server_name app.votre-domaine.com;

    root /var/www/lesigne/user-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Configuration Admin Panel :**

```bash
nano /etc/nginx/sites-available/lesigne-admin-panel
```

```nginx
server {
    listen 80;
    server_name admin.votre-domaine.com;

    root /var/www/lesigne/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Activer les configurations :**

```bash
# Créer les liens symboliques
ln -s /etc/nginx/sites-available/lesigne-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/lesigne-user-panel /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/lesigne-admin-panel /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### Étape 8 : Build des frontends

```bash
cd /var/www/lesigne

# Utiliser le script de build fourni (plus simple)
chmod +x build-frontends.sh
./build-frontends.sh https://api.votre-domaine.com/api

# OU builder manuellement :

# User Panel
cd user-panel
docker run --rm -v $(pwd):/app -w /app -e VITE_API_URL=https://api.votre-domaine.com/api node:18-alpine sh -c "npm ci && npm run build"
cd ..

# Admin Panel
cd admin-panel
docker run --rm -v $(pwd):/app -w /app -e VITE_API_URL=https://api.votre-domaine.com/api node:18-alpine sh -c "npm ci && npm run build"
cd ..
```

**Important :** Remplacez `https://api.votre-domaine.com/api` par l'URL réelle de votre API backend.

### Étape 9 : Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir les certificats SSL
certbot --nginx -d api.votre-domaine.com
certbot --nginx -d app.votre-domaine.com
certbot --nginx -d admin.votre-domaine.com

# Renouvellement automatique (déjà configuré par certbot)
certbot renew --dry-run
```

### Étape 10 : Configuration du firewall

```bash
# Installer UFW si nécessaire
apt install -y ufw

# Autoriser SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Vérifier le statut
ufw status
```

### Commandes utiles Docker Compose

```bash
# Voir les logs
docker compose logs -f api
docker compose logs -f postgres

# Redémarrer un service
docker compose restart api

# Arrêter tous les services
docker compose down

# Redémarrer tous les services
docker compose restart

# Mettre à jour (après un git pull)
docker compose down
docker compose build
docker compose up -d
```

---

## 🎯 Option 2 : PM2 (Alternative sans Docker)

Si vous préférez éviter Docker, vous pouvez utiliser PM2 directement.

### Installation

```bash
# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Installer PM2 globalement
npm install -g pm2

# Installer PostgreSQL
apt install -y postgresql postgresql-contrib

# Créer la base de données
# Se connecter en tant qu'utilisateur postgres
su - postgres
psql
```

Dans PostgreSQL :

```sql
CREATE DATABASE lesigne_db;
CREATE USER lesigne_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE lesigne_db TO lesigne_user;
\q
```

### Configuration

```bash
cd /var/www/lesigne

# Installer les dépendances
cd server && npm install --production && cd ..
cd user-panel && npm install && npm run build && cd ..
cd admin-panel && npm install && npm run build && cd ..
```

### Démarrage avec PM2

```bash
cd /var/www/lesigne

# Démarrer avec ecosystem.config.js
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Exécutez la commande affichée
```

---

## 🔧 Maintenance et Mises à jour

### Mettre à jour l'application

```bash
cd /var/www/lesigne

# Sauvegarder la base de données
docker compose exec postgres pg_dump -U lesigne_user lesigne_db > backup_$(date +%Y%m%d).sql

# Récupérer les dernières modifications
git pull origin main

# Rebuild et redémarrer
docker compose down
docker compose build
docker compose up -d

# Vérifier les logs
docker compose logs -f
```

### Sauvegardes automatiques

Créer un script de sauvegarde :

```bash
nano /usr/local/bin/backup-lesigne.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/lesigne"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Sauvegarde base de données
docker compose exec -T postgres pg_dump -U lesigne_user lesigne_db > $BACKUP_DIR/db_$DATE.sql

# Sauvegarde uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/lesigne/server/uploads

# Supprimer les sauvegardes de plus de 7 jours
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
chmod +x /usr/local/bin/backup-lesigne.sh

# Ajouter au cron (sauvegarde quotidienne à 2h du matin)
crontab -e
# Ajouter: 0 2 * * * /usr/local/bin/backup-lesigne.sh
```

---

## 📊 Monitoring

### Voir les logs

```bash
# Logs Docker
docker compose logs -f

# Logs Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Utilisation des ressources
docker stats
```

### Vérifier le statut

```bash
# Services Docker
docker compose ps

# Services système
systemctl status nginx
systemctl status docker

# Espace disque
df -h

# Mémoire
free -h
```

---

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Voir les logs
docker compose logs api

# Vérifier les variables d'environnement
docker compose exec api env | grep DB_

# Tester la connexion à la base de données
docker compose exec api node -e "require('pg').Pool({host:'postgres',port:5432,user:'lesigne_user',password:'votre_mdp',database:'lesigne_db'}).connect().then(()=>console.log('OK')).catch(e=>console.error(e))"
```

### Problème de permissions

```bash
# Corriger les permissions des uploads
chmod -R 755 /var/www/lesigne/server/uploads
chown -R www-data:www-data /var/www/lesigne/server/uploads
```

### Nginx erreur 502

```bash
# Vérifier que le backend est accessible
curl http://localhost:5000/api/health

# Vérifier la configuration Nginx
nginx -t

# Voir les logs d'erreur
tail -f /var/log/nginx/error.log
```

---

## ✅ Checklist Post-Déploiement

- [ ] Docker et Docker Compose installés
- [ ] Projet cloné et configuré
- [ ] Fichier `.env` créé avec toutes les variables
- [ ] Services Docker démarrés (`docker compose ps`)
- [ ] Base de données initialisée (schéma SQL exécuté)
- [ ] Frontends buildés (dossiers `dist/` créés)
- [ ] Nginx configuré et redémarré
- [ ] SSL configuré (certificats Let's Encrypt)
- [ ] Firewall configuré
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place
- [ ] Tests de l'API fonctionnels
- [ ] Tests des frontends fonctionnels

---

## 🔗 URLs de votre application

Après le déploiement, vos applications seront accessibles sur :

- **API Backend** : `https://api.votre-domaine.com`
- **User Panel** : `https://app.votre-domaine.com`
- **Admin Panel** : `https://admin.votre-domaine.com`

---

## 💡 Astuces

1. **Performance** : Utilisez le cache Nginx pour les assets statiques
2. **Sécurité** : Configurez rate limiting dans Nginx
3. **Monitoring** : Utilisez `htop` pour surveiller les ressources
4. **Backups** : Testez la restauration de sauvegarde régulièrement

---

**Besoin d'aide ?** Consultez les logs avec `docker compose logs -f` ou contactez le support Hostinger.

