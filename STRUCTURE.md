# 📁 Structure du Projet Lesigne

## 🎯 Architecture Générale

Le projet est organisé en **monorepo** à la racine, avec une architecture claire :

```
kapok/ (racine du projet)
├── 📦 server/              # API Backend Node.js/Express
├── 👤 user-panel/          # Dashboard Utilisateurs (React)
├── 🛡️ admin-panel/         # Dashboard Admin (React)
├── 📚 shared/              # Composants et utilitaires partagés
├── 🎨 themes/              # Thèmes Shopify (Liquid)
├── 🚀 Scripts de déploiement
└── 📖 Documentation
```

## 📦 Détails par Module

### 🔧 server/ - API Backend

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuration PostgreSQL
│   │   └── plans.js             # Configuration des plans
│   │
│   ├── controllers/
│   │   ├── aiController.js       # Assistant IA
│   │   ├── orderController.js   # Gestion des commandes
│   │   ├── paymentConfigController.js    # ⭐ Numéros de paiement
│   │   ├── planConfigController.js       # ⭐ Gestion des plans
│   │   ├── productController.js # Gestion des produits
│   │   ├── shopController.js    # Gestion des boutiques
│   │   └── subscriptionPaymentController.js  # ⭐ Paiements abonnements
│   │
│   ├── middleware/
│   │   ├── auth.js              # Authentification JWT
│   │   └── errorHandler.js     # Gestion des erreurs
│   │
│   ├── routes/
│   │   ├── admin.js            # Routes admin
│   │   ├── ai.js                # Routes IA
│   │   ├── auth.js              # Authentification
│   │   ├── orders.js            # Commandes
│   │   ├── paymentConfig.js     # ⭐ Configuration paiement
│   │   ├── planConfig.js        # ⭐ Configuration plans
│   │   ├── products.js          # Produits
│   │   ├── shops.js             # Boutiques
│   │   ├── subscriptionPayments.js  # ⭐ Paiements abonnements
│   │   ├── subscriptions.js     # Abonnements
│   │   └── users.js             # Utilisateurs
│   │
│   ├── services/
│   │   ├── aiService.js          # Service IA
│   │   ├── productService.js    # Service produits
│   │   ├── sheetService.js      # Google Sheets
│   │   └── shopService.js       # Service boutiques
│   │
│   ├── utils/
│   │   ├── AppError.js          # Classe d'erreur personnalisée
│   │   └── catchAsync.js        # Wrapper async/await
│   │
│   └── index.js                 # Point d'entrée serveur
│
├── database/
│   ├── schema.sql               # Schéma principal
│   └── migration_subscription_payments.sql  # ⭐ Migration paiements
│
├── Dockerfile                   # Image Docker
├── ecosystem.config.js          # Configuration PM2
├── start.sh                     # Script de démarrage
└── package.json
```

### 👤 user-panel/ - Dashboard Utilisateurs

```
user-panel/
├── src/
│   ├── pages/
│   │   ├── Analytics/           # Analytics boutique
│   │   ├── Auth/                # Login, Register
│   │   ├── Checkout/            # Checkout et paiement
│   │   ├── Dashboard/           # Dashboard principal
│   │   ├── Orders/              # Gestion des commandes
│   │   ├── OrderValidation/     # Validation de commande
│   │   ├── Products/            # Gestion des produits
│   │   ├── Settings/            # Paramètres utilisateur
│   │   ├── Shops/               # Gestion des boutiques
│   │   │   ├── Themes/         # Thèmes (Minimal, Bold)
│   │   │   ├── PublicShop.jsx  # Page publique boutique
│   │   │   ├── Shops.jsx       # Liste des boutiques
│   │   │   └── ShopSettings.jsx # Paramètres boutique
│   │   └── Subscriptions/       # ⭐ Abonnements
│   │       ├── PlanSelection.jsx    # Sélection de plan
│   │       ├── Payment.jsx          # Page de paiement
│   │       └── PaymentStatus.jsx   # Statut du paiement
│   │
│   ├── components/
│   │   ├── AIAssistant.jsx     # Assistant IA
│   │   ├── Cart/               # Panier
│   │   ├── ErrorBoundary.jsx   # Gestion d'erreurs React
│   │   ├── FacebookPixel/      # ⭐ Composant Pixel Facebook
│   │   ├── Layout/              # Layout principal
│   │   ├── Theme/               # Composants thème
│   │   └── ui/                  # Composants UI réutilisables
│   │
│   ├── context/
│   │   └── CartContext.jsx     # Context du panier
│   │
│   ├── hooks/
│   │   └── useFacebookPixel.js # ⭐ Hook Facebook Pixel
│   │
│   ├── layouts/
│   │   └── CustomThemeLayout.jsx
│   │
│   ├── utils/
│   │   ├── currency.js         # Utilitaires devise
│   │   └── facebookPixel.js    # ⭐ Utilitaires Pixel Facebook
│   │
│   ├── store/
│   │   └── authStore.js        # Store Zustand auth
│   │
│   ├── App.jsx                 # Application principale
│   └── main.jsx                # Point d'entrée
│
├── dist/                        # Build de production
├── public/                      # Fichiers statiques
├── Dockerfile
├── vite.config.js
└── package.json
```

### 🛡️ admin-panel/ - Dashboard Admin

```
admin-panel/
├── src/
│   ├── pages/
│   │   ├── Analytics/           # Analytics plateforme
│   │   ├── Auth/                # Login admin
│   │   ├── Dashboard/           # Dashboard admin
│   │   ├── PaymentNumbers/      # ⭐ Gestion numéros paiement
│   │   ├── PaymentRequests/     # ⭐ Validation paiements
│   │   ├── Plans/               # ⭐ Gestion des plans
│   │   ├── Settings/            # Paramètres système
│   │   ├── Shops/               # Gestion boutiques
│   │   ├── Subscriptions/      # Gestion abonnements
│   │   └── Users/               # Gestion utilisateurs
│   │
│   ├── components/
│   │   ├── Layout/              # Layout admin
│   │   └── ui/                  # Composants UI
│   │
│   ├── store/
│   │   └── authStore.js         # Store Zustand auth
│   │
│   ├── App.jsx                  # Application principale
│   └── main.jsx                 # Point d'entrée
│
├── dist/                        # Build de production
├── Dockerfile
├── vite.config.js
└── package.json
```

### 📚 shared/ - Composants Partagés

```
shared/
├── components/
│   └── LoadingSpinner.jsx      # Spinner de chargement
└── utils/
    ├── api.js                   # Configuration Axios
    └── formatters.js            # Formatage données
```

## 🎨 themes/ - Thèmes Shopify

```
themes/
└── theme_export__aziishop-com-africom-theme__12JUL2023-0102pm/
    ├── assets/                  # Assets (JS, CSS, images)
    ├── config/                  # Configuration
    ├── layout/                  # Layouts Liquid
    ├── locales/                 # Traductions
    ├── sections/                # Sections Liquid
    ├── snippets/                # Snippets Liquid
    └── templates/               # Templates Liquid
```

## 🚀 Scripts et Configuration

### Scripts de Déploiement
- `deploy.sh` - Script de déploiement automatique
- `start-dev.bat` / `start-dev.ps1` - Démarrage développement
- `install-all.bat` - Installation dépendances
- `backup-db.sh` - Backup base de données

### Configuration
- `docker-compose.yml` - Configuration Docker complète
- `ecosystem.config.js` - Configuration PM2
- `nginx.conf` - Configuration Nginx
- `.htaccess` - Configuration Apache

## 📖 Documentation

### Guides de Déploiement
- `DEPLOYMENT_HOSTINGER.md` - Guide complet Hostinger
- `DEPLOY_DOKPLOY.md` - Guide déploiement Dokploy
- `DEPLOY_VPS_RECOMMENDATIONS.md` - Recommandations VPS
- `QUICK_DEPLOY.md` - Déploiement rapide

### Guides d'Installation
- `INSTALL_NODE_HOSTINGER.md` - Installation Node.js
- `INSTALL_NODE_HOSTINGER_SHARED.md` - Node.js serveur partagé
- `QUICK_FIX_NODE.md` - Solution rapide Node.js

### Guides Fonctionnels
- `FACEBOOK_PIXEL_GUIDE.md` - Guide Facebook Pixel
- `PROJECT_STATUS.md` - État du projet

### Dépannage
- `TROUBLESHOOTING.md` - Dépannage général
- `TROUBLESHOOTING_DEPLOYMENT.md` - Dépannage déploiement
- `DEPLOYMENT_CHECKLIST.md` - Checklist déploiement

## ⭐ Fonctionnalités Récentes

### Système de Paiement Manuel des Abonnements
- ✅ Plans configurables par l'admin
- ✅ Sélection de plan par l'utilisateur
- ✅ Upload de preuve de paiement
- ✅ Validation admin
- ✅ Gestion complète des plans et numéros

### Intégration Facebook Pixel
- ✅ Configuration dans les paramètres
- ✅ Tracking automatique des événements e-commerce
- ✅ Hook et utilitaires réutilisables

## 🔗 Points d'Entrée

- **API Backend** : `server/src/index.js`
- **User Panel** : `user-panel/src/main.jsx`
- **Admin Panel** : `admin-panel/src/main.jsx`

## 📊 Routes Principales

### API (`/api/`)
- `/api/auth` - Authentification
- `/api/users` - Utilisateurs
- `/api/shops` - Boutiques
- `/api/products` - Produits
- `/api/orders` - Commandes
- `/api/subscription-payments` - ⭐ Paiements abonnements
- `/api/admin/plans` - ⭐ Gestion plans
- `/api/admin/payment-numbers` - ⭐ Numéros paiement

### Frontend
- User Panel : `http://localhost:3001`
- Admin Panel : `http://localhost:3002`
- Boutiques publiques : `/s/:slug`

---

**Dernière mise à jour** : Structure simplifiée - tout à la racine pour faciliter le déploiement.


