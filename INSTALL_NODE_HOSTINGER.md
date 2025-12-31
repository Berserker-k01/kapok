# 🔧 Installation de Node.js sur Hostinger

Si vous obtenez l'erreur `npm: command not found`, Node.js n'est pas installé sur votre serveur. Suivez ce guide pour l'installer.

> ⚠️ **Si vous n'avez pas accès à `sudo` ou `apt`**, vous êtes probablement sur un serveur partagé. Consultez **`INSTALL_NODE_HOSTINGER_SHARED.md`** pour des solutions adaptées.

## 📋 Méthode 1 : Installation via NodeSource (Recommandée)

### Étape 1 : Connexion SSH

```bash
ssh votre-utilisateur@votre-serveur.hostinger.com
```

### Étape 2 : Vérifier si Node.js est déjà installé

```bash
node --version
npm --version
```

Si ces commandes fonctionnent, Node.js est déjà installé. Le problème vient peut-être du PATH.

### Étape 3 : Installer Node.js 18.x

```bash
# Mettre à jour le système
sudo apt update

# Installer les dépendances nécessaires
sudo apt install -y curl

# Ajouter le repository NodeSource pour Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Installer Node.js
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

Vous devriez voir quelque chose comme :
```
v18.19.0
10.2.3
```

## 📋 Méthode 2 : Installation via NVM (Node Version Manager)

Cette méthode est utile si vous avez besoin de gérer plusieurs versions de Node.js.

### Étape 1 : Installer NVM

```bash
# Télécharger et installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger le profil bash
source ~/.bashrc

# Vérifier l'installation
nvm --version
```

### Étape 2 : Installer Node.js via NVM

```bash
# Installer Node.js 18 (dernière version LTS)
nvm install 18

# Utiliser Node.js 18
nvm use 18

# Définir comme version par défaut
nvm alias default 18

# Vérifier
node --version
npm --version
```

## 📋 Méthode 3 : Installation via le Panneau Hostinger

Certains plans Hostinger offrent Node.js dans le panneau de contrôle :

1. Connectez-vous à votre panneau Hostinger
2. Allez dans **Advanced** > **Node.js**
3. Activez Node.js et sélectionnez la version 18.x
4. Redémarrez votre serveur si nécessaire

## 🔍 Vérification et Configuration

### Vérifier que npm fonctionne

```bash
which node
which npm
```

Ces commandes doivent retourner les chemins vers les exécutables.

### Si npm n'est toujours pas trouvé

```bash
# Ajouter Node.js au PATH (ajoutez à ~/.bashrc)
echo 'export PATH=$PATH:/usr/bin' >> ~/.bashrc
source ~/.bashrc

# Ou si installé via NVM
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

## 📦 Installation de PM2

Une fois Node.js installé, installez PM2 globalement :

```bash
sudo npm install -g pm2

# Vérifier
pm2 --version
```

## 🚨 Problèmes Courants

### Problème : "Permission denied" lors de l'installation globale

**Solution :** Utilisez `sudo` ou configurez npm pour ne pas utiliser sudo :

```bash
# Option 1 : Utiliser sudo
sudo npm install -g pm2

# Option 2 : Configurer npm pour installer globalement sans sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g pm2
```

### Problème : Node.js installé mais npm ne fonctionne pas

```bash
# Réinstaller npm
curl -L https://www.npmjs.com/install.sh | sh

# Ou via Node.js
sudo apt-get install --reinstall nodejs
```

### Problème : Version de Node.js incorrecte

```bash
# Vérifier la version actuelle
node --version

# Si vous avez NVM, changer de version
nvm install 18
nvm use 18
nvm alias default 18

# Si vous utilisez NodeSource, réinstaller
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## ✅ Test Final

Après l'installation, testez que tout fonctionne :

```bash
# Vérifier Node.js
node --version
# Devrait afficher: v18.x.x

# Vérifier npm
npm --version
# Devrait afficher: 10.x.x

# Vérifier PM2
pm2 --version
# Devrait afficher: 5.x.x
```

## 🎯 Continuer le Déploiement

Une fois Node.js installé, vous pouvez continuer :

```bash
cd ~/lesigne/Lesignes
npm run install:all
```

---

**Besoin d'aide ?** Contactez le support Hostinger ou consultez la documentation officielle Node.js.

