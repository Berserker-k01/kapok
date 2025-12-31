# 🚀 Guide Rapide - Déploiement Hostinger

## ⚠️ Erreur "Framework non pris en charge"

Si vous voyez cette erreur, suivez ces étapes :

## ✅ Solution Rapide

### Option 1 : Configuration Manuelle (5 minutes)

1. **Dans hPanel > Advanced > Node.js** :
   - ✅ Activez Node.js **18.x**
   - ✅ Répertoire de travail : `server/`
   - ✅ Fichier de démarrage : `src/index.js`
   - ✅ Commande : `node src/index.js`
   - ✅ Port : `5000`

2. **Variables d'environnement** (dans le panneau Node.js) :
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=localhost
   DB_NAME=lesigne_db
   DB_USER=lesigne_user
   DB_PASSWORD=votre_mot_de_passe
   JWT_SECRET=votre_secret_jwt
   ```

3. **Démarrer** l'application depuis le panneau

### Option 2 : Utiliser index.js à la Racine

J'ai créé `index.js` à la racine. Dans Hostinger :

- ✅ Fichier de démarrage : `index.js` (racine)
- ✅ Répertoire de travail : `.` (racine)

### Option 3 : Déploiement SSH (Recommandé)

```bash
# Connexion SSH
ssh votre-utilisateur@votre-serveur.hostinger.com

# Aller dans le dossier du domaine
cd ~/domains/votre-domaine.com/public_html

# Cloner ou uploader
git clone votre-repo .

# Installer
cd server
npm install --production

# Configurer
cp .env.example .env
nano .env

# Démarrer avec PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
```

## 📋 Fichiers Créés

Pour aider Hostinger à détecter le projet :

- ✅ `index.js` - Point d'entrée à la racine
- ✅ `.nvmrc` - Version Node.js
- ✅ `.node-version` - Version Node.js  
- ✅ `package.json` - Mis à jour avec `main` et `start`
- ✅ `hostinger.json` - Configuration Hostinger

## 🎯 Recommandation

**Pour éviter les problèmes** : Utilisez un **VPS** avec **Dokploy** (voir `DEPLOY_DOKPLOY.md`)

C'est beaucoup plus simple et vous avez un contrôle total !

---

**Besoin d'aide ?** Consultez `HOSTINGER_AUTO_DEPLOY.md` pour plus de détails.


