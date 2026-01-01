# 🚀 Déploiement - Hostinger Cloud Startup

Guide pour déployer votre SaaS Lesigne sur Hostinger Cloud Startup.

---

## 🚀 Méthode Rapide (Recommandée)

```bash
# 1. Se connecter en SSH
ssh root@votre-ip-hostinger

# 2. Cloner le projet
cd /var/www
git clone https://github.com/votre-username/lesigne.git
cd lesigne

# 3. Exécuter le script de déploiement
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

Le script installe tout automatiquement : Docker, Nginx, build les frontends, configure SSL.

---

## 📋 Déploiement Manuel

### 1. Installation Docker

```bash
apt update && apt upgrade -y
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker && systemctl start docker
```

### 2. Cloner le projet

```bash
cd /var/www
git clone https://github.com/votre-username/lesigne.git
cd lesigne
```

### 3. Configuration

Créer le fichier `.env` à la racine :

```bash
cp .env.example .env
nano .env
```

Variables essentielles :

```env
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
FRONTEND_URL=https://app.votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

### 4. Build et démarrage

```bash
# Builder les frontends
chmod +x build-frontends.sh
./build-frontends.sh https://api.votre-domaine.com/api

# Démarrer les services
docker compose build
docker compose up -d
```

### 5. Configuration Nginx

```bash
apt install -y nginx
```

**API** (`/etc/nginx/sites-available/lesigne-api`) :

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**User Panel** (`/etc/nginx/sites-available/lesigne-user-panel`) :

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
    }
}
```

**Admin Panel** (`/etc/nginx/sites-available/lesigne-admin-panel`) :

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
    }
}
```

**Activer les configurations :**

```bash
ln -s /etc/nginx/sites-available/lesigne-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/lesigne-user-panel /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/lesigne-admin-panel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### 6. SSL avec Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.votre-domaine.com -d app.votre-domaine.com -d admin.votre-domaine.com
```

---

## 🔧 Commandes Utiles

```bash
# Logs
docker compose logs -f

# Redémarrer
docker compose restart

# Mettre à jour
git pull
docker compose down
docker compose build
docker compose up -d
./build-frontends.sh https://api.votre-domaine.com/api

# Statut
docker compose ps
```

---

## 🐛 Dépannage

**Backend ne démarre pas :**
```bash
docker compose logs api
```

**Erreur 502 Nginx :**
```bash
curl http://localhost:5000/api/health
nginx -t
```

**Frontends non buildés :**
```bash
./build-frontends.sh https://api.votre-domaine.com/api
```

---

## ✅ Checklist

- [ ] Docker installé
- [ ] Projet cloné
- [ ] Fichier `.env` configuré
- [ ] Services démarrés (`docker compose ps`)
- [ ] Frontends buildés
- [ ] Nginx configuré
- [ ] SSL actif

---

**URLs finales :**
- API : `https://api.votre-domaine.com`
- User Panel : `https://app.votre-domaine.com`
- Admin Panel : `https://admin.votre-domaine.com`
