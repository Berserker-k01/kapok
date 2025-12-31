# 🚀 Déploiement Automatique Hostinger

Si vous recevez l'erreur **"Framework non pris en charge ou structure de projet non valide"**, c'est que Hostinger ne détecte pas automatiquement votre projet Node.js.

## 🔧 Solution 1 : Configuration Manuelle dans Hostinger

### Étape 1 : Via le Panneau Hostinger

1. **Connectez-vous à hPanel**
2. Allez dans **Advanced** > **Node.js** (ou **Node.js Selector**)
3. **Activez Node.js** et sélectionnez la version **18.x**
4. **Définissez le répertoire de travail** : `server/`
5. **Commande de démarrage** : `node src/index.js`
6. **Port** : `5000`

### Étape 2 : Configuration des Variables d'Environnement

Dans le panneau Node.js, ajoutez les variables :

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

## 🔧 Solution 2 : Créer un Point d'Entrée à la Racine

Hostinger cherche parfois un `package.json` avec un script `start` à la racine. Créons un wrapper :

### Option A : Modifier package.json racine

```json
{
  "name": "lesigne-platform",
  "version": "1.0.0",
  "main": "server/src/index.js",
  "scripts": {
    "start": "cd server && node src/index.js",
    "install": "cd server && npm install --production"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### Option B : Créer un fichier index.js à la racine

Créez `index.js` à la racine :

```javascript
// Point d'entrée pour Hostinger
process.chdir(__dirname + '/server');
require('./src/index.js');
```

## 🔧 Solution 3 : Déploiement via Git + SSH (Recommandé)

Au lieu d'utiliser l'interface automatique, déployez manuellement :

### 1. Upload via Git

```bash
# Sur votre serveur Hostinger
cd ~/domains/votre-domaine.com/public_html
git clone https://github.com/votre-repo/lesigne.git .
```

### 2. Configuration

```bash
# Installer les dépendances
cd server
npm install --production

# Créer .env
cp .env.example .env
nano .env  # Configurer
```

### 3. Démarrer avec PM2

```bash
# Installer PM2
npm install -g pm2

# Démarrer
cd server
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔧 Solution 4 : Structure Alternative pour Hostinger

Si Hostinger ne reconnaît toujours pas, créez cette structure :

```
public_html/
├── api/                    # Lien symbolique vers server/
│   └── (contenu de server/)
├── app/                    # user-panel/dist/
├── admin/                  # admin-panel/dist/
└── .htaccess              # Configuration Apache
```

### Script de Setup

```bash
# Créer les liens symboliques
ln -s ~/lesigne/server ~/public_html/api
ln -s ~/lesigne/user-panel/dist ~/public_html/app
ln -s ~/lesigne/admin-panel/dist ~/public_html/admin
```

## 📋 Checklist de Vérification

Avant de déployer, vérifiez :

- [ ] `server/package.json` existe et a un script `start`
- [ ] `server/src/index.js` existe
- [ ] Node.js 18+ est activé dans Hostinger
- [ ] Le répertoire de travail est défini (`server/`)
- [ ] Les variables d'environnement sont configurées
- [ ] Le port est correct (5000)
- [ ] PostgreSQL est configuré

## 🎯 Solution Recommandée

**Pour éviter les problèmes avec l'auto-détection Hostinger :**

1. ✅ **Utilisez le déploiement manuel via SSH** (Solution 3)
2. ✅ **Ou utilisez Dokploy sur un VPS** (beaucoup plus simple)
3. ✅ **Ou créez un point d'entrée à la racine** (Solution 2)

## 🐛 Si l'Erreur Persiste

1. **Vérifiez les logs** dans le panneau Hostinger
2. **Contactez le support Hostinger** avec :
   - Type de projet : Node.js/Express
   - Structure : Monorepo avec serveur dans `server/`
   - Point d'entrée : `server/src/index.js`
3. **Utilisez un VPS** au lieu d'un hébergement partagé (plus de contrôle)

---

**Note** : L'hébergement partagé Hostinger peut avoir des limitations pour les applications Node.js complexes. Un VPS est recommandé pour ce type de projet.

