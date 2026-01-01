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
CREATE DATABASE lesigne_db;
CREATE USER lesigne_user WITH PASSWORD 'votre_mot_de_passe_secure';
GRANT ALL PRIVILEGES ON DATABASE lesigne_db TO lesigne_user;
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
