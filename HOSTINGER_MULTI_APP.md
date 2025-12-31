# 🎯 Déploiement Multi-Applications sur Hostinger

Votre projet contient **3 applications distinctes** :
1. **server/** - API Express (Backend)
2. **user-panel/** - React + Vite (Frontend Utilisateurs)
3. **admin-panel/** - React + Vite (Frontend Admin)

Hostinger doit les déployer **séparément** ou vous devez structurer différemment.

## 🎯 Solution 1 : Déploiement Séparé (Recommandé)

### Application 1 : API Backend (Express)

**Dans hPanel > Node.js** :

- **Nom** : `lesigne-api`
- **Framework** : Express
- **Répertoire** : `server/`
- **Fichier de démarrage** : `src/index.js`
- **Port** : `5000`

### Application 2 : User Panel (React/Vite)

**Dans hPanel > Node.js** :

- **Nom** : `lesigne-user-panel`
- **Framework** : Vite (ou React)
- **Répertoire** : `user-panel/`
- **Build Command** : `npm run build`
- **Start Command** : `npm run preview` (ou servez `dist/`)

**OU** servez les fichiers statiques via Apache/Nginx après build.

### Application 3 : Admin Panel (React/Vite)

**Dans hPanel > Node.js** :

- **Nom** : `lesigne-admin-panel`
- **Framework** : Vite (ou React)
- **Répertoire** : `admin-panel/`
- **Build Command** : `npm run build`
- **Start Command** : `npm run preview` (ou servez `dist/`)

## 🎯 Solution 2 : Structure pour Hostinger Auto-Detect

Créez des fichiers de configuration à la racine de chaque application :

### Pour server/ (Express)

Le `server/package.json` est déjà correct avec Express.

### Pour user-panel/ (React/Vite)

Ajoutez dans `user-panel/package.json` :

```json
{
  "name": "lesigne-user-panel",
  "type": "module",
  "framework": "vite",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "vite build",
    "preview": "vite preview --port 3001"
  }
}
```

### Pour admin-panel/ (React/Vite)

Ajoutez dans `admin-panel/package.json` :

```json
{
  "name": "lesigne-admin-panel",
  "type": "module",
  "framework": "vite",
  "scripts": {
    "dev": "vite --port 3002",
    "build": "vite build",
    "preview": "vite preview --port 3002"
  }
}
```

## 🎯 Solution 3 : Build et Servir les Frontends Statiquement

### Étape 1 : Build des Frontends

```bash
# Build user-panel
cd user-panel
npm install
npm run build
# Crée user-panel/dist/

# Build admin-panel
cd ../admin-panel
npm install
npm run build
# Crée admin-panel/dist/
```

### Étape 2 : Configuration Apache/Nginx

Servez les `dist/` comme fichiers statiques :

- `user-panel/dist/` → `https://app.votre-domaine.com`
- `admin-panel/dist/` → `https://admin.votre-domaine.com`
- `server/` → API sur port 5000

### Étape 3 : Configuration .htaccess

```apache
# User Panel
<VirtualHost *:80>
    ServerName app.votre-domaine.com
    DocumentRoot /home/user/lesigne/user-panel/dist
</VirtualHost>

# Admin Panel
<VirtualHost *:80>
    ServerName admin.votre-domaine.com
    DocumentRoot /home/user/lesigne/admin-panel/dist
</VirtualHost>
```

## 🎯 Solution 4 : Structure Alternative (Recommandée pour Hostinger)

Réorganisez pour que Hostinger comprenne :

```
public_html/
├── api/              # Lien vers server/ ou copie
├── app/              # user-panel/dist/
└── admin/            # admin-panel/dist/
```

### Script de Réorganisation

```bash
# Sur le serveur Hostinger
cd ~/domains/votre-domaine.com/public_html

# Créer les dossiers
mkdir -p api app admin

# Copier ou lier
cp -r ~/lesigne/server/* api/
cp -r ~/lesigne/user-panel/dist/* app/
cp -r ~/lesigne/admin-panel/dist/* admin/

# Configurer Node.js pour api/
# Dans hPanel : Répertoire = api/, Start = node src/index.js
```

## 📋 Configuration Recommandée

### Backend (Express)
- **Détecté automatiquement** si `server/package.json` contient Express
- **Ou sélectionnez manuellement** Express dans hPanel

### Frontends (React/Vite)
- **Option A** : Build et servez comme fichiers statiques (plus simple)
- **Option B** : Configurez Vite dans hPanel (si supporté)
- **Option C** : Utilisez un VPS avec Dokploy (meilleure solution)

## ✅ Checklist Multi-Applications

- [ ] **Backend** : Express détecté/configuré dans hPanel
- [ ] **User Panel** : Buildé (`user-panel/dist/`)
- [ ] **Admin Panel** : Buildé (`admin-panel/dist/`)
- [ ] **Serving** : Frontends servis comme fichiers statiques
- [ ] **API** : Accessible sur port 5000
- [ ] **CORS** : Configuré pour les 3 domaines

## 🎯 Recommandation Finale

**Pour simplifier** :
1. ✅ **Backend** : Déployez `server/` comme application Express Node.js
2. ✅ **Frontends** : Buildez et servez `dist/` comme fichiers statiques via Apache
3. ✅ **OU** : Utilisez un **VPS avec Dokploy** pour tout gérer facilement

---

**Le problème** : Hostinger cherche une seule application, mais vous en avez 3. Il faut soit les configurer séparément, soit servir les frontends comme fichiers statiques.

