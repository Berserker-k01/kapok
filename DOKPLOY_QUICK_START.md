# ⚡ Déploiement Rapide avec Dokploy - Guide Express

Guide ultra-rapide pour déployer Lesigne avec Dokploy en 15 minutes.

## 🎯 Vue d'Ensemble

3 applications à déployer :
1. **Backend API** (server/)
2. **User Panel** (user-panel/)
3. **Admin Panel** (admin-panel/)

---

## 📦 Étape 1 : Installer Dokploy (2 min)

```bash
ssh root@votre-ip-vps
curl -fsSL https://get.dokploy.com | sh
```

Accédez : `http://votre-ip:3000` et créez votre compte.

---

## 🗄️ Étape 2 : Créer PostgreSQL (3 min)

Dans Dokploy :
1. **New Application** → **PostgreSQL**
2. **Name** : `lesigne-postgres`
3. **Database** : `lesigne_db`
4. **User** : `lesigne_user`
5. **Password** : (générez-en un)
6. **Deploy**

**Notez** : Host = `lesigne-postgres`, Port = `5432`

---

## 🔧 Étape 3 : Backend API (5 min)

### Dans Dokploy

1. **New Application** → **Node.js**
2. **Name** : `lesigne-api`
3. **Repository** : `https://github.com/votre-repo/lesigne.git`
4. **Branch** : `main`
5. **Build Path** : `Lesignes/server`
6. **Build Command** : `npm install --production`
7. **Start Command** : `node src/index.js`
8. **Port** : `5000`

### Variables d'Environnement

```env
NODE_ENV=production
PORT=5000
DB_HOST=lesigne-postgres
DB_PORT=5432
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=https://votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
CORS_ORIGIN=https://app.votre-domaine.com,https://admin.votre-domaine.com
```

9. **Deploy**

### Initialiser la Base de Données

Dans le terminal de l'application PostgreSQL :
```bash
# Copiez schema.sql depuis votre repo
psql -U lesigne_user -d lesigne_db -f schema.sql
```

---

## 👤 Étape 4 : User Panel (3 min)

1. **New Application** → **Static Site**
2. **Name** : `lesigne-user-panel`
3. **Repository** : `https://github.com/votre-repo/lesigne.git`
4. **Branch** : `main`
5. **Build Path** : `Lesignes/user-panel`
6. **Build Command** :
```bash
npm install
npm run build
```
7. **Output Directory** : `dist`
8. **Port** : `80`

### Variables d'Environnement

```env
NODE_ENV=production
VITE_API_URL=https://api.votre-domaine.com
```

9. **Domain** : `app.votre-domaine.com`
10. **Deploy**

---

## 🛡️ Étape 5 : Admin Panel (3 min)

Même processus que User Panel :

1. **New Application** → **Static Site**
2. **Name** : `lesigne-admin-panel`
3. **Build Path** : `Lesignes/admin-panel`
4. **Build Command** : `npm install && npm run build`
5. **Output Directory** : `dist`
6. **Domain** : `admin.votre-domaine.com`
7. **Deploy**

---

## 🔒 Étape 6 : SSL (2 min)

Pour chaque application :
1. **Settings** → **Domains**
2. Activez **"SSL"** ou **"Let's Encrypt"**
3. Dokploy génère automatiquement le certificat

---

## ✅ Vérification

Testez vos URLs :
- ✅ `https://api.votre-domaine.com/api/health`
- ✅ `https://app.votre-domaine.com`
- ✅ `https://admin.votre-domaine.com`

---

## 🔄 Déploiement Automatique

Pour chaque application :
1. **Settings** → **Webhooks**
2. Activez **"Auto Deploy on Push"**
3. Copiez l'URL du webhook
4. Ajoutez-le dans GitHub/GitLab (Settings → Webhooks)

---

## 🐛 Problèmes Courants

### API ne démarre pas
→ Vérifiez les logs et les variables d'environnement

### Frontends vides
→ Vérifiez que le build s'est bien passé (logs)

### Erreurs CORS
→ Vérifiez `CORS_ORIGIN` dans les variables d'environnement de l'API

---

## 📋 Checklist Rapide

- [ ] Dokploy installé
- [ ] PostgreSQL créé et schéma initialisé
- [ ] Backend API déployé
- [ ] User Panel déployé
- [ ] Admin Panel déployé
- [ ] SSL activé pour les 3
- [ ] Auto-deploy configuré

---

**C'est tout !** 🎉

Voir `GUIDE_DOKPLOY_COMPLET.md` pour plus de détails.

