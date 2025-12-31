# ⚡ Solution Rapide : Node.js sur Hostinger Partagé

## 🎯 Solution la Plus Simple

### 1. Via le Panneau Hostinger

1. Connectez-vous à **hPanel** (panneau Hostinger)
2. Allez dans **Advanced** > **Node.js** (ou cherchez "Node.js Selector")
3. Activez Node.js et choisissez la version **18.x**
4. Sauvegardez

### 2. Reconnectez-vous en SSH

```bash
# Recharger le shell
source ~/.bashrc

# Tester
node --version
npm --version
```

## 🔄 Si ça ne fonctionne pas : NVM (Sans Sudo)

```bash
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recharger
source ~/.bashrc

# Installer Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Vérifier
node --version
npm --version
```

## 🔍 Trouver Node.js Existant

```bash
# Chercher dans les chemins communs Hostinger
ls -la /opt/alt/nodejs/ 2>/dev/null
/opt/alt/nodejs/18/bin/node --version 2>/dev/null

# Si trouvé, ajouter au PATH
echo 'export PATH=$PATH:/opt/alt/nodejs/18/bin' >> ~/.bashrc
source ~/.bashrc
```

## ✅ Continuer

Une fois Node.js installé :

```bash
cd ~/lesigne/Lesignes
npm run install:all
```

---

**Pour plus de détails :** `INSTALL_NODE_HOSTINGER_SHARED.md`

