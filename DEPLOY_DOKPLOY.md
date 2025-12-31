# 🚀 Déploiement avec Dokploy

Guide pour déployer Lesigne sur un VPS avec Dokploy.

## 📋 Spécifications VPS Recommandées

### Minimum (Développement/Test)
- **CPU** : 2 vCPU
- **RAM** : 2 GB
- **Stockage** : 20 GB SSD
- **OS** : Ubuntu 22.04 LTS ou Debian 11

### Recommandé (Production)
- **CPU** : 4 vCPU
- **RAM** : 4-8 GB
- **Stockage** : 40-60 GB SSD
- **OS** : Ubuntu 22.04 LTS ou Debian 11
- **Bande passante** : Illimitée ou 1 TB+

### Optimal (Production avec trafic élevé)
- **CPU** : 8 vCPU
- **RAM** : 16 GB
- **Stockage** : 100 GB SSD
- **OS** : Ubuntu 22.04 LTS

## 🎯 Choix de la VM

### Pour Hostinger VPS
- **VPS 1** (2 vCPU, 2GB RAM) : Suffisant pour tester
- **VPS 2** (4 vCPU, 4GB RAM) : **Recommandé pour production**
- **VPS 3** (8 vCPU, 8GB RAM) : Pour trafic élevé

### Recommandation
**Choisissez VPS 2 (4 vCPU, 4GB RAM)** - C'est le meilleur rapport qualité/prix pour une application de production.

## 🐳 Configuration Dokploy

Dokploy est excellent pour déployer Node.js. Voici comment configurer.

### 1. Installation de Dokploy sur le VPS

```bash
# Sur votre VPS fraîchement installé
curl -fsSL https://get.dokploy.com | sh

# Ou via Docker
docker run -d \
  --name dokploy \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v dokploy-data:/app/data \
  dokploy/dokploy:latest
```

Accédez à Dokploy : `http://votre-ip:3000`

### 2. Configuration dans Dokploy

#### A. Créer une Nouvelle Application

1. Connectez-vous à Dokploy
2. Cliquez sur **"New Application"**
3. Sélectionnez **"Node.js"** ou **"Docker"**

#### B. Configuration Node.js (Méthode Simple)

**Application Name** : `lesigne-api`

**Repository** :
- URL : `https://github.com/votre-repo/lesigne.git`
- Branch : `main` ou `master`
- Build Path : `Lesignes/server`

**Build Command** :
```bash
npm install --production
```

**Start Command** :
```bash
node src/index.js
```

**Port** : `5000`

**Environment Variables** :
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

#### C. Configuration Docker (Méthode Avancée)

Créez un `Dockerfile` dans `Lesignes/server/` :

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads/payment-proofs logs

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["node", "src/index.js"]
```

Dans Dokploy, utilisez **"Docker"** comme type d'application.

### 3. Configuration de la Base de Données

#### Option A : PostgreSQL dans Dokploy

1. Dans Dokploy, créez une nouvelle application **PostgreSQL**
2. Configurez :
   - **Database** : `lesigne_db`
   - **User** : `lesigne_user`
   - **Password** : (générez un mot de passe sécurisé)
3. Notez l'**host** et le **port** (généralement le nom du service)

#### Option B : PostgreSQL Externe

Utilisez les variables d'environnement avec l'host de votre base de données.

### 4. Initialisation de la Base de Données

Dans Dokploy, ajoutez une **"One-time Job"** ou utilisez le terminal :

```bash
# Se connecter au conteneur de l'application
docker exec -it lesigne-api sh

# Ou via SSH sur le VPS
psql -h db_host -U lesigne_user -d lesigne_db -f /app/database/schema.sql
```

## 📦 Déploiement des Frontends

### User Panel

1. Créez une nouvelle application **"Static Site"** dans Dokploy
2. **Repository** : Même repo, branch `main`
3. **Build Path** : `Lesignes/user-panel`
4. **Build Command** :
   ```bash
   npm install
   npm run build
   ```
5. **Output Directory** : `dist`
6. **Port** : `80` ou `443` (selon votre configuration)

### Admin Panel

Même processus avec :
- **Build Path** : `Lesignes/admin-panel`
- **Output Directory** : `dist`

## 🔧 Configuration Nginx (via Dokploy)

Dokploy gère généralement Nginx automatiquement, mais vous pouvez configurer :

### Reverse Proxy pour l'API

Dans Dokploy, configurez le **Reverse Proxy** :
- **Domain** : `api.votre-domaine.com`
- **Target** : `lesigne-api:5000`

### Servir les Frontends

- **Domain** : `app.votre-domaine.com` → User Panel
- **Domain** : `admin.votre-domaine.com` → Admin Panel

## 🔒 SSL/HTTPS

Dokploy intègre généralement Let's Encrypt :

1. Dans les paramètres de l'application
2. Activez **"SSL"** ou **"Let's Encrypt"**
3. Entrez votre domaine
4. Dokploy générera automatiquement le certificat

## 📊 Monitoring

Dokploy offre un monitoring intégré :
- Logs en temps réel
- Utilisation des ressources
- Health checks automatiques

## 🔄 Mise à Jour

Dans Dokploy :
1. Allez dans votre application
2. Cliquez sur **"Redeploy"** ou **"Pull & Deploy"**
3. Dokploy rebuild et redémarre automatiquement

## 🐛 Dépannage

### Voir les Logs

Dans Dokploy :
- Allez dans votre application
- Onglet **"Logs"**
- Voir les logs en temps réel

### Redémarrer

- **Restart** : Redémarre l'application
- **Rebuild** : Rebuild et redémarre

### Variables d'Environnement

- Onglet **"Environment"**
- Ajoutez/modifiez les variables
- Redéployez après modification

## ✅ Checklist de Déploiement Dokploy

- [ ] VPS configuré avec Ubuntu 22.04
- [ ] Dokploy installé et accessible
- [ ] Application API créée et configurée
- [ ] Base de données PostgreSQL créée
- [ ] Schéma de base de données initialisé
- [ ] Variables d'environnement configurées
- [ ] User Panel déployé
- [ ] Admin Panel déployé
- [ ] Domaines configurés
- [ ] SSL/HTTPS activé
- [ ] Tests de fonctionnement effectués

## 🎯 Avantages de Dokploy

✅ Interface graphique intuitive  
✅ Déploiement automatique depuis Git  
✅ Gestion des variables d'environnement  
✅ SSL automatique avec Let's Encrypt  
✅ Monitoring intégré  
✅ Logs en temps réel  
✅ Redéploiement en un clic  
✅ Support Docker natif  

## 📚 Ressources

- [Documentation Dokploy](https://dokploy.com/docs)
- [Guide Docker pour Node.js](https://docs.docker.com/language/nodejs/)

---

**Recommandation Finale :** 
- **VPS** : VPS 2 (4 vCPU, 4GB RAM) de Hostinger
- **Déploiement** : Dokploy pour simplifier la gestion
- **Base de données** : PostgreSQL via Dokploy ou externe

