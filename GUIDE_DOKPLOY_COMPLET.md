# 🚀 Guide Complet - Déploiement Lesigne avec Dokploy

Guide étape par étape pour déployer vos **3 applications** (server, user-panel, admin-panel) avec Dokploy sur un VPS Hostinger.

## 📋 Prérequis

- ✅ VPS Hostinger (VPS 2 recommandé : 4 vCPU, 4GB RAM)
- ✅ Accès SSH au VPS
- ✅ Domaine configuré (optionnel mais recommandé)
- ✅ Repository Git avec votre code

## 🎯 Vue d'Ensemble

Vous allez déployer **3 applications séparées** :

1. **🔧 Backend API** (server/) - Node.js Express
2. **👤 User Panel** (user-panel/) - React + Vite
3. **🛡️ Admin Panel** (admin-panel/) - React + Vite

---

## 📦 Étape 1 : Installation de Dokploy

### Sur votre VPS Hostinger

```bash
# Se connecter au VPS via SSH
ssh root@votre-ip-vps

# Installer Dokploy
curl -fsSL https://get.dokploy.com | sh

# Ou via Docker (si vous préférez)
docker run -d \
  --name dokploy \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v dokploy-data:/app/data \
  dokploy/dokploy:latest
```

### Accéder à Dokploy

1. Ouvrez votre navigateur : `http://votre-ip-vps:3000`
2. Créez votre compte administrateur
3. Connectez-vous

---

## 🗄️ Étape 2 : Configuration de la Base de Données PostgreSQL

### Option A : PostgreSQL via Dokploy (Recommandé)

1. Dans Dokploy, cliquez sur **"New Application"**
2. Sélectionnez **"PostgreSQL"** ou **"Database"**
3. Configurez :
   - **Application Name** : `lesigne-postgres`
   - **Database Name** : `lesigne_db`
   - **Database User** : `lesigne_user`
   - **Database Password** : (générez un mot de passe sécurisé)
   - **Version** : `15` ou `16`
4. Cliquez sur **"Deploy"**

**Notez** :
- **Host** : `lesigne-postgres` (nom du service)
- **Port** : `5432`
- **Database** : `lesigne_db`
- **User** : `lesigne_user`
- **Password** : (celui que vous avez créé)

### Option B : PostgreSQL Externe

Si vous avez déjà une base de données PostgreSQL, utilisez ses informations.

### Initialisation du Schéma

1. Dans Dokploy, allez dans votre application PostgreSQL
2. Cliquez sur **"Terminal"** ou **"Exec"**
3. Exécutez :

```bash
# Télécharger le schéma (ou copiez-le depuis votre repo)
# Option 1 : Via Git
git clone https://github.com/votre-repo/lesigne.git
cd lesigne/Lesignes/server/database

# Option 2 : Créer le fichier directement
# Copiez le contenu de schema.sql dans le terminal

# Exécuter le schéma
psql -U lesigne_user -d lesigne_db -f schema.sql

# Si vous avez des migrations
psql -U lesigne_user -d lesigne_db -f migration_subscription_payments.sql
```

**OU** utilisez un **One-time Job** dans Dokploy :

1. Créez un **"One-time Job"**
2. **Image** : `postgres:15-alpine`
3. **Command** :
```bash
psql -h lesigne-postgres -U lesigne_user -d lesigne_db -f /path/to/schema.sql
```

---

## 🔧 Étape 3 : Déploiement du Backend API

### Configuration dans Dokploy

1. Cliquez sur **"New Application"**
2. Sélectionnez **"Node.js"** ou **"Docker"**

#### Configuration Node.js (Méthode Simple)

**Informations de Base** :
- **Application Name** : `lesigne-api`
- **Type** : `Node.js`

**Repository** :
- **Repository URL** : `https://github.com/votre-username/lesigne.git`
- **Branch** : `main` ou `master`
- **Build Path** : `Lesignes/server` (ou `server/` selon votre structure)

**Build Settings** :
- **Build Command** :
```bash
npm install --production
```
- **Install Command** : (laissez vide ou `npm install`)

**Start Command** :
```bash
node src/index.js
```

**Port** : `5000`

**Environment Variables** :
```env
NODE_ENV=production
PORT=5000
DB_HOST=lesigne-postgres
DB_PORT=5432
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe_postgres
JWT_SECRET=votre_secret_jwt_tres_securise
FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
CORS_ORIGIN=https://app.votre-domaine.com,https://admin.votre-domaine.com
```

**Volumes** (si nécessaire) :
- `/app/uploads` → Pour les fichiers uploadés
- `/app/logs` → Pour les logs

#### Configuration Docker (Méthode Avancée)

Si vous préférez utiliser Docker :

1. Sélectionnez **"Docker"** comme type
2. **Dockerfile Path** : `Lesignes/server/Dockerfile`
3. **Build Context** : `Lesignes/server`
4. **Port** : `5000`
5. Mêmes variables d'environnement que ci-dessus

### Déploiement

1. Cliquez sur **"Deploy"** ou **"Save & Deploy"**
2. Dokploy va :
   - Cloner votre repository
   - Installer les dépendances
   - Démarrer l'application
3. Vérifiez les logs pour confirmer que l'API démarre correctement

### Test de l'API

```bash
# Depuis votre machine locale
curl http://votre-ip-vps:5000/api/health

# Ou depuis le terminal Dokploy
curl http://localhost:5000/api/health
```

---

## 👤 Étape 4 : Déploiement du User Panel

### Configuration dans Dokploy

1. Cliquez sur **"New Application"**
2. Sélectionnez **"Static Site"** ou **"Node.js"**

#### Option A : Static Site (Recommandé)

**Informations de Base** :
- **Application Name** : `lesigne-user-panel`
- **Type** : `Static Site`

**Repository** :
- **Repository URL** : `https://github.com/votre-username/lesigne.git`
- **Branch** : `main` ou `master`
- **Build Path** : `Lesignes/user-panel`

**Build Settings** :
- **Build Command** :
```bash
npm install
npm run build
```
- **Output Directory** : `dist`
- **Install Command** : `npm install`

**Port** : `80` ou `443` (selon votre configuration)

**Environment Variables** (pour le build) :
```env
NODE_ENV=production
VITE_API_URL=https://api.votre-domaine.com
```

#### Option B : Node.js avec Vite Preview

Si vous préférez servir via Node.js :

1. Sélectionnez **"Node.js"**
2. **Build Path** : `Lesignes/user-panel`
3. **Build Command** :
```bash
npm install
npm run build
```
4. **Start Command** :
```bash
npm run preview
```
5. **Port** : `3001`

**Environment Variables** :
```env
NODE_ENV=production
VITE_API_URL=https://api.votre-domaine.com
PORT=3001
```

### Configuration du Reverse Proxy

Dans Dokploy, configurez le **Reverse Proxy** :

1. Allez dans les paramètres de l'application
2. Section **"Domains"** ou **"Reverse Proxy"**
3. Ajoutez votre domaine :
   - **Domain** : `app.votre-domaine.com`
   - **Target** : `lesigne-user-panel:80` (ou le port configuré)

---

## 🛡️ Étape 5 : Déploiement du Admin Panel

### Configuration dans Dokploy

Même processus que le User Panel :

1. Cliquez sur **"New Application"**
2. Sélectionnez **"Static Site"** ou **"Node.js"**

**Informations de Base** :
- **Application Name** : `lesigne-admin-panel`
- **Type** : `Static Site`

**Repository** :
- **Repository URL** : `https://github.com/votre-username/lesigne.git`
- **Branch** : `main` ou `master`
- **Build Path** : `Lesignes/admin-panel`

**Build Settings** :
- **Build Command** :
```bash
npm install
npm run build
```
- **Output Directory** : `dist`

**Port** : `80` ou `443`

**Environment Variables** :
```env
NODE_ENV=production
VITE_API_URL=https://api.votre-domaine.com
```

### Configuration du Reverse Proxy

1. Section **"Domains"**
2. Ajoutez :
   - **Domain** : `admin.votre-domaine.com`
   - **Target** : `lesigne-admin-panel:80`

---

## 🌐 Étape 6 : Configuration des Domaines et SSL

### Configuration des Domaines

Pour chaque application dans Dokploy :

1. Allez dans les paramètres de l'application
2. Section **"Domains"**
3. Ajoutez votre domaine :
   - **Backend API** : `api.votre-domaine.com`
   - **User Panel** : `app.votre-domaine.com`
   - **Admin Panel** : `admin.votre-domaine.com`

### Activation SSL/HTTPS

Dokploy intègre Let's Encrypt :

1. Dans les paramètres de chaque application
2. Activez **"SSL"** ou **"Let's Encrypt"**
3. Entrez votre domaine
4. Dokploy générera automatiquement le certificat SSL
5. Redirigez HTTP vers HTTPS automatiquement

---

## 🔧 Étape 7 : Configuration Avancée

### Variables d'Environnement Globales

Dans Dokploy, vous pouvez définir des variables d'environnement globales :

1. Allez dans **"Settings"** > **"Environment Variables"**
2. Ajoutez les variables communes :
```env
NODE_ENV=production
API_URL=https://api.votre-domaine.com
```

### Volumes Persistants

Pour le backend API, configurez des volumes pour :

1. **Uploads** : `/app/uploads` → Persiste les fichiers uploadés
2. **Logs** : `/app/logs` → Persiste les logs

Dans Dokploy :
- Section **"Volumes"** de l'application
- Ajoutez les volumes nécessaires

### Health Checks

Dokploy peut vérifier la santé de vos applications :

1. Section **"Health Check"**
2. **Path** : `/api/health` (pour l'API)
3. **Interval** : `30s`
4. **Timeout** : `10s`

---

## 🔄 Étape 8 : Déploiement Automatique

### Webhooks Git

Pour déployer automatiquement à chaque push :

1. Dans les paramètres de l'application
2. Section **"Webhooks"** ou **"Auto Deploy"**
3. Activez **"Auto Deploy on Push"**
4. Copiez l'URL du webhook
5. Ajoutez-le dans votre repository Git (GitHub/GitLab) :
   - **Settings** > **Webhooks** > **Add Webhook**
   - **Payload URL** : URL du webhook Dokploy
   - **Content type** : `application/json`
   - **Events** : `push`

Maintenant, à chaque `git push`, Dokploy redéploiera automatiquement !

---

## 📊 Étape 9 : Monitoring et Logs

### Voir les Logs

Dans Dokploy :

1. Allez dans votre application
2. Onglet **"Logs"**
3. Voir les logs en temps réel
4. Filtrer par niveau (info, error, warn)

### Monitoring des Ressources

1. Onglet **"Metrics"** ou **"Monitoring"**
2. Voir :
   - Utilisation CPU
   - Utilisation RAM
   - Utilisation disque
   - Trafic réseau

### Alertes

Configurez des alertes pour :
- Utilisation CPU > 80%
- Utilisation RAM > 80%
- Application down

---

## 🐛 Dépannage

### L'API ne démarre pas

1. Vérifiez les **logs** dans Dokploy
2. Vérifiez les **variables d'environnement**
3. Vérifiez la **connexion à la base de données** :
```bash
# Dans le terminal de l'application
psql -h lesigne-postgres -U lesigne_user -d lesigne_db
```

### Les frontends ne se chargent pas

1. Vérifiez que le **build** s'est bien passé
2. Vérifiez les **logs de build**
3. Vérifiez que `dist/` contient les fichiers
4. Vérifiez la configuration du **Reverse Proxy**

### Erreurs CORS

Vérifiez les variables d'environnement de l'API :
```env
CORS_ORIGIN=https://app.votre-domaine.com,https://admin.votre-domaine.com
FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

### Redémarrer une Application

1. Dans Dokploy, allez dans votre application
2. Cliquez sur **"Restart"**

### Rebuild une Application

1. Cliquez sur **"Rebuild"** ou **"Pull & Deploy"**
2. Dokploy va :
   - Pull les dernières modifications
   - Rebuild l'application
   - Redémarrer

---

## ✅ Checklist Complète

### Préparation
- [ ] VPS Hostinger configuré
- [ ] Dokploy installé et accessible
- [ ] Repository Git prêt
- [ ] Domaines configurés (optionnel)

### Base de Données
- [ ] PostgreSQL créé dans Dokploy
- [ ] Schéma de base de données initialisé
- [ ] Migrations exécutées (si nécessaire)
- [ ] Connexion testée

### Backend API
- [ ] Application `lesigne-api` créée
- [ ] Repository configuré
- [ ] Variables d'environnement configurées
- [ ] Port 5000 configuré
- [ ] Volumes configurés (uploads, logs)
- [ ] API déployée et fonctionnelle
- [ ] Test : `curl http://api.votre-domaine.com/api/health`

### User Panel
- [ ] Application `lesigne-user-panel` créée
- [ ] Repository configuré
- [ ] Build command configuré
- [ ] Output directory : `dist`
- [ ] Variables d'environnement configurées
- [ ] Reverse Proxy configuré : `app.votre-domaine.com`
- [ ] User Panel déployé et accessible

### Admin Panel
- [ ] Application `lesigne-admin-panel` créée
- [ ] Repository configuré
- [ ] Build command configuré
- [ ] Output directory : `dist`
- [ ] Variables d'environnement configurées
- [ ] Reverse Proxy configuré : `admin.votre-domaine.com`
- [ ] Admin Panel déployé et accessible

### SSL/HTTPS
- [ ] SSL activé pour l'API
- [ ] SSL activé pour le User Panel
- [ ] SSL activé pour le Admin Panel
- [ ] Redirection HTTP → HTTPS activée

### Déploiement Automatique
- [ ] Webhooks Git configurés
- [ ] Auto-deploy activé
- [ ] Test : Push et vérifier le redéploiement

### Monitoring
- [ ] Logs accessibles
- [ ] Metrics configurées
- [ ] Alertes configurées (optionnel)

---

## 🎯 Structure Finale dans Dokploy

```
Dokploy Dashboard
├── lesigne-postgres (PostgreSQL)
│   └── Port: 5432
│   └── Database: lesigne_db
│
├── lesigne-api (Backend Express)
│   └── Port: 5000
│   └── Domain: api.votre-domaine.com
│   └── Type: Node.js/Docker
│
├── lesigne-user-panel (Frontend Users)
│   └── Port: 80/443
│   └── Domain: app.votre-domaine.com
│   └── Type: Static Site
│
└── lesigne-admin-panel (Frontend Admin)
    └── Port: 80/443
    └── Domain: admin.votre-domaine.com
    └── Type: Static Site
```

---

## 🚀 Commandes Utiles

### Via SSH sur le VPS

```bash
# Voir les conteneurs Docker
docker ps

# Voir les logs d'une application
docker logs lesigne-api

# Redémarrer une application
docker restart lesigne-api

# Accéder au terminal d'une application
docker exec -it lesigne-api sh
```

### Via Dokploy Interface

- **Logs** : Onglet "Logs" de chaque application
- **Terminal** : Onglet "Terminal" pour exécuter des commandes
- **Restart** : Bouton "Restart" pour redémarrer
- **Rebuild** : Bouton "Rebuild" pour reconstruire

---

## 📚 Ressources

- [Documentation Dokploy](https://dokploy.com/docs)
- [Guide Docker pour Node.js](https://docs.docker.com/language/nodejs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🎉 Félicitations !

Vos 3 applications sont maintenant déployées avec Dokploy ! 

**URLs d'accès** :
- 🔧 API : `https://api.votre-domaine.com`
- 👤 User Panel : `https://app.votre-domaine.com`
- 🛡️ Admin Panel : `https://admin.votre-domaine.com`

**Prochaines étapes** :
1. Testez toutes les fonctionnalités
2. Configurez les sauvegardes de la base de données
3. Configurez les alertes de monitoring
4. Documentez les procédures de maintenance

---

**Besoin d'aide ?** Consultez les logs dans Dokploy ou vérifiez la section Dépannage ci-dessus.

