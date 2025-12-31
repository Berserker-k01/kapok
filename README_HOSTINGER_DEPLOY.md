# 🚀 Déploiement Lesigne sur Hostinger

## 📦 Structure du Projet

Votre projet contient **3 applications distinctes** :

```
lesigne/
├── server/          # 🔧 API Express (Backend)
├── user-panel/      # 👤 React + Vite (Frontend Utilisateurs)
└── admin-panel/     # 🛡️ React + Vite (Frontend Admin)
```

## 🎯 Stratégie de Déploiement

### Méthode Recommandée : Backend Node.js + Frontends Statiques

#### 1️⃣ Backend (Express) - Application Node.js

Dans **hPanel > Advanced > Node.js** :

1. **Créez une nouvelle application**
2. **Nom** : `lesigne-api`
3. **Framework** : **Express** (détecté automatiquement via `server/package.json`)
4. **Répertoire de travail** : `server/`
5. **Fichier de démarrage** : `src/index.js`
6. **Port** : `5000`
7. **Variables d'environnement** :
   ```env
   NODE_ENV=production
   PORT=5000
   DB_HOST=localhost
   DB_NAME=lesigne_db
   DB_USER=lesigne_user
   DB_PASSWORD=votre_mot_de_passe
   JWT_SECRET=votre_secret_jwt
   FRONTEND_URL=https://votre-domaine.com
   ```

#### 2️⃣ User Panel - Fichiers Statiques

```bash
# Build
cd user-panel
npm install
npm run build

# Copier vers public_html
cp -r dist/* ~/domains/votre-domaine.com/public_html/app/
```

**Configuration Apache** :
- Servez `public_html/app/` sur `https://app.votre-domaine.com`

#### 3️⃣ Admin Panel - Fichiers Statiques

```bash
# Build
cd admin-panel
npm install
npm run build

# Copier vers public_html
cp -r dist/* ~/domains/votre-domaine.com/public_html/admin/
```

**Configuration Apache** :
- Servez `public_html/admin/` sur `https://admin.votre-domaine.com`

## 📋 Fichiers de Configuration

J'ai créé des fichiers pour aider Hostinger à détecter chaque application :

- ✅ `server/hostinger.json` - Configuration Express
- ✅ `server/package.json` - Avec `"framework": "express"`
- ✅ `user-panel/hostinger.json` - Configuration Vite
- ✅ `user-panel/package.json` - Avec `"framework": "vite"`
- ✅ `admin-panel/hostinger.json` - Configuration Vite
- ✅ `admin-panel/package.json` - Avec `"framework": "vite"`

## 🔧 Configuration Alternative : 3 Applications Node.js

Si Hostinger vous permet de créer plusieurs applications Node.js :

### Application 1 : Backend
- **Framework** : Express
- **Répertoire** : `server/`
- **Port** : `5000`

### Application 2 : User Panel
- **Framework** : Vite
- **Répertoire** : `user-panel/`
- **Build** : `npm run build`
- **Start** : `npm run preview`
- **Port** : `3001`

### Application 3 : Admin Panel
- **Framework** : Vite
- **Répertoire** : `admin-panel/`
- **Build** : `npm run build`
- **Start** : `npm run preview`
- **Port** : `3002`

## ✅ Checklist de Déploiement

### Backend
- [ ] Application Node.js créée dans hPanel
- [ ] Framework Express sélectionné
- [ ] Répertoire : `server/`
- [ ] Variables d'environnement configurées
- [ ] Port 5000 configuré
- [ ] Test : `curl http://localhost:5000/api/health`

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

## 🎯 Pourquoi Hostinger ne Détecte pas Automatiquement ?

Hostinger cherche une **seule application** à la racine du projet. Avec un monorepo contenant 3 applications, il faut :

1. **Soit** créer 3 applications séparées dans hPanel
2. **Soit** servir les frontends comme fichiers statiques (plus simple)

## 🚀 Recommandation Finale

**Pour simplifier** :
- ✅ **Backend** : Application Node.js Express
- ✅ **Frontends** : Fichiers statiques après build

**OU** utilisez un **VPS avec Dokploy** pour gérer facilement les 3 applications.

---

**Voir aussi** :
- `DEPLOY_HOSTINGER_3_APPS.md` - Guide détaillé
- `QUICK_FIX_HOSTINGER.md` - Solution rapide
- `DEPLOY_DOKPLOY.md` - Déploiement avec Dokploy (VPS)

