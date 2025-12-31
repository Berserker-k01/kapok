# 📦 Guide de Déploiement Rapide

## 🚀 Déploiement sur Hostinger - Version Rapide

### Prérequis
- Accès SSH à votre serveur Hostinger
- Node.js 18+ installé
- PostgreSQL installé et configuré
- PM2 installé (`npm install -g pm2`)

### Déploiement en 5 étapes

#### 1. Upload des fichiers
```bash
# Via Git (recommandé)
git clone https://github.com/votre-repo/lesigne.git
cd lesigne/Lesignes
```

#### 2. Configuration
```bash
# Copier et configurer les fichiers .env
cp server/.env.example server/.env
cp user-panel/.env.example user-panel/.env
cp admin-panel/.env.example admin-panel/.env

# Éditer avec vos valeurs
nano server/.env
```

#### 3. Installation et Build
```bash
# Exécuter le script de déploiement
chmod +x deploy.sh
./deploy.sh
```

#### 4. Base de données
```bash
# Initialiser la base de données
psql -U votre_user -d lesigne_db -f server/database/schema.sql
psql -U votre_user -d lesigne_db -f server/database/migration_subscription_payments.sql
```

#### 5. Démarrage
```bash
# Démarrer le serveur
cd server
chmod +x start.sh
./start.sh
```

### Configuration Apache

Assurez-vous que votre Virtual Host est configuré pour :
- Servir les fichiers statiques depuis `user-panel/dist/` et `admin-panel/dist/`
- Proxifier `/api` vers `http://localhost:5000/api`

Le fichier `.htaccess` est déjà configuré pour cela.

### Vérification

- API: `curl http://localhost:5000/`
- User Panel: Visitez votre domaine
- Admin Panel: Visitez `/admin/`

### Commandes utiles

```bash
# Voir les logs
pm2 logs lesigne-api

# Redémarrer
pm2 restart lesigne-api

# Statut
pm2 status
```

Pour plus de détails, consultez `DEPLOYMENT_HOSTINGER.md`

