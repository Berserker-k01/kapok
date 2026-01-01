# ⚡ Déploiement Rapide - Hostinger Cloud Startup

Guide rapide pour déployer votre SaaS Lesigne sur Hostinger Cloud Startup.

---

## 🚀 Méthode Rapide (Script Automatique)

```bash
# 1. Se connecter en SSH à votre serveur Hostinger
ssh root@votre-ip-hostinger

# 2. Cloner le projet
cd /var/www
git clone https://github.com/votre-username/lesigne.git
cd lesigne

# 3. Exécuter le script de déploiement
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh

# Note: Si vous êtes connecté en tant que root, pas besoin de sudo
```

Le script va automatiquement :
- ✅ Installer Docker et Docker Compose
- ✅ Installer Nginx
- ✅ Builder les frontends
- ✅ Démarrer les services
- ✅ Configurer Nginx
- ✅ Configurer SSL avec Let's Encrypt

---

## 📋 Préparation avant le déploiement

1. **Variables d'environnement** : Préparez vos clés API (Stripe, OpenAI, etc.)
2. **Domaines** : Configurez vos domaines dans Hostinger :
   - `api.votre-domaine.com`
   - `app.votre-domaine.com`
   - `admin.votre-domaine.com`
3. **Accès SSH** : Obtenez les credentials SSH de votre VPS Hostinger

---

## ⚙️ Configuration Manuelle (Alternative)

Si vous préférez déployer manuellement, suivez le guide complet : **[DEPLOIEMENT_HOSTINGER.md](./DEPLOIEMENT_HOSTINGER.md)**

### Étapes principales :

1. Installer Docker et Docker Compose
2. Cloner le projet
3. Créer le fichier `.env` à la racine avec vos variables
4. Builder les frontends : `./build-frontends.sh https://api.votre-domaine.com/api`
5. Démarrer les services : `docker compose up -d`
6. Configurer Nginx (voir guide complet)
7. Configurer SSL avec Certbot

---

## 🔧 Commandes Utiles

```bash
# Voir les logs
docker compose logs -f

# Redémarrer un service
docker compose restart api

# Mettre à jour l'application
git pull
docker compose down
docker compose build
docker compose up -d

# Builder les frontends après une mise à jour
./build-frontends.sh https://api.votre-domaine.com/api

# Voir le statut des services
docker compose ps
```

---

## 📝 Variables d'Environnement Requises

Créez un fichier `.env` à la racine du projet :

```env
# Générer avec: openssl rand -base64 32
DB_PASSWORD=votre_mot_de_passe_db

# Générer avec: openssl rand -base64 64
JWT_SECRET=votre_jwt_secret

# Vos domaines
FRONTEND_URL=https://app.votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com

# Optionnel
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
```

---

## ✅ Checklist Post-Déploiement

- [ ] Services Docker démarrés (`docker compose ps`)
- [ ] Base de données accessible
- [ ] Frontends buildés (dossiers `dist/` existent)
- [ ] Nginx configuré et redémarré
- [ ] SSL actif (certificats Let's Encrypt)
- [ ] API accessible : `https://api.votre-domaine.com/api/health`
- [ ] User Panel accessible : `https://app.votre-domaine.com`
- [ ] Admin Panel accessible : `https://admin.votre-domaine.com`

---

## 🆘 Problèmes Courants

### Le backend ne démarre pas
```bash
docker compose logs api
# Vérifier les variables d'environnement dans .env
```

### Erreur 502 Nginx
```bash
# Vérifier que le backend est accessible
curl http://localhost:5000/api/health

# Vérifier la configuration Nginx
nginx -t
```

### Frontends non buildés
```bash
./build-frontends.sh https://api.votre-domaine.com/api
```

---

**Pour plus de détails, consultez le guide complet : [DEPLOIEMENT_HOSTINGER.md](./DEPLOIEMENT_HOSTINGER.md)**

