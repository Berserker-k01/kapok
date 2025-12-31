# 📝 Templates de Variables d'Environnement

## Server (.env)

Créez un fichier `.env` dans `Lesignes/server/` avec le contenu suivant :

```env
# Configuration Serveur
NODE_ENV=production
PORT=5000

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=lesigne_db
# OU utiliser DATABASE_URL (prioritaire)
# DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (GÉNÉRER UN SECRET FORT ET UNIQUE)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# URLs Frontend (pour CORS)
FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# OpenAI (optionnel - pour l'assistant IA)
OPENAI_API_KEY=sk-...

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## User Panel (.env.production)

Créez un fichier `.env.production` dans `Lesignes/user-panel/` :

```env
# API Backend URL
VITE_API_URL=https://api.votre-domaine.com

# Environment
VITE_ENV=production
```

## Admin Panel (.env.production)

Créez un fichier `.env.production` dans `Lesignes/admin-panel/` :

```env
# API Backend URL
VITE_API_URL=https://api.votre-domaine.com

# Environment
VITE_ENV=production
```

## 🔐 Génération de JWT_SECRET

Pour générer un secret JWT sécurisé :

```bash
# Linux/Mac
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## ⚠️ Important

- **NE COMMITEZ JAMAIS** les fichiers `.env` dans Git
- Changez tous les mots de passe par défaut
- Utilisez des secrets forts en production
- Gardez une copie de sauvegarde de vos variables d'environnement

