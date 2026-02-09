# 🖼️ Guide de Résolution - Images Non Persistantes

## Problème
Les images uploadées (produits, logos, bannières) disparaissent après un certain temps ou après redémarrage du serveur.

## Diagnostic

### Étape 1: Exécuter le script de diagnostic

```bash
cd server
node diagnose-uploads.js
```

Ce script va vérifier:
- ✅ Si le dossier `uploads` existe
- ✅ Si vous avez les permissions d'écriture
- ✅ Si les fichiers peuvent être créés et lus
- ✅ L'environnement et la configuration

### Étape 2: Vérifier les logs du serveur

Après avoir uploadé une image, vérifiez les logs:

```
[Upload] File received: image.jpg Type: image/jpeg
[Upload] Saving file to: /path/to/uploads
[Upload] Generated filename: 1234567890-uuid.jpg
[Product] ✅ Image uploaded:
[Product]    Filename: 1234567890-uuid.jpg
[Product]    Path: /path/to/uploads/1234567890-uuid.jpg
[Product]    URL: https://e-assime.com/api/uploads/1234567890-uuid.jpg
```

Si vous ne voyez pas ces logs, l'upload n'a pas fonctionné.

## Causes Possibles

### 1. Hébergement avec Système de Fichiers Éphémère

**Symptômes:**
- Les images fonctionnent juste après l'upload
- Elles disparaissent après redémarrage du serveur
- Le dossier `uploads` se vide régulièrement

**Hébergements concernés:**
- Heroku (système de fichiers éphémère)
- Certains hébergements cloud
- Containers Docker sans volumes persistants

**Solution:** Utiliser un stockage externe (voir section Solutions)

### 2. Permissions Insuffisantes

**Symptômes:**
- Erreur lors de l'upload
- Logs montrent "Permission denied"
- Le dossier existe mais n'est pas accessible en écriture

**Solution:**
```bash
# Sur le serveur
chmod 755 server/uploads
# Ou
chmod 775 server/uploads
```

### 3. Chemin Incorrect

**Symptômes:**
- Les images s'uploadent mais ne s'affichent pas
- Erreur 404 lors de l'accès à l'image
- L'URL de l'image est incorrecte

**Solution:** Vérifier la variable `API_URL` dans `.env`

```bash
# .env
API_URL=https://e-assime.com/api
```

### 4. Dossier Non Déployé

**Symptômes:**
- Fonctionne en local mais pas en production
- Le dossier `uploads` n'existe pas sur le serveur

**Solution:** S'assurer que le dossier est déployé (voir section Déploiement)

## Solutions

### Solution 1: Stockage Cloud (Recommandé pour Production)

#### Option A: Cloudinary (Gratuit jusqu'à 25GB)

1. **Installer le package:**
```bash
npm install cloudinary multer-storage-cloudinary
```

2. **Créer un compte sur cloudinary.com**

3. **Configurer dans `.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Modifier `upload.js`:**
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'e-assime',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    }
});
```

#### Option B: AWS S3

1. **Installer le package:**
```bash
npm install aws-sdk multer-s3
```

2. **Configurer dans `.env`:**
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=e-assime-uploads
```

3. **Modifier `upload.js`:**
```javascript
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
```

### Solution 2: Volume Docker Persistant

Si vous utilisez Docker:

```yaml
# docker-compose.yml
services:
  server:
    volumes:
      - ./uploads:/app/uploads  # Volume persistant
```

### Solution 3: Stockage Local Persistant (Hostinger/cPanel)

1. **Créer le dossier uploads avec les bonnes permissions:**
```bash
mkdir -p server/uploads
chmod 755 server/uploads
```

2. **Ajouter .gitkeep pour versionner le dossier:**
```bash
touch server/uploads/.gitkeep
git add server/uploads/.gitkeep
git commit -m "Add uploads directory"
```

3. **S'assurer que le dossier est déployé:**
- Via FTP: Uploader le dossier `uploads`
- Via Git: Le dossier sera créé automatiquement

4. **Vérifier les permissions sur le serveur:**
```bash
# Via SSH
ls -la server/uploads
# Devrait afficher: drwxr-xr-x
```

## Déploiement

### Via Git

```bash
# 1. Commit les changements
git add .
git commit -m "Fix image persistence"
git push

# 2. Sur le serveur
git pull
npm install
pm2 restart all
```

### Via FTP

1. Uploader le dossier `server/uploads`
2. Uploader les fichiers modifiés:
   - `server/src/middleware/upload.js`
   - `server/src/controllers/productController.js`
3. Redémarrer le serveur

## Vérification

### 1. Tester l'upload

1. Créer un produit avec une image
2. Vérifier les logs du serveur
3. Vérifier que le fichier existe:
```bash
ls -la server/uploads
```

### 2. Tester la persistance

1. Uploader une image
2. Noter le nom du fichier
3. Redémarrer le serveur:
```bash
pm2 restart all
```
4. Vérifier que le fichier existe toujours:
```bash
ls -la server/uploads/[nom-du-fichier]
```

### 3. Tester l'accès public

1. Uploader une image
2. Accéder à l'URL:
```
https://e-assime.com/api/uploads/[nom-du-fichier]
```
3. L'image devrait s'afficher

## Monitoring

### Logs à surveiller

```bash
# Voir les logs en temps réel
pm2 logs

# Chercher les logs d'upload
pm2 logs | grep Upload
pm2 logs | grep Product
```

### Commandes utiles

```bash
# Vérifier l'espace disque
df -h

# Compter les fichiers dans uploads
ls -1 server/uploads | wc -l

# Voir la taille du dossier uploads
du -sh server/uploads

# Trouver les gros fichiers
find server/uploads -type f -size +1M -exec ls -lh {} \;
```

## Recommandations

### Pour le Développement
- ✅ Stockage local suffit
- ✅ Utiliser le système actuel avec logs

### Pour la Production
- ✅ **Recommandé:** Cloudinary ou AWS S3
- ⚠️ Stockage local seulement si hébergement persistant
- ❌ Éviter le stockage local sur Heroku/containers éphémères

### Sécurité
- ✅ Limiter la taille des fichiers (actuellement 5MB)
- ✅ Vérifier le type MIME
- ✅ Générer des noms de fichiers uniques
- ✅ Nettoyer régulièrement les fichiers non utilisés

## Support

Si le problème persiste:

1. Exécuter `node diagnose-uploads.js`
2. Copier les logs complets
3. Vérifier l'hébergement utilisé
4. Vérifier les permissions du dossier
5. Considérer le passage à Cloudinary

## Fichiers Modifiés

- ✅ `server/src/middleware/upload.js` - Logs et vérifications
- ✅ `server/src/controllers/productController.js` - Logs détaillés
- ✅ `server/uploads/.gitkeep` - Versionner le dossier
- ✅ `server/diagnose-uploads.js` - Script de diagnostic
