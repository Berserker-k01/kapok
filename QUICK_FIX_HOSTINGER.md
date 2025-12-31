# ⚡ Solution Rapide - Hostinger Multi-Applications

## 🎯 Le Problème

Hostinger ne détecte pas automatiquement vos **3 applications** :
- `server/` (Express)
- `user-panel/` (React/Vite)
- `admin-panel/` (React/Vite)

## ✅ Solution Rapide

### Option 1 : Configuration Manuelle dans hPanel (5 minutes)

#### Application 1 : Backend Express

Dans **hPanel > Advanced > Node.js** :

1. **Créez une nouvelle application Node.js**
2. **Nom** : `lesigne-api`
3. **Framework** : Sélectionnez **Express**
4. **Répertoire de travail** : `server/`
5. **Fichier de démarrage** : `src/index.js`
6. **Port** : `5000`

#### Application 2 : User Panel (Optionnel - ou servez comme fichiers statiques)

**Option A : Comme Application Node.js**
- **Framework** : Sélectionnez **Vite**
- **Répertoire** : `user-panel/`
- **Build** : `npm run build`
- **Start** : `npm run preview`

**Option B : Comme Fichiers Statiques (Recommandé)**
```bash
cd user-panel
npm run build
# Copiez dist/ vers public_html/app/
```

#### Application 3 : Admin Panel

Même chose que User Panel, mais :
- **Répertoire** : `admin-panel/`
- **Dossier** : `public_html/admin/`

### Option 2 : Servir les Frontends comme Fichiers Statiques

C'est la méthode la plus simple :

```bash
# 1. Build des frontends
cd user-panel && npm run build
cd ../admin-panel && npm run build

# 2. Copier vers public_html
cp -r user-panel/dist/* ~/public_html/app/
cp -r admin-panel/dist/* ~/public_html/admin/

# 3. Configurer seulement le backend en Node.js
# Dans hPanel : Express, répertoire server/, port 5000
```

## 📋 Fichiers Créés

J'ai créé des fichiers `hostinger.json` dans chaque dossier pour aider la détection :

- ✅ `server/hostinger.json` - Configuration Express
- ✅ `user-panel/hostinger.json` - Configuration Vite
- ✅ `admin-panel/hostinger.json` - Configuration Vite

## 🎯 Recommandation

**Pour simplifier** :
1. ✅ **Backend** : Application Node.js Express dans hPanel
2. ✅ **Frontends** : Buildez et servez comme fichiers statiques

**OU** utilisez un **VPS avec Dokploy** (beaucoup plus simple pour 3 applications).

---

**Voir** `DEPLOY_HOSTINGER_3_APPS.md` pour le guide complet.

