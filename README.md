# Lesigne Platform

Plateforme e-commerce multi-tenant moderne permettant aux utilisateurs de créer et gérer leurs boutiques en ligne facilement.

## 🚀 Architecture

Lesigne est organisé en **monorepo** avec une architecture à 2 panels distincts :

```
Lesignes/
├── 👤 user-panel/      # Dashboard pour les propriétaires de boutiques  
├── 🛡️ admin-panel/     # Panel d'administration super-admin
├── 🔧 server/          # API backend unifiée
├── 📦 shared/          # Composants et utilitaires partagés
├── 📚 .github/         # Templates et workflows GitHub
├── 🚀 start-dev.*     # Scripts de démarrage automatique
└── 📖 *.md            # Documentation complète
```

## 🎯 Fonctionnalités Principales

### 👤 User Panel (Propriétaires de boutiques)
- **Gestion multi-boutiques** : Jusqu'à 2 boutiques gratuites par utilisateur
- **Gestion produits** : Ajout, modification, images, inventaire
- **Commandes & Analytics** : Suivi des ventes et statistiques détaillées
- **Personnalisation** : Thèmes, SEO, configuration boutique
- **Paiements** : Intégration Stripe et Mobile Money (à venir)

### 🛡️ Admin Panel (Super-administrateurs)
- **Gestion utilisateurs** : Surveillance, suspension, statistiques
- **Monitoring boutiques** : Performances, modération, revenus
- **Analytics plateforme** : KPIs globaux, tendances, croissance
- **Administration** : Configuration système, thèmes, support

### 🏪 Client (Interface publique)
- **Boutiques personnalisées** : Chaque boutique a son propre domaine/slug
- **Expérience d'achat** : Panier, checkout, paiements sécurisés
- **Responsive design** : Optimisé mobile et desktop

## 🛠️ Stack Technique

### Frontend
- **React 19** avec **Vite** pour des performances optimales
- **TailwindCSS** pour le styling moderne et responsive
- **Zustand** pour la gestion d'état simple et efficace
- **React Router DOM** pour la navigation
- **Recharts** pour les graphiques et analytics
- **React Hook Form + Zod** pour la validation des formulaires

### Backend
- **Node.js + Express** pour l'API REST
- **PostgreSQL** comme base de données principale
- **JWT** pour l'authentification sécurisée
- **Bcrypt** pour le hashage des mots de passe
- **Stripe** pour les paiements (Mobile Money en développement)

### DevOps & Outils
- **ESLint** pour la qualité du code
- **Nodemon** pour le développement backend
- **CORS** configuré pour les 3 applications frontend

## 🚦 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/Lesigne.git
cd Lesigne/Lesignes
```

2. **Installer les dépendances**
```bash
# Backend
cd server
npm install

# User Panel
cd ../user-panel
npm install

# Admin Panel  
cd ../admin-panel
npm install

# Installation terminée - Plus besoin du client
```

3. **Configuration de la base de données**
```bash
# Créer la base de données PostgreSQL
createdb lesigne_db

# Exécuter le schéma
cd server
psql lesigne_db < database/schema.sql
```

4. **Configuration environnement**
```bash
cd server
cp .env.example .env
# Éditer .env avec vos paramètres
```

5. **Démarrage des applications**

**Terminal 1 - Backend :**
```bash
cd server
npm run dev
```

**Terminal 2 - User Panel :**
```bash
cd user-panel  
npm run dev
```

**Terminal 3 - Admin Panel :**
```bash
cd admin-panel
npm run dev
```

### 🌐 URLs d'accès

- **API Backend** : http://localhost:5000
- **User Panel** : http://localhost:3001
- **Admin Panel** : http://localhost:3002

### 🔐 Comptes de démonstration

**Admin Panel :**
- Email: `admin@lesigne.com`
- Mot de passe: `admin123`

**User Panel :**
- Utilisez le bouton "Connexion Démo" ou créez un compte

## 📊 Modèle Business

### Freemium
- **Gratuit** : 2 boutiques par utilisateur
- **Premium** : Boutiques illimitées + fonctionnalités avancées

### Fonctionnalités à venir
- 💳 **Mobile Money** (Orange, MTN, Moov)
- 🤖 **Assistant IA** pour génération de fiches produits
- 📱 **Application mobile**
- 📈 **Analytics avancées**
- 🎨 **Marketplace de thèmes**
- 🚚 **Gestion livraisons**

## 🗂️ Structure des données

### Entités principales
- **Users** : Utilisateurs de la plateforme
- **Shops** : Boutiques (max 2 gratuites par user)
- **Products** : Produits avec variants, images, inventaire
- **Orders** : Commandes avec statuts et paiements
- **Subscriptions** : Abonnements Premium

### Sécurité
- Authentification JWT avec refresh tokens
- Hashage bcrypt pour les mots de passe
- Validation des permissions par boutique
- Rate limiting sur l'API

## 🔧 Dépannage

Si vous rencontrez des problèmes :

1. **Pages blanches** : Utilisez `.\test-simple.ps1` pour diagnostiquer
2. **Erreurs de démarrage** : Consultez `TROUBLESHOOTING.md`
3. **Diagnostic complet** : Exécutez `.\diagnose.ps1`

**Versions de fallback disponibles :**
- `App-working.jsx` - Version stable garantie
- `App-debug.jsx` - Version de test ultra-simple

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Email** : support@lesigne.com
- **Documentation** : [docs.lesigne.com](https://docs.lesigne.com)
- **Issues** : [GitHub Issues](https://github.com/votre-username/Lesigne/issues)

---

**Lesigne** - *Créez votre boutique en ligne en quelques minutes* 🛍️