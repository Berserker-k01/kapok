# 🚀 Déploiement - Hostinger Cloud Startup

Guide pour déployer votre SaaS Lesigne sur Hostinger Cloud Startup (3 déploiements séparés).

---

## 📋 Prérequis

- ✅ Accès SSH root à votre VPS Hostinger
- ✅ 3 domaines configurés : `api.votre-domaine.com`, `app.votre-domaine.com`, `admin.votre-domaine.com`

---

## 🔧 Partie 1 : Backend API

### 1. Installation Node.js et PostgreSQL

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# PostgreSQL
apt install -y postgresql postgresql-contrib

# PM2 (gestionnaire de processus)
npm install -g pm2
```

### 2. Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
su - postgres
psql
```

Dans PostgreSQL :

```sql
-- Créer l'utilisateur
CREATE USER lesigne_user WITH PASSWORD 'votre_mot_de_passe_secure';

-- Créer la base de données
CREATE DATABASE lesigne_db OWNER lesigne_user;

-- Donner les privilèges sur la base de données
GRANT ALL PRIVILEGES ON DATABASE lesigne_db TO lesigne_user;

-- Se connecter à la base de données
\c lesigne_db

-- Donner les permissions sur le schéma public
GRANT ALL ON SCHEMA public TO lesigne_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lesigne_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lesigne_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lesigne_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lesigne_user;

\q
exit
```

### 3. Cloner et configurer le backend

```bash
cd /var/www
git clone https://github.com/votre-username/lesigne.git
cd lesigne/server

# Installer les dépendances
npm install --production

# Créer le fichier .env
cp ENV_TEMPLATE.txt .env
nano .env
```

**Variables dans `server/.env` :**

```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe_secure
JWT_SECRET=$(openssl rand -base64 64)
FRONTEND_URL=https://app.votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

### 4. Initialiser la base de données

```bash
cd /var/www/lesigne/server
psql -U lesigne_user -d lesigne_db -f database/schema.sql
psql -U lesigne_user -d lesigne_db -f database/migration_subscription_payments.sql
```

### 5. Créer les dossiers nécessaires

```bash
mkdir -p /var/www/lesigne/server/uploads/payment-proofs
mkdir -p /var/www/lesigne/server/logs
chmod -R 755 /var/www/lesigne/server/uploads
```

### 6. Démarrer avec PM2

```bash
cd /var/www/lesigne
pm2 start ecosystem.config.js --only lesigne-server
pm2 save
pm2 startup
# Exécuter la commande affichée
```

### 7. Configuration Nginx pour l'API

```bash
nano /etc/nginx/sites-available/lesigne-api
```

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

```bash
ln -s /etc/nginx/sites-available/lesigne-api /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

---

## 🎨 Partie 2 : User Panel

### 1. Build de l'application

```bash
cd /var/www/lesigne/user-panel

# Installer les dépendances
npm install

# Build avec l'URL de l'API
VITE_API_URL=https://api.votre-domaine.com/api npm run build
```

### 2. Configuration Nginx

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
        proxy_pass https://api.votre-domaine.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/lesigne-user-panel /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

---

## 🛡️ Partie 3 : Admin Panel

### 1. Build de l'application

```bash
cd /var/www/lesigne/admin-panel

# Installer les dépendances
npm install

# Build avec l'URL de l'API
VITE_API_URL=https://api.votre-domaine.com/api npm run build
```

### 2. Configuration Nginx

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
        proxy_pass https://api.votre-domaine.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/lesigne-admin-panel /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

---

## 🔒 Configuration SSL (pour les 3 domaines)

```bash
apt install -y certbot python3-certbot-nginx

# Obtenir les certificats SSL
certbot --nginx -d api.votre-domaine.com -d app.votre-domaine.com -d admin.votre-domaine.com
```

---

## 🔧 Commandes Utiles

### Backend

```bash
# Voir les logs
pm2 logs lesigne-server

# Redémarrer
pm2 restart lesigne-server

# Statut
pm2 status

# Mettre à jour
cd /var/www/lesigne
git pull
cd server
npm install --production
pm2 restart lesigne-server
```

### Frontends

```bash
# Rebuild User Panel
cd /var/www/lesigne/user-panel
npm install
VITE_API_URL=https://api.votre-domaine.com/api npm run build

# Rebuild Admin Panel
cd /var/www/lesigne/admin-panel
npm install
VITE_API_URL=https://api.votre-domaine.com/api npm run build
```

### Nginx

```bash
# Tester la configuration
nginx -t

# Redémarrer
systemctl restart nginx

# Voir les logs
tail -f /var/log/nginx/error.log
```

---

## 🐛 Dépannage

### ❌ Problème de connexion à la base de données PostgreSQL

Si vous n'arrivez pas à communiquer avec la base de données, suivez ces étapes :

#### Étape 1 : Vérifier que PostgreSQL est installé et démarré

```bash
# Vérifier si PostgreSQL est installé
psql --version

# Vérifier le statut du service
systemctl status postgresql
# ou
systemctl status postgresql@14-main  # selon votre version

# Démarrer PostgreSQL si nécessaire
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Pour démarrer au boot
```

#### Étape 2 : Vérifier la configuration PostgreSQL

```bash
# Vérifier que PostgreSQL écoute sur localhost
sudo -u postgres psql -c "SHOW listen_addresses;"

# Si le résultat est vide ou "*", PostgreSQL écoute correctement
# Si vous voyez une IP spécifique, vous devrez peut-être ajuster

# Vérifier le port
sudo -u postgres psql -c "SHOW port;"
# Doit être 5432 par défaut
```

#### Étape 3 : Vérifier les permissions d'authentification (pg_hba.conf)

```bash
# Localiser le fichier pg_hba.conf
sudo find /etc -name pg_hba.conf 2>/dev/null
# ou
sudo find /var/lib/postgresql -name pg_hba.conf 2>/dev/null

# Éditer le fichier (généralement dans /etc/postgresql/14/main/pg_hba.conf)
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Vérifiez que ces lignes existent pour permettre les connexions locales :**

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Après modification, redémarrer PostgreSQL :**
```bash
sudo systemctl restart postgresql
```

#### Étape 4 : Vérifier que la base de données et l'utilisateur existent

```bash
# Se connecter en tant que postgres
sudo -u postgres psql

# Dans psql, vérifier la base de données
\l
# Vous devriez voir "lesigne_db" dans la liste

# Vérifier l'utilisateur
\du
# Vous devriez voir "lesigne_user" dans la liste

# Tester la connexion avec l'utilisateur
\q
psql -U lesigne_user -d lesigne_db
# Entrer le mot de passe si demandé
```

**Si la base de données ou l'utilisateur n'existe pas, recréer :**

```bash
sudo -u postgres psql
```

```sql
-- Supprimer si existe (ATTENTION: supprime toutes les données)
DROP DATABASE IF EXISTS lesigne_db;
DROP USER IF EXISTS lesigne_user;

-- Recréer l'utilisateur
CREATE USER lesigne_user WITH PASSWORD 'votre_mot_de_passe_secure';

-- Créer la base de données
CREATE DATABASE lesigne_db OWNER lesigne_user;

-- Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE lesigne_db TO lesigne_user;

-- Se connecter à la base et donner les permissions sur le schéma
\c lesigne_db
GRANT ALL ON SCHEMA public TO lesigne_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lesigne_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lesigne_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lesigne_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lesigne_user;

\q
```

#### Étape 5 : Vérifier le fichier .env

```bash
cd /var/www/lesigne/server
cat .env | grep DB_
```

**Vérifiez que ces variables sont correctes :**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe_secure  # Doit correspondre au mot de passe créé
```

**ATTENTION :** Si votre `.env` utilise `DB_HOST=127.0.0.1` au lieu de `localhost`, les deux devraient fonctionner, mais essayez `localhost` d'abord.

#### Étape 6 : Tester la connexion avec le script de diagnostic

```bash
cd /var/www/lesigne/server
node diagnose-db.js
```

**Ce script va :**
- Afficher la configuration actuelle (sans le mot de passe)
- Tenter une connexion à la base de données
- Afficher les erreurs détaillées si la connexion échoue

#### Étape 7 : Vérifier les logs PostgreSQL

```bash
# Voir les logs récents
sudo tail -f /var/log/postgresql/postgresql-14-main.log
# ou selon votre version
sudo journalctl -u postgresql -f

# Tenter une connexion depuis votre application et observer les logs
```

#### Étape 8 : Vérifier que le port 5432 n'est pas bloqué

```bash
# Vérifier si PostgreSQL écoute sur le port
sudo netstat -tlnp | grep 5432
# ou
sudo ss -tlnp | grep 5432

# Vous devriez voir quelque chose comme :
# tcp  0  0  127.0.0.1:5432  0.0.0.0:*  LISTEN  ...
# ou
# tcp  0  0  ::1:5432        :::*       LISTEN  ...
```

#### Étape 9 : Test de connexion manuel

```bash
# Tester la connexion directement
psql -h localhost -U lesigne_user -d lesigne_db

# Si ça fonctionne, vous serez dans psql
# Tapez \q pour quitter

# Si ça ne fonctionne pas, notez l'erreur exacte
```

#### Solutions aux erreurs courantes

**Erreur : "FATAL: password authentication failed for user"**
- Le mot de passe dans `.env` ne correspond pas au mot de passe PostgreSQL
- Solution : Recréer l'utilisateur avec le bon mot de passe (étape 4)

**Erreur : "FATAL: database 'lesigne_db' does not exist"**
- La base de données n'existe pas
- Solution : Créer la base de données (étape 4)

**Erreur : "FATAL: role 'lesigne_user' does not exist"**
- L'utilisateur n'existe pas
- Solution : Créer l'utilisateur (étape 4)

**Erreur : "connect ECONNREFUSED 127.0.0.1:5432"**
- PostgreSQL n'est pas démarré ou n'écoute pas sur ce port
- Solution : Vérifier le démarrage (étape 1) et le port (étape 2)

**Erreur : "connect ETIMEDOUT"**
- Problème de firewall ou PostgreSQL n'écoute pas correctement
- Solution : Vérifier pg_hba.conf (étape 3) et les logs (étape 7)

**Erreur : "permission denied for schema public"**
- L'utilisateur n'a pas les bonnes permissions
- Solution : Donner les permissions (étape 4, partie GRANT)

#### Après résolution : Réinitialiser la base de données

Une fois la connexion établie, réinitialiser le schéma :

```bash
cd /var/www/lesigne/server
psql -U lesigne_user -d lesigne_db -f database/schema.sql
psql -U lesigne_user -d lesigne_db -f database/migration_subscription_payments.sql
```

**Redémarrer PM2 :**
```bash
pm2 restart lesigne-server
pm2 logs lesigne-server  # Pour voir les logs
```

---

**Backend ne démarre pas :**
```bash
pm2 logs lesigne-server
# Vérifier les variables dans server/.env
```

**Erreur 502 Nginx :**
```bash
curl http://localhost:5000/api/health
pm2 status
```

**Frontends ne se chargent pas :**
```bash
# Vérifier que les dossiers dist/ existent
ls -la /var/www/lesigne/user-panel/dist
ls -la /var/www/lesigne/admin-panel/dist

# Rebuild si nécessaire
```

---

## ✅ Checklist

### Backend
- [ ] Node.js 18 installé
- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée et initialisée
- [ ] Fichier `server/.env` configuré
- [ ] PM2 démarré (`pm2 status`)
- [ ] Nginx configuré pour l'API

### User Panel
- [ ] Application buildée (`user-panel/dist` existe)
- [ ] Nginx configuré

### Admin Panel
- [ ] Application buildée (`admin-panel/dist` existe)
- [ ] Nginx configuré

### SSL
- [ ] Certificats Let's Encrypt installés pour les 3 domaines

---

**URLs finales :**
- API : `https://api.votre-domaine.com`
- User Panel : `https://app.votre-domaine.com`
- Admin Panel : `https://admin.votre-domaine.com`
