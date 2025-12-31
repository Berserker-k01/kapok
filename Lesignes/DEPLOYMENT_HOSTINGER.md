# 🚀 Guide de Déploiement sur Hostinger

Ce guide vous explique comment déployer la plateforme Lesigne sur Hostinger.

## 📋 Prérequis

- Compte Hostinger avec accès SSH
- Node.js 18+ installé sur le serveur
- PostgreSQL installé et configuré
- PM2 installé globalement (`npm install -g pm2`)
- Accès FTP/SSH à votre serveur

## 🔧 Étape 1 : Préparation du Serveur

### 1.1 Connexion SSH

```bash
ssh votre-utilisateur@votre-serveur.hostinger.com
```

### 1.2 Installation des dépendances système

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18 (si pas déjà installé)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 globalement
sudo npm install -g pm2

# Installer PostgreSQL (si pas déjà installé)
sudo apt install postgresql postgresql-contrib -y
```

### 1.3 Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE lesigne_db;

# Créer un utilisateur
CREATE USER lesigne_user WITH PASSWORD 'votre_mot_de_passe_securise';

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE lesigne_db TO lesigne_user;

# Quitter PostgreSQL
\q
```

## 📦 Étape 2 : Upload des Fichiers

### 2.1 Préparer les fichiers localement

```bash
# Dans votre machine locale
cd Lesignes

# Installer les dépendances et builder
npm run setup:production

# Créer un fichier .zip avec tous les fichiers nécessaires
# (exclure node_modules, .git, etc.)
```

### 2.2 Upload via FTP/SSH

**Option A : Via FTP (FileZilla, WinSCP)**
- Connectez-vous à votre serveur
- Uploadez tous les fichiers dans `/home/votre-utilisateur/lesigne/`

**Option B : Via Git (recommandé)**
```bash
# Sur le serveur
cd ~
git clone https://github.com/votre-repo/lesigne.git
cd lesigne/Lesignes
```

## ⚙️ Étape 3 : Configuration

### 3.1 Variables d'environnement

```bash
# Sur le serveur, dans le dossier server/
cd server
cp .env.example .env
nano .env
```

Configurez les variables suivantes :

```env
NODE_ENV=production
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe_securise

JWT_SECRET=votre_secret_jwt_tres_securise_changez_ca

FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

### 3.2 Configuration des panels

```bash
# User Panel
cd ../user-panel
cp .env.example .env
nano .env
```

```env
VITE_API_URL=https://api.votre-domaine.com
```

```bash
# Admin Panel
cd ../admin-panel
cp .env.example .env
nano .env
```

```env
VITE_API_URL=https://api.votre-domaine.com
```

### 3.3 Initialisation de la base de données

```bash
cd ../server
psql -U lesigne_user -d lesigne_db -f database/schema.sql

# Si vous avez des migrations
psql -U lesigne_user -d lesigne_db -f database/migration_subscription_payments.sql
```

## 🏗️ Étape 4 : Build et Installation

### 4.1 Installation des dépendances

```bash
# À la racine du projet
cd ~/lesigne/Lesignes
npm run install:all
```

### 4.2 Build des applications frontend

```bash
npm run build:all
```

Cela va créer :
- `user-panel/dist/` - Application utilisateur
- `admin-panel/dist/` - Application admin

## 🚀 Étape 5 : Démarrage avec PM2

### 5.1 Créer le dossier de logs

```bash
cd server
mkdir -p logs
```

### 5.2 Démarrer le serveur

```bash
# Démarrer avec PM2
pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées
```

### 5.3 Vérifier le statut

```bash
pm2 status
pm2 logs lesigne-api
```

## 🌐 Étape 6 : Configuration Apache/Nginx

### 6.1 Configuration Apache (Hostinger utilise généralement Apache)

Le fichier `.htaccess` est déjà configuré. Assurez-vous que :

1. **mod_rewrite est activé**
```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

2. **Configuration du Virtual Host**

Créez/modifiez `/etc/apache2/sites-available/votre-domaine.conf` :

```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    ServerAlias www.votre-domaine.com
    
    DocumentRoot /home/votre-utilisateur/lesigne/Lesignes
    
    <Directory /home/votre-utilisateur/lesigne/Lesignes>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Proxy pour l'API Node.js
    ProxyPreserveHost On
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
    
    ErrorLog ${APACHE_LOG_DIR}/lesigne-error.log
    CustomLog ${APACHE_LOG_DIR}/lesigne-access.log combined
</VirtualHost>
```

Activez le site :
```bash
sudo a2ensite votre-domaine.conf
sudo systemctl reload apache2
```

### 6.2 Configuration SSL (HTTPS)

Hostinger propose généralement Let's Encrypt :

```bash
# Via le panneau Hostinger ou
sudo certbot --apache -d votre-domaine.com -d www.votre-domaine.com
```

## 📁 Étape 7 : Structure des Dossiers

Votre structure finale devrait ressembler à :

```
/home/votre-utilisateur/lesigne/Lesignes/
├── server/
│   ├── src/
│   ├── database/
│   ├── uploads/
│   ├── logs/
│   ├── .env
│   ├── ecosystem.config.js
│   └── package.json
├── user-panel/
│   ├── dist/          # Build de production
│   └── .env
├── admin-panel/
│   ├── dist/          # Build de production
│   └── .env
└── .htaccess
```

## 🔒 Étape 8 : Sécurité

### 8.1 Permissions des fichiers

```bash
# Protéger les fichiers sensibles
chmod 600 server/.env
chmod 600 user-panel/.env
chmod 600 admin-panel/.env

# Permissions pour les uploads
chmod 755 server/uploads
chmod 755 server/uploads/payment-proofs
```

### 8.2 Firewall

```bash
# Autoriser uniquement les ports nécessaires
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## ✅ Étape 9 : Vérification

### 9.1 Tester l'API

```bash
curl http://localhost:5000/
# Devrait retourner: "API Assimε est en ligne ! 🚀"
```

### 9.2 Tester les applications

- **User Panel** : `https://app.votre-domaine.com`
- **Admin Panel** : `https://admin.votre-domaine.com`
- **API** : `https://api.votre-domaine.com/api`

## 🔄 Commandes Utiles

### Gestion PM2

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs lesigne-api

# Redémarrer
pm2 restart lesigne-api

# Arrêter
pm2 stop lesigne-api

# Surveiller
pm2 monit
```

### Mise à jour

```bash
# 1. Pull les dernières modifications
git pull

# 2. Installer les nouvelles dépendances
npm run install:all

# 3. Rebuild les frontends
npm run build:all

# 4. Redémarrer le serveur
pm2 restart lesigne-api
```

### Logs

```bash
# Logs PM2
pm2 logs lesigne-api

# Logs Apache
sudo tail -f /var/log/apache2/lesigne-error.log
sudo tail -f /var/log/apache2/lesigne-access.log

# Logs application
tail -f server/logs/pm2-combined.log
```

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier les logs
pm2 logs lesigne-api --lines 50

# Vérifier que le port n'est pas utilisé
sudo netstat -tulpn | grep 5000

# Vérifier les variables d'environnement
cd server
node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
```

### Erreur de connexion à la base de données

```bash
# Tester la connexion PostgreSQL
psql -U lesigne_user -d lesigne_db -h localhost

# Vérifier que PostgreSQL écoute
sudo systemctl status postgresql
```

### Les fichiers statiques ne se chargent pas

```bash
# Vérifier les permissions
ls -la user-panel/dist/
ls -la admin-panel/dist/

# Vérifier la configuration Apache
sudo apache2ctl configtest
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs PM2 : `pm2 logs`
2. Vérifiez les logs Apache : `/var/log/apache2/`
3. Vérifiez la connexion à la base de données
4. Contactez le support Hostinger si nécessaire

---

**Bon déploiement ! 🚀**

