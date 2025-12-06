# 🚀 Guide de Démarrage Rapide - Lesigne Platform

## ⚡ Démarrage Ultra-Rapide (5 minutes)

### 1. Prérequis
- ✅ Node.js 18+ installé
- ✅ PostgreSQL 14+ installé et démarré
- ✅ Git installé

### 2. Installation Express

```bash
# 1. Cloner et naviguer
git clone <votre-repo-url>
cd Lesigne/Lesignes

# 2. Installer toutes les dépendances
npm run install:all

# 3. Configuration base de données
createdb lesigne_db
cd server
psql lesigne_db < database/schema.sql

# 4. Configuration environnement
cp .env.example .env
# Éditer .env si nécessaire (optionnel pour le développement local)
```

### 3. Démarrage

**Option A - Script automatique (Windows):**
```bash
# Double-cliquer sur start-dev.bat
# OU exécuter dans PowerShell:
.\start-dev.ps1
```

**Option B - Démarrage manuel (3 terminaux):**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - User Panel  
cd user-panel && npm run dev

# Terminal 3 - Admin Panel
cd admin-panel && npm run dev
```

### 4. Accès aux Applications

| Application | URL | Compte de test |
|-------------|-----|----------------|
| **Backend API** | http://localhost:5000 | - |
| **User Panel** | http://localhost:3001 | Bouton "Connexion Démo" |
| **Admin Panel** | http://localhost:3002 | admin@lesigne.com / admin123 |

## 🎯 Première Utilisation

### Admin Panel (Super-Admin)
1. Aller sur http://localhost:3002
2. Se connecter avec `admin@lesigne.com` / `admin123`
3. Explorer le dashboard, utilisateurs, boutiques

### User Panel (Propriétaire de boutique)
1. Aller sur http://localhost:3001  
2. Cliquer sur "Connexion Démo" ou créer un compte
3. Créer votre première boutique
4. Ajouter des produits
5. Consulter les analytics

## 🔧 Commandes Utiles

```bash
# Installer toutes les dépendances
npm run install:all

# Démarrer en mode développement
npm run dev:server     # Backend seulement
npm run dev:user-panel # User Panel seulement  
npm run dev:admin-panel # Admin Panel seulement

# Build pour production
npm run build:all

# Tests (à implémenter)
npm test
```

## 🗄️ Base de Données

### Connexion par défaut
- **Host:** localhost
- **Port:** 5432
- **Database:** lesigne_db
- **User:** postgres
- **Password:** (votre mot de passe PostgreSQL)

### Reset de la DB
```bash
cd server
dropdb lesigne_db
createdb lesigne_db  
psql lesigne_db < database/schema.sql
```

## 🐛 Résolution de Problèmes

### Port déjà utilisé
```bash
# Trouver et tuer le processus
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Erreur de connexion DB
1. Vérifier que PostgreSQL est démarré
2. Vérifier les credentials dans `.env`
3. Créer la base de données si elle n'existe pas

### Modules non trouvés
```bash
# Réinstaller les dépendances
npm run install:all
```

## 📚 Prochaines Étapes

1. **Explorer l'architecture** dans le README principal
2. **Personnaliser** les thèmes et couleurs
3. **Ajouter** des fonctionnalités métier
4. **Intégrer** Mobile Money et autres APIs
5. **Déployer** en production

## 🆘 Support

- 📧 Email: support@lesigne.com
- 📖 Documentation complète: README.md
- 🐛 Issues: GitHub Issues

---

**Bon développement avec Lesigne! 🛍️**
