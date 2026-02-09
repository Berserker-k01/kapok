# 🚀 Installation Cloudinary - Guide Rapide

## ✅ Ce qui a été fait

Tous les fichiers ont été modifiés pour utiliser Cloudinary au lieu du stockage local :

### Fichiers Modifiés
- ✅ `server/src/middleware/uploadCloudinary.js` - Nouveau middleware Cloudinary
- ✅ `server/src/routes/products.js` - Routes produits avec Cloudinary
- ✅ `server/src/routes/shops.js` - Routes boutiques avec Cloudinary
- ✅ `server/src/controllers/productController.js` - Controller produits
- ✅ `server/src/controllers/shopController.js` - Controller boutiques
- ✅ `server/.env` - Template configuration Cloudinary

### Package Installé
- ✅ `cloudinary` - SDK officiel Cloudinary

## 🔧 Configuration Requise

### Étape 1: Créer un compte Cloudinary (GRATUIT)

1. **Aller sur:** https://cloudinary.com/users/register_free
2. **Remplir le formulaire:**
   - Email
   - Mot de passe
   - Nom de votre cloud (ex: `e-assime`)
3. **Vérifier votre email**
4. **Se connecter**

### Étape 2: Récupérer vos Credentials

1. **Aller sur le Dashboard:** https://cloudinary.com/console
2. **Copier les informations suivantes:**
   - `Cloud Name` (ex: `dxxxxxxxx`)
   - `API Key` (ex: `123456789012345`)
   - `API Secret` (ex: `abcdefghijklmnopqrstuvwxyz`)

### Étape 3: Configurer le fichier .env

Ouvrir `server/.env` et remplacer les valeurs:

```env
# Cloudinary (Stockage d'images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name_ici
CLOUDINARY_API_KEY=votre_api_key_ici
CLOUDINARY_API_SECRET=votre_api_secret_ici
```

**Exemple avec de vraies valeurs:**
```env
CLOUDINARY_CLOUD_NAME=e-assime
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

### Étape 4: Redémarrer le serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis redémarrer
cd server
npm run dev
```

### Étape 5: Vérifier que ça fonctionne

Vous devriez voir ces logs au démarrage:

```
[Cloudinary] Configuration loaded
[Cloudinary] Cloud Name: ✅ Set
[Cloudinary] API Key: ✅ Set
[Cloudinary] API Secret: ✅ Set
[Upload] ✅ Uploads directory is writable
```

## 🧪 Test

### Test 1: Uploader une image de produit

1. Créer un nouveau produit
2. Uploader une image
3. Vérifier les logs:

```
[Upload] File received: image.jpg Type: image/jpeg
[Cloudinary] Uploading: 1234567890-uuid.jpg
[Cloudinary] ✅ Upload successful
[Cloudinary]    URL: https://res.cloudinary.com/e-assime/image/upload/...
[Product] ✅ Image uploaded to Cloudinary
```

4. L'image devrait s'afficher immédiatement
5. L'URL devrait commencer par `https://res.cloudinary.com/`

### Test 2: Vérifier la persistance

1. Uploader une image
2. Redémarrer le serveur
3. L'image devrait toujours être visible ✅

### Test 3: Uploader logo/bannière boutique

1. Aller dans Paramètres de boutique
2. Uploader un logo ou une bannière
3. Vérifier les logs:

```
[Shop] ✅ Logo uploaded to Cloudinary: https://res.cloudinary.com/...
```

## 📊 Avantages Cloudinary

### Avant (Stockage Local)
- ❌ Images disparaissent après redémarrage
- ❌ Pas de CDN (lent pour utilisateurs lointains)
- ❌ Pas d'optimisation automatique
- ❌ Gestion manuelle du stockage

### Après (Cloudinary)
- ✅ **100% persistant** - Images jamais perdues
- ✅ **CDN global** - Rapide partout dans le monde
- ✅ **Optimisation auto** - Format WebP, compression, etc.
- ✅ **Gratuit jusqu'à 25GB** - Largement suffisant
- ✅ **Transformations** - Resize, crop, etc. à la volée
- ✅ **Backup automatique** - Sécurité maximale

## 🎯 Organisation des Images

Les images sont organisées dans Cloudinary:

```
e-assime/
├── products/          # Images de produits
├── logo/             # Logos de boutiques
└── banner/           # Bannières de boutiques
```

## 🔍 Monitoring

### Voir vos images sur Cloudinary

1. **Dashboard:** https://cloudinary.com/console/media_library
2. **Dossier e-assime:** Toutes vos images
3. **Statistiques:** Utilisation, bande passante, etc.

### Logs du serveur

```bash
# Voir les logs en temps réel
pm2 logs

# Filtrer les logs Cloudinary
pm2 logs | grep Cloudinary
pm2 logs | grep Upload
```

## ⚠️ Troubleshooting

### Erreur: "Cloud Name not set"

**Solution:** Vérifier le fichier `.env`
```bash
cat server/.env | grep CLOUDINARY
```

### Erreur: "Invalid credentials"

**Solution:** Vérifier que les credentials sont corrects
- Pas d'espaces avant/après
- Copier-coller depuis le dashboard Cloudinary

### Images ne s'uploadent pas

**Solution:** Vérifier les logs
```bash
pm2 logs | grep -A 5 "Upload"
```

### Quota dépassé (après 25GB)

**Solution:** 
1. Passer au plan payant (~$0.10/GB)
2. Ou nettoyer les anciennes images
3. Ou utiliser AWS S3

## 📈 Limites du Plan Gratuit

| Ressource | Limite Gratuite |
|-----------|----------------|
| **Stockage** | 25 GB |
| **Bande passante** | 25 GB/mois |
| **Transformations** | 25 000/mois |
| **Vidéos** | 500 MB |

**Pour e-Assime:** Largement suffisant pour démarrer !

## 🚀 Déploiement

### Sur Hostinger

1. **Uploader les fichiers modifiés:**
   - `server/src/middleware/uploadCloudinary.js`
   - `server/src/routes/products.js`
   - `server/src/routes/shops.js`
   - `server/src/controllers/productController.js`
   - `server/src/controllers/shopController.js`

2. **Mettre à jour `.env` sur le serveur:**
```bash
# Via SSH ou File Manager
nano server/.env
# Ajouter les credentials Cloudinary
```

3. **Redémarrer:**
```bash
pm2 restart all
```

### Vérification

```bash
# Vérifier les logs
pm2 logs | head -20

# Devrait afficher:
# [Cloudinary] Configuration loaded
# [Cloudinary] Cloud Name: ✅ Set
```

## ✅ Checklist Finale

- [ ] Compte Cloudinary créé
- [ ] Credentials copiés
- [ ] `.env` mis à jour
- [ ] Serveur redémarré
- [ ] Logs vérifiés (✅ Set)
- [ ] Test upload produit
- [ ] Test upload logo/bannière
- [ ] Images persistent après redémarrage

## 🎉 C'est Terminé !

Vos images sont maintenant:
- ✅ 100% persistantes
- ✅ Optimisées automatiquement
- ✅ Servies via CDN global
- ✅ Sauvegardées en sécurité

**Profitez de Cloudinary !** 🚀
