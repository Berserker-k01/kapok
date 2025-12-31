# 🔧 Installation Node.js sur Hostinger (Serveur Partagé)

Si vous n'avez pas accès à `sudo` ou `apt`, vous êtes probablement sur un serveur partagé Hostinger. Voici les solutions adaptées.

## 📋 Méthode 1 : Via le Panneau Hostinger (Recommandée)

### Étape 1 : Accéder au Panneau de Contrôle

1. Connectez-vous à votre **panneau Hostinger** (hPanel)
2. Allez dans **Advanced** > **Node.js** (ou **Node.js Selector**)
3. Activez Node.js et sélectionnez la version **18.x** (ou la plus récente disponible)
4. Cliquez sur **Save** ou **Apply**

### Étape 2 : Vérifier l'Installation

Après activation, reconnectez-vous en SSH et testez :

```bash
# Recharger le shell
source ~/.bashrc

# Vérifier Node.js
node --version
npm --version

# Si ça ne fonctionne pas, essayer avec le chemin complet
/opt/alt/nodejs/18/bin/node --version
```

### Étape 3 : Ajouter au PATH (si nécessaire)

Si Node.js est installé mais pas dans le PATH :

```bash
# Trouver où Node.js est installé
which node
# ou
find ~ -name node 2>/dev/null
# ou
ls -la /opt/alt/nodejs/

# Ajouter au PATH dans ~/.bashrc
echo 'export PATH=$PATH:/opt/alt/nodejs/18/bin' >> ~/.bashrc
source ~/.bashrc

# Vérifier
node --version
npm --version
```

## 📋 Méthode 2 : Installation via NVM (Sans Sudo)

NVM peut être installé dans votre dossier home sans droits root.

### Étape 1 : Installer NVM

```bash
# Télécharger et installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger le profil
source ~/.bashrc

# Vérifier
nvm --version
```

### Étape 2 : Installer Node.js via NVM

```bash
# Installer Node.js 18
nvm install 18

# Utiliser Node.js 18
nvm use 18

# Définir comme version par défaut
nvm alias default 18

# Vérifier
node --version
npm --version
```

### Étape 3 : Ajouter au .bashrc (pour persistance)

```bash
# Ajouter ces lignes à ~/.bashrc
cat >> ~/.bashrc << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF

# Recharger
source ~/.bashrc
```

## 📋 Méthode 3 : Utiliser le Node.js du Panneau (Chemins Communs)

Hostinger installe souvent Node.js dans des chemins spécifiques. Essayez :

```bash
# Chemins communs sur Hostinger
/opt/alt/nodejs/18/bin/node --version
/opt/alt/nodejs/20/bin/node --version
/usr/local/bin/node --version
/usr/bin/node --version
~/.local/bin/node --version

# Si vous trouvez Node.js, créez des alias ou ajoutez au PATH
echo 'export PATH=$PATH:/opt/alt/nodejs/18/bin' >> ~/.bashrc
source ~/.bashrc
```

## 📋 Méthode 4 : Installation Manuelle (Binary)

Si aucune des méthodes ci-dessus ne fonctionne :

### Étape 1 : Télécharger Node.js

```bash
# Créer un dossier pour Node.js
mkdir -p ~/nodejs
cd ~/nodejs

# Télécharger Node.js 18 (Linux x64)
wget https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz

# Extraire
tar -xf node-v18.19.0-linux-x64.tar.xz

# Créer un lien symbolique ou ajouter au PATH
echo 'export PATH=$PATH:~/nodejs/node-v18.19.0-linux-x64/bin' >> ~/.bashrc
source ~/.bashrc

# Vérifier
node --version
npm --version
```

## 🔍 Diagnostic : Trouver Node.js Existant

Avant d'installer, vérifiez si Node.js n'est pas déjà installé quelque part :

```bash
# Chercher node dans les chemins communs
ls -la /opt/alt/nodejs/ 2>/dev/null
ls -la /usr/local/bin/node* 2>/dev/null
ls -la /usr/bin/node* 2>/dev/null
which node 2>/dev/null
whereis node 2>/dev/null

# Chercher dans votre home
find ~ -name node -type f 2>/dev/null | head -5
```

## ✅ Vérification et Configuration

### Vérifier que tout fonctionne

```bash
# Node.js
node --version
# Devrait afficher: v18.x.x

# npm
npm --version
# Devrait afficher: 10.x.x

# Chemins
which node
which npm
```

### Installer PM2 (sans sudo)

```bash
# Installer PM2 globalement dans votre home
npm install -g pm2 --prefix ~/.local

# Ajouter au PATH
echo 'export PATH=$PATH:~/.local/bin' >> ~/.bashrc
source ~/.bashrc

# Vérifier
pm2 --version
```

## 🚨 Problèmes Courants

### Problème : "command not found" après installation

**Solution :** Rechargez le shell et vérifiez le PATH

```bash
source ~/.bashrc
echo $PATH
which node
```

### Problème : NVM ne fonctionne pas après déconnexion

**Solution :** Assurez-vous que NVM est dans `.bashrc`

```bash
# Vérifier
cat ~/.bashrc | grep nvm

# Si absent, ajouter
cat >> ~/.bashrc << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF
```

### Problème : Permission denied lors de npm install -g

**Solution :** Utiliser le préfixe local

```bash
# Au lieu de: npm install -g pm2
npm install -g pm2 --prefix ~/.local
export PATH=$PATH:~/.local/bin
```

## 🎯 Après Installation Réussie

Une fois Node.js installé, continuez le déploiement :

```bash
cd ~/lesigne/Lesignes
npm run install:all
```

## 📞 Si Rien ne Fonctionne

1. **Contactez le Support Hostinger :**
   - Demandez comment activer Node.js sur votre compte
   - Demandez les chemins d'installation de Node.js
   - Vérifiez si votre plan supporte Node.js

2. **Vérifiez votre Plan :**
   - Les plans partagés basiques peuvent ne pas supporter Node.js
   - Vous pourriez avoir besoin d'un plan VPS ou Cloud

3. **Alternative :** Utilisez un service comme **Render**, **Railway**, ou **Fly.io** pour héberger l'API Node.js

---

**Note :** Sur les serveurs partagés Hostinger, Node.js est généralement disponible via le panneau de contrôle. C'est la méthode la plus simple et recommandée.

