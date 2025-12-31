# 🐛 Dépannage - Déploiement Hostinger

## Erreurs Courantes et Solutions

### ❌ "npm: command not found"

**Cause :** Node.js/npm n'est pas installé ou n'est pas dans le PATH.

**Solutions :**
1. Consultez `INSTALL_NODE_HOSTINGER.md` pour installer Node.js
2. Vérifiez que Node.js est dans le PATH :
   ```bash
   which node
   which npm
   ```
3. Si installé via NVM, rechargez le shell :
   ```bash
   source ~/.bashrc
   nvm use 18
   ```

---

### ❌ "Permission denied" lors de npm install

**Cause :** Permissions insuffisantes pour écrire dans le dossier.

**Solutions :**
```bash
# Option 1 : Utiliser sudo (non recommandé pour npm install local)
sudo npm install

# Option 2 : Corriger les permissions (recommandé)
sudo chown -R $USER:$USER ~/lesigne
cd ~/lesigne/Lesignes
npm install
```

---

### ❌ "Cannot find module" après installation

**Cause :** Les dépendances ne sont pas installées ou le node_modules est corrompu.

**Solutions :**
```bash
# Supprimer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Ou pour tous les projets
cd ~/lesigne/Lesignes
rm -rf */node_modules */package-lock.json
npm run install:all
```

---

### ❌ "Port 5000 already in use"

**Cause :** Un autre processus utilise déjà le port 5000.

**Solutions :**
```bash
# Trouver le processus
sudo netstat -tulpn | grep 5000
# ou
sudo lsof -i :5000

# Tuer le processus (remplacez PID par le numéro trouvé)
sudo kill -9 PID

# Ou changer le port dans server/.env
PORT=5001
```

---

### ❌ "Database connection error"

**Cause :** Problème de connexion à PostgreSQL.

**Solutions :**
```bash
# 1. Vérifier que PostgreSQL tourne
sudo systemctl status postgresql
sudo systemctl start postgresql

# 2. Tester la connexion
psql -U lesigne_user -d lesigne_db -h localhost

# 3. Vérifier les credentials dans server/.env
cat server/.env | grep DB_

# 4. Vérifier que l'utilisateur existe
sudo -u postgres psql
\du  # Liste les utilisateurs
\l   # Liste les bases de données
```

---

### ❌ "PM2 command not found"

**Cause :** PM2 n'est pas installé globalement.

**Solutions :**
```bash
# Installer PM2
sudo npm install -g pm2

# Vérifier
pm2 --version

# Si toujours pas trouvé, ajouter au PATH
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc
```

---

### ❌ "Build failed" lors du build des frontends

**Cause :** Problème avec Vite ou les dépendances.

**Solutions :**
```bash
# Nettoyer et réinstaller
cd user-panel  # ou admin-panel
rm -rf node_modules dist
npm install
npm run build

# Vérifier les erreurs dans la console
# Souvent lié à des variables d'environnement manquantes
```

---

### ❌ "404 Not Found" pour les fichiers statiques

**Cause :** Apache ne sert pas correctement les fichiers ou le .htaccess n'est pas pris en compte.

**Solutions :**
```bash
# 1. Vérifier que mod_rewrite est activé
sudo a2enmod rewrite
sudo systemctl restart apache2

# 2. Vérifier les permissions
ls -la user-panel/dist/
chmod 755 user-panel/dist/

# 3. Vérifier la configuration Apache
sudo apache2ctl configtest

# 4. Vérifier que AllowOverride est activé dans la config Apache
```

---

### ❌ "CORS error" dans le navigateur

**Cause :** Les URLs dans server/.env ne correspondent pas aux vraies URLs.

**Solutions :**
```bash
# Vérifier les URLs dans server/.env
cat server/.env | grep URL

# S'assurer qu'elles correspondent aux vraies URLs :
# FRONTEND_URL=https://votre-domaine.com
# USER_PANEL_URL=https://app.votre-domaine.com
# ADMIN_PANEL_URL=https://admin.votre-domaine.com

# Redémarrer le serveur après modification
pm2 restart lesigne-api
```

---

### ❌ "JWT secret error" ou "Token invalid"

**Cause :** Le JWT_SECRET n'est pas défini ou a changé.

**Solutions :**
```bash
# 1. Vérifier que JWT_SECRET est défini
cat server/.env | grep JWT_SECRET

# 2. Générer un nouveau secret
openssl rand -base64 32

# 3. Mettre à jour server/.env avec le nouveau secret
# 4. Redémarrer le serveur
pm2 restart lesigne-api

# Note : Tous les utilisateurs devront se reconnecter
```

---

### ❌ Les uploads ne fonctionnent pas

**Cause :** Le dossier uploads n'existe pas ou n'a pas les bonnes permissions.

**Solutions :**
```bash
# Créer le dossier
mkdir -p server/uploads/payment-proofs

# Donner les bonnes permissions
chmod 755 server/uploads
chmod 755 server/uploads/payment-proofs

# Vérifier que le serveur peut écrire
touch server/uploads/payment-proofs/test.txt
rm server/uploads/payment-proofs/test.txt
```

---

### ❌ PM2 ne démarre pas au boot

**Cause :** La commande `pm2 startup` n'a pas été exécutée correctement.

**Solutions :**
```bash
# Réexécuter pm2 startup
pm2 startup

# Suivre les instructions affichées (généralement une commande sudo à copier-coller)

# Sauvegarder la configuration actuelle
pm2 save

# Vérifier
pm2 list
```

---

### ❌ "Module not found" dans les logs PM2

**Cause :** Les node_modules ne sont pas installés ou le chemin est incorrect.

**Solutions :**
```bash
# S'assurer d'être dans le bon dossier
cd ~/lesigne/Lesignes/server

# Vérifier que node_modules existe
ls -la node_modules/

# Si absent, réinstaller
npm install --production

# Redémarrer PM2
pm2 restart lesigne-api
```

---

### ❌ Les logs PM2 sont vides

**Cause :** Les dossiers de logs n'existent pas.

**Solutions :**
```bash
# Créer le dossier de logs
mkdir -p server/logs

# Vérifier les permissions
chmod 755 server/logs

# Redémarrer PM2
pm2 restart lesigne-api

# Vérifier les logs
pm2 logs lesigne-api
```

---

## 🔍 Commandes de Diagnostic

### Vérifier l'état général

```bash
# Node.js et npm
node --version
npm --version

# PM2
pm2 status
pm2 list

# PostgreSQL
sudo systemctl status postgresql
psql --version

# Apache
sudo systemctl status apache2
sudo apache2ctl configtest

# Ports ouverts
sudo netstat -tulpn | grep -E ':(80|443|5000)'
```

### Vérifier les fichiers importants

```bash
# Variables d'environnement
cat server/.env
cat user-panel/.env
cat admin-panel/.env

# Fichiers de build
ls -la user-panel/dist/
ls -la admin-panel/dist/

# Configuration PM2
cat server/ecosystem.config.js
```

### Tester la connexion API

```bash
# Test local
curl http://localhost:5000/

# Test avec les headers
curl -H "Content-Type: application/json" http://localhost:5000/api/shops/public/test
```

---

## 📞 Obtenir de l'Aide

1. **Vérifiez les logs :**
   ```bash
   pm2 logs lesigne-api --lines 100
   sudo tail -f /var/log/apache2/error.log
   ```

2. **Vérifiez la documentation :**
   - `DEPLOYMENT_HOSTINGER.md` - Guide complet
   - `INSTALL_NODE_HOSTINGER.md` - Installation Node.js
   - `DEPLOYMENT_CHECKLIST.md` - Checklist

3. **Contactez le support :**
   - Support Hostinger pour les problèmes serveur
   - GitHub Issues pour les problèmes de code

---

**Dernière mise à jour :** Vérifiez toujours que vous utilisez les dernières versions de Node.js et des dépendances.

