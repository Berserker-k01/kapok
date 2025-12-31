# 🎯 Déploiement des 3 Applications sur Hostinger

Votre projet a **3 applications distinctes** que Hostinger doit reconnaître :

1. 🔧 **server/** - API Express (Backend)
2. 👤 **user-panel/** - React + Vite (Frontend Utilisateurs)  
3. 🛡️ **admin-panel/** - React + Vite (Frontend Admin)

## 🚀 Stratégie de Déploiement

### Option A : 3 Applications Node.js Séparées (Si Hostinger le Permet)

Dans hPanel, créez **3 applications Node.js** :

#### 1. Application Backend (Express)

- **Nom** : `lesigne-api`
- **Framework** : Express
- **Répertoire** : `server/`
- **Fichier de démarrage** : `src/index.js`
- **Port** : `5000`

#### 2. Application User Panel (Vite)

- **Nom** : `lesigne-user-panel`
- **Framework** : Vite
- **Répertoire** : `user-panel/`
- **Build Command** : `npm run build`
- **Start Command** : `npm run preview`
- **Port** : `3001`

#### 3. Application Admin Panel (Vite)

- **Nom** : `lesigne-admin-panel`
- **Framework** : Vite
- **Répertoire** : `admin-panel/`
- **Build Command** : `npm run build`
- **Start Command** : `npm run preview`
- **Port** : `3002`

### Option B : Backend Node.js + Frontends Statiques (Recommandé)

C'est la méthode la plus simple et la plus performante :

#### 1. Backend Express (Node.js)

Dans hPanel > Node.js :
- **Framework** : Express
- **Répertoire** : `server/`
- **Start** : `node src/index.js`
- **Port** : `5000`

#### 2. Frontends (Fichiers Statiques)

Buildez les frontends et servez-les comme fichiers statiques :

```bash
# Build user-panel
cd user-panel
npm install
npm run build
# Crée dist/ avec tous les fichiers statiques

# Build admin-panel
cd ../admin-panel
npm install
npm run build
# Crée dist/ avec tous les fichiers statiques
```

Puis configurez Apache pour servir :
- `user-panel/dist/` → `https://app.votre-domaine.com`
- `admin-panel/dist/` → `https://admin.votre-domaine.com`

### Option C : VPS avec Dokploy (Meilleure Solution)

Un VPS vous permet de déployer les 3 applications facilement :

1. **Commandez un VPS** (VPS 2 recommandé)
2. **Installez Dokploy**
3. **Déployez les 3 applications** séparément via l'interface

Voir `DEPLOY_DOKPLOY.md` pour les détails.

## 📋 Fichiers de Configuration Créés

J'ai créé des fichiers `hostinger.json` dans chaque dossier :

- ✅ `server/hostinger.json` - Configuration Express
- ✅ `user-panel/hostinger.json` - Configuration Vite
- ✅ `admin-panel/hostinger.json` - Configuration Vite

Ces fichiers aident Hostinger à détecter chaque application.

## 🔧 Configuration Détaillée

### Backend (server/)

**Dans hPanel > Node.js** :

```
Nom de l'application : lesigne-api
Framework : Express
Répertoire de travail : server/
Fichier de démarrage : src/index.js
Commande : node src/index.js
Port : 5000
```

**Variables d'environnement** :
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

### User Panel (user-panel/)

**Option 1 : Comme Application Node.js**

Dans hPanel > Node.js :
```
Nom : lesigne-user-panel
Framework : Vite
Répertoire : user-panel/
Build : npm run build
Start : npm run preview
Port : 3001
```

**Option 2 : Comme Fichiers Statiques (Recommandé)**

1. Buildez : `cd user-panel && npm run build`
2. Copiez `dist/` vers `public_html/app/`
3. Configurez Apache pour servir ce dossier

### Admin Panel (admin-panel/)

Même processus que user-panel avec :
- Port : `3002`
- Dossier : `public_html/admin/`

## 🎯 Structure Recommandée sur Hostinger

```
domains/votre-domaine.com/
├── public_html/
│   ├── app/              # user-panel/dist/ (fichiers statiques)
│   └── admin/            # admin-panel/dist/ (fichiers statiques)
├── server/                # Application Node.js Express
│   ├── src/
│   ├── package.json
│   └── node_modules/
└── .htaccess             # Configuration Apache
```

## 📝 Configuration Apache (.htaccess)

```apache
# API Backend - Proxy vers Node.js
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
</IfModule>

# User Panel
<VirtualHost *:80>
    ServerName app.votre-domaine.com
    DocumentRoot /home/user/domains/votre-domaine.com/public_html/app
</VirtualHost>

# Admin Panel
<VirtualHost *:80>
    ServerName admin.votre-domaine.com
    DocumentRoot /home/user/domains/votre-domaine.com/public_html/admin
</VirtualHost>
```

## ✅ Checklist Complète

### Backend
- [ ] Application Node.js créée dans hPanel
- [ ] Framework Express sélectionné
- [ ] Répertoire : `server/`
- [ ] Variables d'environnement configurées
- [ ] Port 5000 configuré
- [ ] Test : `curl http://localhost:5000/`

### User Panel
- [ ] Build effectué : `npm run build`
- [ ] Fichiers `dist/` copiés vers `public_html/app/`
- [ ] Apache configuré pour servir le dossier
- [ ] Test : Visiter `https://app.votre-domaine.com`

### Admin Panel
- [ ] Build effectué : `npm run build`
- [ ] Fichiers `dist/` copiés vers `public_html/admin/`
- [ ] Apache configuré pour servir le dossier
- [ ] Test : Visiter `https://admin.votre-domaine.com`

## 🎯 Recommandation

**Pour simplifier** : Utilisez un **VPS avec Dokploy**. C'est beaucoup plus simple pour gérer 3 applications séparées.

Sinon, sur l'hébergement partagé :
1. ✅ Backend en Node.js (Express)
2. ✅ Frontends en fichiers statiques (après build)

---

**Le problème initial** : Hostinger ne voit qu'une seule application à la racine. Il faut soit créer 3 applications séparées, soit servir les frontends comme fichiers statiques.

