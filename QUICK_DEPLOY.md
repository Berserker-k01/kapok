# ⚡ Déploiement Rapide - Hostinger

## ⚠️ Prérequis

Avant de commencer, assurez-vous que Node.js est installé :
```bash
node --version  # Doit afficher v18.x.x ou supérieur
npm --version   # Doit afficher 10.x.x ou supérieur
```

Si vous obtenez "command not found", consultez **`INSTALL_NODE_HOSTINGER.md`**

## En 3 Commandes

```bash
# 1. Upload et connexion SSH
ssh votre-utilisateur@votre-serveur.hostinger.com

# 2. Clone et déploiement
git clone https://github.com/votre-repo/lesigne.git
cd lesigne/Lesignes
chmod +x deploy.sh && ./deploy.sh

# 3. Configuration et démarrage
nano server/.env  # Configurez vos valeurs
psql -U votre_user -d lesigne_db -f server/database/schema.sql
cd server && ./start.sh
```

## Configuration Minimale Requise

### server/.env
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

### user-panel/.env
```env
VITE_API_URL=https://api.votre-domaine.com
```

### admin-panel/.env
```env
VITE_API_URL=https://api.votre-domaine.com
```

## Vérification

```bash
# Test API
curl http://localhost:5000/

# Statut PM2
pm2 status

# Logs
pm2 logs lesigne-api
```

**C'est tout ! 🎉**

Pour plus de détails: `DEPLOYMENT_HOSTINGER.md`

