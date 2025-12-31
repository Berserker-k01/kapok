# 🔧 Résoudre "Framework non pris en charge" - Hostinger

## 🎯 Problème

Hostinger affiche : **"Framework non pris en charge ou structure de projet non valide"**

Cela signifie que Hostinger ne détecte pas automatiquement votre projet Node.js.

## ✅ Solutions

### Solution 1 : Configuration Manuelle (Recommandée)

#### Dans le Panneau Hostinger (hPanel)

1. **Allez dans Advanced > Node.js**
2. **Activez Node.js** version **18.x**
3. **Configurez** :
   - **Répertoire de travail** : `server/`
   - **Fichier de démarrage** : `src/index.js`
   - **Commande de démarrage** : `node src/index.js`
   - **Port** : `5000`

4. **Variables d'environnement** (dans le panneau Node.js) :
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=localhost
   DB_NAME=lesigne_db
   DB_USER=lesigne_user
   DB_PASSWORD=votre_mot_de_passe
   JWT_SECRET=votre_secret_jwt
   FRONTEND_URL=https://votre-domaine.com
   ```

### Solution 2 : Utiliser le Point d'Entrée à la Racine

J'ai créé `index.js` à la racine qui redirige vers `server/`. 

**Dans Hostinger, configurez** :
- **Fichier de démarrage** : `index.js` (à la racine)
- **Répertoire de travail** : `.` (racine)

### Solution 3 : Déploiement Manuel via SSH (Meilleure Option)

L'auto-déploiement Hostinger peut être limité. Utilisez SSH :

```bash
# 1. Connexion SSH
ssh votre-utilisateur@votre-serveur.hostinger.com

# 2. Cloner ou uploader le projet
cd ~/domains/votre-domaine.com
git clone https://github.com/votre-repo/lesigne.git .

# 3. Installer
cd server
npm install --production

# 4. Configurer .env
cp .env.example .env
nano .env

# 5. Démarrer avec PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Solution 4 : Utiliser un VPS avec Dokploy

Pour éviter les limitations de l'hébergement partagé :

1. **Commandez un VPS** sur Hostinger
2. **Installez Dokploy** (voir `DEPLOY_DOKPLOY.md`)
3. **Déployez via Dokploy** (beaucoup plus simple)

## 📋 Fichiers Créés pour Hostinger

J'ai créé ces fichiers pour aider Hostinger à détecter le projet :

- ✅ `index.js` - Point d'entrée à la racine
- ✅ `.nvmrc` - Version Node.js
- ✅ `.node-version` - Version Node.js
- ✅ `hostinger.json` - Configuration Hostinger
- ✅ `package.json` - Mis à jour avec `main` et `start`

## 🔍 Vérification

### Vérifier que Hostinger détecte Node.js

1. Dans hPanel > Node.js
2. Vérifiez que Node.js est **activé**
3. Vérifiez que la version est **18.x**
4. Vérifiez que le **répertoire de travail** est correct

### Tester Localement

```bash
# Tester le point d'entrée
node index.js

# Devrait démarrer le serveur sur le port 5000
```

## 🚨 Si Ça Ne Fonctionne Toujours Pas

### Option A : Contactez le Support Hostinger

Expliquez :
- Type de projet : **Node.js/Express monorepo**
- Structure : Serveur dans `server/`
- Point d'entrée : `server/src/index.js` ou `index.js` (racine)
- Version Node.js : **18.x**

### Option B : Utilisez un VPS

Les hébergements partagés ont souvent des limitations. Un **VPS** vous donne :
- ✅ Contrôle total
- ✅ Pas de limitations de structure
- ✅ Meilleure performance
- ✅ Support Docker (Dokploy)

**Recommandation** : VPS 2 (4 vCPU, 4GB RAM) + Dokploy

## 📚 Documentation

- **Déploiement manuel** : `DEPLOYMENT_HOSTINGER.md`
- **Déploiement Dokploy** : `DEPLOY_DOKPLOY.md`
- **Dépannage** : `TROUBLESHOOTING_DEPLOYMENT.md`

---

**En résumé** : Configurez manuellement dans le panneau Hostinger ou utilisez SSH/VPS pour plus de contrôle.


