# 🔧 Configuration Nginx pour Hostinger - e-assime.com

## Problème actuel
Quand vous allez sur `e-assime.com`, vous voyez "API Assimε est en ligne ! 🚀" au lieu du frontend.

**Cause** : Le domaine pointe directement vers l'API backend au lieu du frontend.

## Solution : Configuration Nginx pour Hostinger

Sur Hostinger, vous avez deux options :

### Option 1 : Configuration via hPanel (Recommandé)

1. **Connectez-vous à hPanel Hostinger**
2. Allez dans **Sites web** → **Gérer** → **Gestionnaire de fichiers**
3. Naviguez vers votre domaine : `domains/e-assime.com/public_html/`

### Option 2 : Configuration manuelle via fichiers

Sur Hostinger, vous pouvez créer des fichiers de configuration dans votre dossier.

---

## 📋 Structure recommandée

```
domains/
├── e-assime.com/                    # Domaine principal
│   └── public_html/
│       ├── index.html               # Redirection ou User Panel
│       └── .htaccess                # Configuration Apache/Nginx
│
├── app.e-assime.com/                 # User Panel (sous-domaine)
│   └── public_html/
│       └── [fichiers buildés user-panel/dist]
│
├── admin.e-assime.com/               # Admin Panel (sous-domaine)
│   └── public_html/
│       └── [fichiers buildés admin-panel/dist]
│
└── api.e-assime.com/                 # API Backend (sous-domaine)
    └── public_html/
        └── [proxy vers localhost:5000]
```

---

## 🚀 Étapes de configuration

### Étape 1 : Build des frontends

**Sur votre serveur Hostinger (SSH) :**

```bash
# Aller dans le dossier du projet
cd ~/domains/lightseagreen-pigeon-936389.hostingersite.com/public_html

# Build User Panel
cd user-panel
npm install
VITE_API_URL=https://api.e-assime.com/api npm run build

# Build Admin Panel
cd ../admin-panel
npm install
VITE_API_URL=https://api.e-assime.com/api npm run build
```

### Étape 2 : Copier les fichiers buildés

```bash
# Depuis le dossier racine du projet
cd ~/domains/lightseagreen-pigeon-936389.hostingersite.com/public_html

# Option A : Si vous avez des sous-domaines configurés
# Copier user-panel vers app.e-assime.com
cp -r user-panel/dist/* ~/domains/app.e-assime.com/public_html/

# Copier admin-panel vers admin.e-assime.com
cp -r admin-panel/dist/* ~/domains/admin.e-assime.com/public_html/

# Option B : Si vous voulez tout sur e-assime.com
# Copier user-panel vers le domaine principal
cp -r user-panel/dist/* ~/domains/e-assime.com/public_html/
```

### Étape 3 : Configurer le domaine principal (e-assime.com)

**Option A : Rediriger vers app.e-assime.com**

Créez `~/domains/e-assime.com/public_html/index.html` :

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://app.e-assime.com">
    <title>Redirection...</title>
</head>
<body>
    <p>Redirection en cours... <a href="https://app.e-assime.com">Cliquez ici</a></p>
</body>
</html>
```

**Option B : Servir directement le User Panel**

```bash
# Copier le User Panel directement
cp -r ~/domains/lightseagreen-pigeon-936389.hostingersite.com/public_html/user-panel/dist/* ~/domains/e-assime.com/public_html/
```

### Étape 4 : Configurer l'API (api.e-assime.com)

Sur Hostinger, vous pouvez créer un fichier `.htaccess` ou utiliser un script Node.js.

**Créer un fichier proxy pour l'API :**

```bash
cd ~/domains/api.e-assime.com/public_html
```

Créez un fichier `index.js` :

```javascript
const http = require('http');
const httpProxy = require('http-proxy-middleware');

const proxy = httpProxy.createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
});

http.createServer((req, res) => {
  proxy(req, res);
}).listen(80);
```

**OU** utilisez un fichier `.htaccess` (si Apache est disponible) :

```apache
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

---

## 🔧 Configuration via hPanel Hostinger

### Pour chaque sous-domaine :

1. **Créer les sous-domaines** :
   - Allez dans **Sites web** → **Gérer** → **Sous-domaines**
   - Créez : `app.e-assime.com`, `admin.e-assime.com`, `api.e-assime.com`

2. **Configurer le document root** :
   - Pour `app.e-assime.com` : `/home/u980915146/domains/app.e-assime.com/public_html`
   - Pour `admin.e-assime.com` : `/home/u980915146/domains/admin.e-assime.com/public_html`
   - Pour `api.e-assime.com` : Proxy vers `localhost:5000`

### Configuration Nginx personnalisée (si disponible)

Dans hPanel, allez dans **Sites web** → **Gérer** → **Configuration Nginx**

Pour `e-assime.com` (User Panel) :

```nginx
server {
    listen 80;
    server_name e-assime.com www.e-assime.com;
    
    root /home/u980915146/domains/e-assime.com/public_html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Pour `api.e-assime.com` :

```nginx
server {
    listen 80;
    server_name api.e-assime.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ✅ Vérification

1. **Vérifier que les fichiers sont présents** :
```bash
ls -la ~/domains/e-assime.com/public_html/
# Devrait contenir index.html et les assets du frontend
```

2. **Vérifier que l'API tourne** :
```bash
curl http://localhost:5000/api/health
# Devrait retourner {"status":"ok",...}
```

3. **Tester les URLs** :
- `http://e-assime.com` → Devrait afficher le User Panel
- `http://api.e-assime.com/api/health` → Devrait retourner l'API
- `http://app.e-assime.com` → Devrait afficher le User Panel
- `http://admin.e-assime.com` → Devrait afficher l'Admin Panel

---

## 🐛 Dépannage

### Le frontend ne s'affiche pas
- Vérifiez que les fichiers sont dans `public_html/`
- Vérifiez les permissions : `chmod -R 755 public_html/`
- Vérifiez que `index.html` existe

### L'API ne répond pas
- Vérifiez que Node.js tourne : `pm2 status` ou `ps aux | grep node`
- Vérifiez les logs : `pm2 logs lesigne-server`
- Testez localement : `curl http://localhost:5000/api/health`

### Erreur 404
- Vérifiez la configuration du document root dans hPanel
- Vérifiez que les sous-domaines sont bien configurés

---

## 📝 Notes importantes

- Sur Hostinger, vous n'avez peut-être pas accès direct à `/etc/nginx/`
- Utilisez hPanel pour configurer les domaines et sous-domaines
- Les fichiers doivent être dans `public_html/` pour être accessibles
- Assurez-vous que PM2 ou votre processus Node.js tourne en continu


