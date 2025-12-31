# 🚀 Guide de Déploiement sur Hostinger

Ce guide vous explique comment déployer la plateforme Lesigne sur Hostinger.

## 📋 Prérequis

- Compte Hostinger avec accès SSH
- Node.js 18+ installé sur le serveur
- PostgreSQL installé et configuré
- Nginx installé
- PM2 installé globalement (`npm install -g pm2`)
- Domaine configuré (ex: `votre-domaine.com`)

## 🔧 Configuration Initiale

### 1. Connexion SSH

```bash
ssh votre-utilisateur@votre-serveur.com
```

### 2. Préparation de l'Environnement

```bash
# Créer le répertoire de l'application
mkdir -p /home/votre-utilisateur/lesigne
cd /home/votre-utilisateur/lesigne

# Cloner le repository
git clone https://github.com/votre-username/lesigne.git .

# OU transférer les fichiers via FTP/SFTP
```

### 3. Installation des Dépendances

```bash
cd Lesignes

# Installer toutes les dépendances
npm run install:all

# OU manuellement :
cd server && npm install --production
cd ../user-panel && npm install
cd ../admin-panel && npm install
```

### 4. Configuration de la Base de Données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE lesigne_db;
CREATE USER lesigne_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE lesigne_db TO lesigne_user;
\q

# Exécuter le schéma
cd server
psql -U lesigne_user -d lesigne_db -h localhost < database/schema.sql

# Exécuter les migrations si nécessaire
psql -U lesigne_user -d lesigne_db -h localhost < database/migration_subscription_payments.sql
```

### 5. Configuration des Variables d'Environnement

```bash
# Backend
cd server
cp .env.example .env
nano .env  # Éditer avec vos valeurs

# User Panel
cd ../user-panel
cp .env.example .env.production
nano .env.production

# Admin Panel
cd ../admin-panel
cp .env.example .env.production
nano .env.production
```

**Important :** Modifiez au minimum :
- `JWT_SECRET` : Générez un secret fort (ex: `openssl rand -base64 32`)
- `DB_PASSWORD` : Mot de passe de la base de données
- `FRONTEND_URL` : Votre domaine
- `VITE_API_URL` : URL de votre API backend

### 6. Créer le Dossier Uploads

```bash
cd server
mkdir -p uploads/payment-proofs
chmod -R 755 uploads
```

## 🏗️ Build des Applications

```bash
cd Lesignes

# Build User Panel
cd user-panel
npm run build

# Build Admin Panel
cd ../admin-panel
npm run build
```

## 🔄 Configuration PM2

### Créer le fichier de configuration PM2

```bash
cd Lesignes
nano ecosystem.config.js
```

Copiez le contenu du fichier `ecosystem.config.js` (voir ci-dessous).

### Démarrer les Applications

```bash
# Démarrer tous les services
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées
```

## 🌐 Configuration Nginx

### Créer la Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/lesigne
```

Copiez la configuration Nginx (voir `nginx.conf` ci-dessous).

### Activer le Site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/lesigne /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 🔒 Configuration SSL (Let's Encrypt)

```bash
# Installer Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d api.votre-domaine.com -d app.votre-domaine.com -d admin.votre-domaine.com

# Le renouvellement automatique est configuré par défaut
```

## 📊 Vérification

### Vérifier que tout fonctionne

1. **Backend API** : `https://api.votre-domaine.com`
2. **User Panel** : `https://app.votre-domaine.com`
3. **Admin Panel** : `https://admin.votre-domaine.com`

### Commandes Utiles

```bash
# Voir les logs PM2
pm2 logs

# Redémarrer les services
pm2 restart all

# Arrêter les services
pm2 stop all

# Voir le statut
pm2 status

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔄 Mises à Jour

```bash
cd /home/votre-utilisateur/lesigne/Lesignes

# Pull les dernières modifications
git pull

# Rebuild les frontends
cd user-panel && npm run build
cd ../admin-panel && npm run build

# Redémarrer avec PM2
pm2 restart all
```

## 🗄️ Backup de la Base de Données

### Script de Backup Automatique

Créez un script de backup :

```bash
nano /home/votre-utilisateur/backup-lesigne.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/votre-utilisateur/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="lesigne_db"
DB_USER="lesigne_user"

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/lesigne_$DATE.sql

# Garder seulement les 7 derniers backups
ls -t $BACKUP_DIR/lesigne_*.sql | tail -n +8 | xargs rm -f

echo "Backup créé : $BACKUP_DIR/lesigne_$DATE.sql"
```

```bash
chmod +x /home/votre-utilisateur/backup-lesigne.sh

# Ajouter au crontab (backup quotidien à 2h du matin)
crontab -e
# Ajouter : 0 2 * * * /home/votre-utilisateur/backup-lesigne.sh
```

## 🐛 Dépannage

### Problèmes Courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier quel processus utilise le port
   sudo lsof -i :5000
   # Tuer le processus si nécessaire
   ```

2. **Erreur de connexion à la base de données**
   - Vérifier que PostgreSQL est démarré : `sudo systemctl status postgresql`
   - Vérifier les credentials dans `.env`
   - Vérifier que l'utilisateur a les bonnes permissions

3. **Erreurs 502 Bad Gateway**
   - Vérifier que PM2 est démarré : `pm2 status`
   - Vérifier les logs : `pm2 logs`
   - Vérifier la configuration Nginx

4. **Fichiers uploads non accessibles**
   - Vérifier les permissions : `chmod -R 755 uploads`
   - Vérifier que le chemin dans Nginx est correct

## 📞 Support

Pour toute question ou problème, consultez :
- Logs PM2 : `pm2 logs`
- Logs Nginx : `/var/log/nginx/error.log`
- Logs système : `journalctl -u nginx`

