# 🔄 Migration PostgreSQL → MySQL (Hostinger phpMyAdmin)

Ce document explique la migration de PostgreSQL (Supabase) vers MySQL (Hostinger phpMyAdmin).

## ✅ Modifications effectuées

### 1. Package.json
- ❌ Supprimé : `pg` (PostgreSQL)
- ✅ Ajouté : `mysql2` (MySQL)

### 2. Configuration base de données (`server/src/config/database.js`)
- ✅ Remplacé `pg.Pool` par `mysql2.createPool`
- ✅ Ajouté conversion automatique des placeholders PostgreSQL (`$1, $2...`) vers MySQL (`?`)
- ✅ Ajouté gestion du `RETURNING` (PostgreSQL) → conversion en `SELECT` après `INSERT`
- ✅ Compatibilité conservée : le code existant fonctionne sans modification

### 3. Schéma SQL
- ✅ Créé `server/database/schema_mysql.sql` (schéma MySQL complet)
- ✅ Conversions effectuées :
  - `UUID` → `CHAR(36)` avec `UUID()` (MySQL 8.0+)
  - `JSONB` → `JSON`
  - `TIMESTAMP WITH TIME ZONE` → `DATETIME` avec `ON UPDATE CURRENT_TIMESTAMP`
  - `TEXT[]` → `JSON`
  - `uuid_generate_v4()` → `UUID()`
  - Triggers PostgreSQL → Triggers MySQL (syntaxe adaptée)

### 4. Variables d'environnement (`ENV_TEMPLATE.txt`)
- ✅ Port par défaut : `5432` → `3306`
- ✅ Support de `DATABASE_URL` MySQL
- ✅ Variables `DB_*` adaptées pour MySQL

### 5. Script de diagnostic
- ✅ Créé `server/diagnose-db-mysql.js` pour tester la connexion MySQL

---

## 🚀 Installation sur Hostinger

### Étape 1 : Installer mysql2

```bash
cd server
npm install mysql2
# ou
npm install --production mysql2
```

### Étape 2 : Créer la base de données MySQL via phpMyAdmin

1. Connectez-vous à **hPanel Hostinger**
2. Allez dans **Sites web** → **Gérer**
3. Cliquez sur **Gestion des Bases de données**
4. Créez une nouvelle base de données MySQL :
   - Nom de la base : `lesigne_db` (ou votre choix)
   - Nom d'utilisateur : `lesigne_user` (ou votre choix)
   - Mot de passe : (choisissez un mot de passe sécurisé)
5. Notez ces informations pour le fichier `.env`

### Étape 3 : Importer le schéma MySQL

1. Dans **Gestion des Bases de données**, cliquez sur **Accéder à phpMyAdmin**
2. Sélectionnez votre base de données dans le menu de gauche
3. Cliquez sur l'onglet **Importer**
4. Sélectionnez le fichier `server/database/schema_mysql.sql`
5. Cliquez sur **Exécuter**

**OU** via ligne de commande (si disponible) :

```bash
mysql -u lesigne_user -p lesigne_db < server/database/schema_mysql.sql
```

### Étape 4 : Configurer le fichier .env

Éditez `server/.env` :

```env
NODE_ENV=production
PORT=5000

# MySQL (Hostinger)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lesigne_db
DB_USER=lesigne_user
DB_PASSWORD=votre_mot_de_passe_mysql

# OU utiliser DATABASE_URL (si fourni par Hostinger)
# DATABASE_URL=mysql://lesigne_user:password@localhost:3306/lesigne_db

JWT_SECRET=votre_jwt_secret
FRONTEND_URL=https://app.votre-domaine.com
USER_PANEL_URL=https://app.votre-domaine.com
ADMIN_PANEL_URL=https://admin.votre-domaine.com
```

### Étape 5 : Tester la connexion

```bash
cd server
node diagnose-db-mysql.js
```

Si vous voyez "✅ SUCCÈS ! Connexion établie", tout fonctionne !

### Étape 6 : Redémarrer l'application

```bash
# Si vous utilisez PM2
pm2 restart lesigne-server

# Ou redémarrer manuellement
cd server
npm start
```

---

## 🔍 Différences PostgreSQL vs MySQL

### Placeholders de paramètres
- **PostgreSQL** : `$1, $2, $3...`
- **MySQL** : `?`
- ✅ **Solution** : Conversion automatique dans `database.js`

### RETURNING clause
- **PostgreSQL** : `INSERT ... RETURNING *`
- **MySQL** : `INSERT ...` puis `SELECT * WHERE id = LAST_INSERT_ID()`
- ✅ **Solution** : Conversion automatique dans `database.js`

### Types de données
- **UUID** : `UUID` (PostgreSQL) → `CHAR(36)` avec `UUID()` (MySQL)
- **JSONB** : `JSONB` (PostgreSQL) → `JSON` (MySQL)
- **Timestamps** : `TIMESTAMP WITH TIME ZONE` → `DATETIME` avec `ON UPDATE`

### Fonctions
- **uuid_generate_v4()** : PostgreSQL → `UUID()` MySQL (8.0+)
- **NOW()** : Identique dans les deux

---

## ⚠️ Notes importantes

1. **MySQL 8.0+ requis** pour le support natif de `UUID()` et `JSON`
2. **Pas de migration de données automatique** : Vous devez exporter depuis Supabase et importer dans MySQL (si nécessaire)
3. **Testez toutes les fonctionnalités** après la migration
4. **Backup** : Faites toujours un backup avant de migrer !

---

## 🐛 Dépannage

### Erreur : "ER_NOT_SUPPORTED_AUTH_MODE"
```bash
# MySQL 8.0 utilise un plugin d'authentification différent
# Solution : Modifier l'utilisateur MySQL
ALTER USER 'lesigne_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'votre_password';
FLUSH PRIVILEGES;
```

### Erreur : "ER_ACCESS_DENIED"
- Vérifiez le nom d'utilisateur et le mot de passe dans `.env`
- Vérifiez que l'utilisateur a les permissions sur la base de données

### Erreur : "ER_BAD_DB_ERROR"
- La base de données n'existe pas
- Créez-la via phpMyAdmin ou hPanel

### UUID() non disponible
- MySQL < 8.0 ne supporte pas `UUID()`
- Utilisez une fonction alternative ou MySQL 8.0+

---

## ✅ Checklist de migration

- [ ] `mysql2` installé (`npm install mysql2`)
- [ ] Base de données MySQL créée sur Hostinger
- [ ] Schéma MySQL importé (`schema_mysql.sql`)
- [ ] Fichier `.env` configuré avec les bonnes variables
- [ ] Test de connexion réussi (`diagnose-db-mysql.js`)
- [ ] Application redémarrée
- [ ] Tests fonctionnels effectués
- [ ] Données migrées (si nécessaire)

---

**Migration créée le** : $(date)
**Version MySQL** : 8.0+ recommandée
**Compatibilité** : Code existant fonctionne sans modification grâce aux wrappers


