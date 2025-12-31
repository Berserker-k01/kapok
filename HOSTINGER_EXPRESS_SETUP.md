# 🚀 Configuration Hostinger pour Express

Hostinger prend en charge **Express** ! Voici comment configurer votre projet.

## ✅ Configuration dans hPanel

### Étape 1 : Activer Node.js

1. Allez dans **hPanel > Advanced > Node.js**
2. **Activez Node.js** version **18.x**
3. **Sélectionnez le framework** : **Express**

### Étape 2 : Configuration de l'Application

Dans le panneau Node.js, configurez :

**Répertoire de travail** : `server/`

**Fichier de démarrage** : `src/index.js`

**Commande de démarrage** : 
```bash
node src/index.js
```

**Port** : `5000`

### Étape 3 : Variables d'Environnement

Ajoutez ces variables dans le panneau Node.js :

```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe_securise
JWT_SECRET=votre_secret_jwt_tres_long
FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

### Étape 4 : Installer les Dépendances

Hostinger devrait installer automatiquement, mais si besoin :

```bash
cd server
npm install --production
```

## 🔍 Vérification

### Tester que l'API fonctionne

```bash
# Depuis le panneau Hostinger ou SSH
curl http://localhost:5000/

# Devrait retourner : "API Assimε est en ligne ! 🚀"
```

### Vérifier les logs

Dans hPanel > Node.js > Logs, vous devriez voir :
```
🚀 Serveur Assimε démarré sur le port 5000
📊 Mode: production
🔗 API disponible sur: http://localhost:5000/api
```

## 📋 Structure Attendue par Hostinger

Hostinger cherche généralement :

```
votre-projet/
├── package.json          ✅ (avec "express" dans dependencies)
├── server/
│   ├── package.json      ✅ (framework Express)
│   ├── src/
│   │   └── index.js      ✅ (point d'entrée)
│   └── node_modules/     ✅ (après npm install)
```

## 🎯 Points Importants

### 1. Framework Express Détecté

Hostinger devrait détecter automatiquement Express car :
- ✅ `server/package.json` contient `"express"` dans dependencies
- ✅ Le script `start` pointe vers `node src/index.js`
- ✅ Le fichier `src/index.js` utilise Express

### 2. Si Hostinger Ne Détecte Pas

**Option A** : Sélectionnez manuellement **Express** dans le panneau

**Option B** : Créez un `package.json` à la racine qui pointe vers server :

```json
{
  "name": "lesigne-platform",
  "version": "1.0.0",
  "main": "server/src/index.js",
  "scripts": {
    "start": "cd server && node src/index.js"
  },
  "dependencies": {
    "express": "^4.21.2"
  }
}
```

### 3. Pour les Frontends (React/Vite)

Les frontends (user-panel et admin-panel) doivent être **buildés** et servis comme fichiers statiques :

```bash
# Build des frontends
cd user-panel && npm run build
cd ../admin-panel && npm run build
```

Puis servez les dossiers `dist/` via Apache/Nginx.

## 🐛 Dépannage

### Erreur : "Express not found"

```bash
cd server
npm install express --save
```

### Erreur : "Cannot find module"

```bash
cd server
npm install --production
```

### Erreur : "Port already in use"

Changez le port dans `.env` :
```env
PORT=5001
```

Puis redémarrez dans le panneau Hostinger.

## ✅ Checklist

- [ ] Node.js 18.x activé dans hPanel
- [ ] Framework Express sélectionné
- [ ] Répertoire de travail : `server/`
- [ ] Fichier de démarrage : `src/index.js`
- [ ] Port : `5000`
- [ ] Variables d'environnement configurées
- [ ] Dépendances installées (`npm install` dans server/)
- [ ] Base de données PostgreSQL configurée
- [ ] Test de l'API réussi

## 🎉 Une Fois Configuré

Votre API devrait être accessible sur :
- **Local** : `http://localhost:5000`
- **Public** : `https://votre-domaine.com:5000` (selon votre config)

---

**Note** : Si l'auto-détection ne fonctionne toujours pas, sélectionnez manuellement **Express** dans le panneau Hostinger.

