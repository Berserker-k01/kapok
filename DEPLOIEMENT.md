# 🚀 Guide de Déploiement Optimal - Lesigne SaaS

> **📌 Note :** Si vous utilisez **Hostinger Cloud Startup**, consultez plutôt le guide spécifique : **[DEPLOIEMENT_HOSTINGER.md](./DEPLOIEMENT_HOSTINGER.md)**

## ⚡ Option Recommandée : Fly.io (MEILLEURE)

**Pourquoi Fly.io ?**
- ✅ Déploiement Docker ultra-simple
- ✅ PostgreSQL managé inclus
- ✅ SSL automatique
- ✅ Scaling automatique
- ✅ 3 VMs gratuites (parfait pour démarrer)
- ✅ Support global (CDN intégré)
- ✅ Pas de configuration complexe

### 🚀 Déploiement Rapide (Script automatique)

Pour déployer rapidement, utilisez le script fourni :

```bash
chmod +x deploy-fly.sh
./deploy-fly.sh
```

Le script vous guidera à travers tout le processus de déploiement.

### Étapes de déploiement manuel

#### 1. Installation de Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

#### 2. Configuration du backend

```bash
cd server
fly launch --name lesigne-api

# Répondez aux questions :
# - App name: lesigne-api (ou votre choix)
# - Select region: cdg (Paris) ou celui le plus proche
# - PostgreSQL: Yes (créera automatiquement une DB)
# - Redis: No
```

#### 3. Créer une base de données PostgreSQL

```bash
fly postgres create --name lesigne-db
fly postgres attach --app lesigne-api lesigne-db

# Les variables DB_* seront automatiquement configurées
```

#### 4. Configuration des variables d'environnement

```bash
# Depuis le dossier server/
fly secrets set \
  JWT_SECRET="votre_secret_jwt_super_long" \
  STRIPE_SECRET_KEY="sk_live_..." \
  OPENAI_API_KEY="sk-..." \
  FRONTEND_URL="https://lesigne-user-panel.fly.dev" \
  USER_PANEL_URL="https://lesigne-user-panel.fly.dev" \
  ADMIN_PANEL_URL="https://lesigne-admin-panel.fly.dev"

# Les variables DB_* sont automatiquement configurées par Fly.io PostgreSQL
```

#### 5. Ajouter une route de santé (si nécessaire)

Ajoutez dans `server/src/index.js` :

```javascript
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

#### 6. Déploiement du backend

```bash
# Utiliser le fichier fly.toml.example comme base
cp fly.toml.example fly.toml
# Modifiez fly.toml selon vos besoins

fly deploy
```

Votre API sera accessible sur : `https://lesigne-api.fly.dev`

#### 7. Déploiement des frontends (User Panel)

```bash
cd ../user-panel

# Utiliser le fichier fly.toml.example
cp fly.toml.example fly.toml

# Modifier VITE_API_URL dans fly.toml avec votre URL d'API
# [build]
#   build_args = { VITE_API_URL = "https://lesigne-api.fly.dev/api" }

fly launch --name lesigne-user-panel --config fly.toml

# Répondez aux questions :
# - Build Dockerfile: Yes
# - Region: même que le backend (cdg)
```

```bash
fly deploy --build-arg VITE_API_URL=https://lesigne-api.fly.dev/api
```

**Important** : Assurez-vous que le backend autorise votre frontend dans CORS (voir ci-dessous).

#### 8. Déploiement Admin Panel

```bash
cd ../admin-panel
cp fly.toml.example fly.toml
# Modifier VITE_API_URL dans fly.toml

fly launch --name lesigne-admin-panel --config fly.toml
fly deploy --build-arg VITE_API_URL=https://lesigne-api.fly.dev/api
```

#### 9. Configuration CORS dans le backend

Mettez à jour `server/src/index.js` pour autoriser vos domaines Fly.io :

```javascript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'https://lesigne-user-panel.fly.dev',
    'https://lesigne-admin-panel.fly.dev',
    process.env.USER_PANEL_URL,
    process.env.ADMIN_PANEL_URL,
    /\.fly\.dev$/
  ],
  credentials: true
}))
```

#### 10. Configuration DNS (optionnel)

```bash
# Ajouter des domaines personnalisés
fly domains add app.votre-domaine.com -a lesigne-user-panel
fly domains add admin.votre-domaine.com -a lesigne-admin-panel
fly domains add api.votre-domaine.com -a lesigne-api

# Mettre à jour les secrets avec les nouvelles URLs
fly secrets set \
  USER_PANEL_URL="https://app.votre-domaine.com" \
  ADMIN_PANEL_URL="https://admin.votre-domaine.com" \
  FRONTEND_URL="https://app.votre-domaine.com" \
  -a lesigne-api
```

### Avantages Fly.io
- **Coût** : Gratuit jusqu'à 3 VMs, puis ~$2-5/mois par VM
- **Performance** : Excellent (CDN global)
- **Maintenance** : Minimale (updates automatiques)
- **Monitoring** : Dashboard intégré

---

## 🎯 Option Alternative 1 : Railway

**Pourquoi Railway ?**
- ✅ Interface graphique intuitive
- ✅ Déploiement depuis GitHub en 1 clic
- ✅ PostgreSQL managé
- ✅ Variables d'environnement faciles
- ✅ $5 crédit gratuit/mois
- ✅ SSL automatique

### Étapes

1. **Aller sur [railway.app](https://railway.app)** et créer un compte

2. **Créer un nouveau projet** → "New Project" → "Deploy from GitHub repo"

3. **Sélectionner votre repository**

4. **Ajouter PostgreSQL :**
   - "New" → "Database" → "Add PostgreSQL"
   - Railway créera automatiquement les variables `DATABASE_URL`, `PGHOST`, `PGPORT`, etc.

5. **Déployer le Backend :**
   - "New" → "GitHub Repo" → Sélectionner votre repo
   - Dans "Settings" → "Root Directory" : mettre `server`
   - Dans "Variables" → Ajouter toutes les variables nécessaires :
     ```
     NODE_ENV=production
     PORT=5000
     JWT_SECRET=votre_secret
     STRIPE_SECRET_KEY=sk_...
     USER_PANEL_URL=https://votre-user-panel.up.railway.app
     ADMIN_PANEL_URL=https://votre-admin-panel.up.railway.app
     FRONTEND_URL=https://votre-user-panel.up.railway.app
     ```
   - Railway détectera automatiquement le Dockerfile

6. **Déployer User Panel :**
   - Même processus, Root Directory : `user-panel`
   - Variable : `VITE_API_URL=https://votre-backend.up.railway.app/api`

7. **Déployer Admin Panel :**
   - Root Directory : `admin-panel`
   - Variable : `VITE_API_URL=https://votre-backend.up.railway.app/api`

### Avantages Railway
- **Coût** : $5 crédit/mois, puis ~$20-40/mois pour les 4 services
- **Simplicité** : Interface graphique, pas de CLI nécessaire
- **Déploiement** : Automatique à chaque push GitHub

---

## 🛡️ Option Alternative 2 : VPS avec Dokploy

**Pourquoi VPS + Dokploy ?**
- ✅ Contrôle total
- ✅ Meilleur prix à long terme (~5-10€/mois)
- ✅ Interface graphique simple
- ✅ Idéal si vous avez déjà un VPS

### Prérequis
- VPS avec Docker (Hetzner, DigitalOcean, OVH)
- Domaine configuré

### Étapes

1. **Installer Dokploy sur le VPS**

```bash
# Sur votre VPS
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Dokploy
docker run -d \
  --name dokploy \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v dokploy-data:/app/data \
  dokploy/dokploy:latest
```

2. **Accéder à Dokploy** : `http://votre-vps-ip:3000`

3. **Créer les applications :**
   - Backend (dossier `server/`, Dockerfile)
   - PostgreSQL (depuis template)
   - User Panel (dossier `user-panel/`)
   - Admin Panel (dossier `admin-panel/`)

4. **Configurer Nginx** pour les domaines (via Dokploy ou manuellement)

---

## 📊 Comparaison Rapide

| Critère | Fly.io ⭐ | Railway | VPS+Dokploy |
|---------|----------|---------|-------------|
| **Difficulté** | ⭐⭐ Facile | ⭐ Très facile | ⭐⭐⭐ Moyen |
| **Coût/mois** | Gratuit → $5-15 | $5 → $20-40 | €5-10 |
| **Performance** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Bon | ⭐⭐⭐ Variable |
| **Scalabilité** | Auto | Auto | Manuel |
| **Maintenance** | Minimale | Minimale | Manuelle |
| **SSL** | Auto | Auto | Manuel |
| **Support DB** | Oui (PostgreSQL) | Oui (PostgreSQL) | À configurer |
| **CDN** | Oui (global) | Oui (basique) | Non |
| **Déploiement** | CLI ou GitHub | GitHub auto | Interface graphique |

---

## 💰 Estimation des Coûts

### Fly.io
- **Gratuit** : 3 VMs partagées (256MB RAM chacune) - **PARFAIT pour démarrer**
- **Payant** : ~$2-5/mois par VM supplémentaire
- **PostgreSQL** : ~$15/mois (1GB) ou gratuit avec 256MB partagé
- **Total estimé (démarrage)** : **GRATUIT** pendant les premiers mois
- **Total estimé (croissance)** : $10-25/mois

### Railway
- **Crédit gratuit** : $5/mois
- **PostgreSQL** : ~$5-10/mois
- **Backend** : ~$5-10/mois
- **2 Frontends** : ~$10-20/mois
- **Total estimé** : $20-45/mois (après crédit gratuit)

### VPS + Dokploy
- **VPS** (Hetzner/DigitalOcean) : €5-10/mois (2GB RAM)
- **Dokploy** : Gratuit (open-source)
- **Total estimé** : €5-10/mois
- ⚠️ Maintenance manuelle requise

---

## 🎯 Recommandation Finale

### 🏆 **MEILLEURE OPTION : Fly.io**

**Pourquoi ?**
- ✅ **Gratuit pour démarrer** (3 VMs gratuites)
- ✅ **Performance excellente** (CDN global)
- ✅ **Maintenance minimale**
- ✅ **Scaling automatique**
- ✅ **SSL automatique**
- ✅ **Setup en 15 minutes**

**Quand utiliser les alternatives ?**
- **Railway** : Si vous préférez une interface graphique et que le coût n'est pas un problème
- **VPS + Dokploy** : Si vous avez déjà un VPS et voulez économiser à long terme

---

## 📝 Checklist Post-Déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données migrée (si nécessaire)
- [ ] SSL activé (automatique avec Fly.io/Railway)
- [ ] CORS configuré avec les bonnes URLs
- [ ] Tests de l'API fonctionnels
- [ ] Frontends accessibles
- [ ] Uploads de fichiers fonctionnels
- [ ] Monitoring configuré (logs)

---

## 🔧 Dépannage Rapide

### Problème : Backend ne démarre pas
```bash
# Voir les logs
fly logs -a lesigne-api
```

### Problème : Base de données non accessible
```bash
# Vérifier les variables d'environnement
fly secrets list -a lesigne-api
```

### Problème : Frontend ne charge pas l'API
- Vérifier `VITE_API_URL` dans les variables d'environnement
- Vérifier CORS dans `server/src/index.js`

---

**Besoin d'aide ?** Consultez les logs avec `fly logs` ou via le dashboard de votre plateforme.

