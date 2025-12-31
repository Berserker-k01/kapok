# ✅ Checklist de Déploiement Hostinger

Utilisez cette checklist pour vous assurer que tout est correctement configuré avant et après le déploiement.

## 📋 Avant le Déploiement

### Préparation Locale
- [ ] Tous les fichiers sont commités dans Git
- [ ] Les tests passent localement
- [ ] Les builds de production fonctionnent (`npm run build:all`)
- [ ] Les fichiers `.env.example` sont à jour

### Configuration Serveur
- [ ] Node.js 18+ est installé sur le serveur
- [ ] PostgreSQL est installé et configuré
- [ ] PM2 est installé globalement
- [ ] Les ports 80, 443, et 5000 sont ouverts
- [ ] Apache/Nginx est configuré et fonctionne

## 🚀 Déploiement

### Upload des Fichiers
- [ ] Tous les fichiers sont uploadés sur le serveur
- [ ] Les permissions sont correctes (755 pour les dossiers, 644 pour les fichiers)
- [ ] Le fichier `.htaccess` est présent à la racine

### Configuration
- [ ] `server/.env` est créé et configuré avec les bonnes valeurs
- [ ] `user-panel/.env` est créé et configuré
- [ ] `admin-panel/.env` est créé et configuré
- [ ] Les secrets JWT sont sécurisés et uniques
- [ ] Les mots de passe de base de données sont sécurisés

### Base de Données
- [ ] La base de données `lesigne_db` est créée
- [ ] L'utilisateur PostgreSQL a les bonnes permissions
- [ ] Le schéma est initialisé (`schema.sql`)
- [ ] Les migrations sont appliquées (`migration_subscription_payments.sql`)
- [ ] La connexion à la base de données fonctionne

### Build
- [ ] Les dépendances sont installées (`npm run install:all`)
- [ ] Les applications frontend sont buildées (`npm run build:all`)
- [ ] Les dossiers `dist/` existent dans `user-panel/` et `admin-panel/`
- [ ] Les fichiers statiques sont accessibles

### Serveur Node.js
- [ ] Le dossier `server/logs/` existe
- [ ] Le dossier `server/uploads/payment-proofs/` existe avec les bonnes permissions
- [ ] PM2 démarre correctement (`pm2 start ecosystem.config.js`)
- [ ] PM2 est configuré pour démarrer au boot (`pm2 startup`)
- [ ] Le serveur écoute sur le port 5000

### Apache/Nginx
- [ ] mod_rewrite est activé
- [ ] mod_proxy est activé
- [ ] Le Virtual Host est configuré
- [ ] Le proxy vers Node.js fonctionne (`/api` → `localhost:5000/api`)
- [ ] Les fichiers statiques sont servis correctement

### SSL/HTTPS
- [ ] Le certificat SSL est installé
- [ ] HTTPS fonctionne correctement
- [ ] Les redirections HTTP → HTTPS sont configurées

## ✅ Tests Post-Déploiement

### API Backend
- [ ] `GET /` retourne "API Assimε est en ligne ! 🚀"
- [ ] `GET /api/shops/public/:slug` fonctionne
- [ ] L'authentification fonctionne (`POST /api/auth/login`)
- [ ] Les uploads d'images fonctionnent

### User Panel
- [ ] La page se charge correctement
- [ ] L'authentification fonctionne
- [ ] Les boutiques s'affichent
- [ ] Les produits s'affichent
- [ ] Le panier fonctionne
- [ ] Le checkout fonctionne

### Admin Panel
- [ ] La page se charge correctement
- [ ] L'authentification admin fonctionne
- [ ] Le dashboard s'affiche
- [ ] La gestion des utilisateurs fonctionne
- [ ] La gestion des boutiques fonctionne

### Fonctionnalités Spécifiques
- [ ] Le Pixel Facebook fonctionne (si configuré)
- [ ] Les paiements d'abonnements fonctionnent
- [ ] Les uploads de preuves de paiement fonctionnent
- [ ] Les emails sont envoyés (si configuré)

## 🔒 Sécurité

- [ ] Les fichiers `.env` ont les permissions 600
- [ ] Les secrets ne sont pas dans le code source
- [ ] Le firewall est configuré
- [ ] Les logs ne contiennent pas d'informations sensibles
- [ ] HTTPS est forcé pour toutes les connexions

## 📊 Monitoring

- [ ] PM2 surveille le processus
- [ ] Les logs sont accessibles (`pm2 logs`)
- [ ] Les erreurs sont loggées correctement
- [ ] Un système de backup est en place

## 🎯 Performance

- [ ] La compression Gzip est activée
- [ ] Le cache des fichiers statiques est configuré
- [ ] Les images sont optimisées
- [ ] Le temps de chargement est acceptable (< 3s)

## 📝 Documentation

- [ ] Les URLs de production sont documentées
- [ ] Les identifiants d'accès sont stockés de manière sécurisée
- [ ] Les procédures de maintenance sont documentées

## 🔄 Maintenance Continue

### Mises à jour
- [ ] Processus de mise à jour documenté
- [ ] Backup avant chaque mise à jour
- [ ] Tests après chaque mise à jour

### Backups
- [ ] Backup automatique de la base de données configuré
- [ ] Backup des fichiers uploadés
- [ ] Test de restauration effectué

---

**Date de déploiement:** _______________

**Déployé par:** _______________

**Notes:** 
_________________________________________________
_________________________________________________
_________________________________________________

