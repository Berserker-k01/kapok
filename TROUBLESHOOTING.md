# 🔧 Guide de Dépannage - Lesigne Platform

## 🚨 Problèmes Courants et Solutions

### 1. **Pages Blanches** ❌

**Symptômes :** Les panels affichent une page blanche sans contenu

**Causes possibles :**
- Erreurs JavaScript dans la console
- Composants React qui plantent
- Dépendances manquantes
- Configuration Tailwind incorrecte

**Solutions :**

1. **Vérifier la console du navigateur (F12)**
   ```
   Recherchez les erreurs en rouge dans l'onglet Console
   ```

2. **Utiliser les versions de debug**
   ```bash
   # User Panel
   cd user-panel/src
   copy App-debug.jsx App.jsx
   
   # Admin Panel  
   cd admin-panel/src
   copy App-debug.jsx App.jsx
   ```

3. **Réinstaller les dépendances**
   ```bash
   cd user-panel && npm install
   cd admin-panel && npm install
   ```

4. **Utiliser les versions fonctionnelles**
   ```bash
   # User Panel
   cd user-panel/src
   copy App-working.jsx App.jsx
   
   # Admin Panel
   cd admin-panel/src  
   copy App-working.jsx App.jsx
   ```

### 2. **Erreurs de Compilation** 🔥

**Symptômes :** Erreurs dans le terminal lors du `npm run dev`

**Solutions :**

1. **Erreurs d'imports**
   ```
   Vérifiez que tous les fichiers importés existent
   Utilisez des chemins relatifs corrects
   ```

2. **Erreurs Tailwind**
   ```bash
   # Vérifier la configuration
   cat tailwind.config.js
   
   # Régénérer les styles
   npm run build
   ```

3. **Erreurs de syntaxe**
   ```
   Vérifiez les accolades, parenthèses, virgules
   Utilisez un linter : npm run lint
   ```

### 3. **Ports Occupés** 🔌

**Symptômes :** "Port 3001 is in use"

**Solutions :**

1. **Arrêter tous les processus Node.js**
   ```bash
   taskkill /f /im node.exe
   ```

2. **Utiliser des ports différents**
   ```bash
   # User Panel sur port 3003
   cd user-panel
   npm run dev -- --port 3003
   
   # Admin Panel sur port 3004
   cd admin-panel  
   npm run dev -- --port 3004
   ```

3. **Identifier le processus qui utilise le port**
   ```bash
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

### 4. **Authentification ne Fonctionne Pas** 🔐

**Symptômes :** Impossible de se connecter, erreurs de login

**Solutions :**

1. **Utiliser les comptes de test**
   ```
   User Panel: Bouton "Connexion Démo" ou demo@user.com
   Admin Panel: admin@lesigne.com / admin123
   ```

2. **Vérifier le store Zustand**
   ```javascript
   // Dans la console du navigateur
   console.log(useAuthStore.getState())
   ```

3. **Réinitialiser l'état d'authentification**
   ```javascript
   // Dans la console du navigateur
   localStorage.clear()
   sessionStorage.clear()
   ```

### 5. **Styles CSS ne s'Appliquent Pas** 🎨

**Symptômes :** Interface sans styles, apparence cassée

**Solutions :**

1. **Vérifier que Tailwind est chargé**
   ```bash
   # Dans src/index.css
   @tailwind base;
   @tailwind components;  
   @tailwind utilities;
   ```

2. **Reconstruire les styles**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Utiliser des styles inline temporairement**
   ```jsx
   <div style={{padding: '20px', backgroundColor: '#f0f0f0'}}>
     Test
   </div>
   ```

## 🛠️ Outils de Diagnostic

### Script de Diagnostic Automatique
```bash
# Diagnostic complet
.\diagnose.ps1

# Diagnostic avec corrections automatiques
.\diagnose.ps1 -Fix

# Diagnostic verbose
.\diagnose.ps1 -Verbose
```

### Commandes de Debug Utiles

```bash
# Vérifier les processus Node.js
Get-Process -Name "node"

# Vérifier les ports utilisés
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :5000

# Vérifier les logs Vite
cd user-panel && npm run dev 2>&1 | Tee-Object -FilePath debug.log

# Tester les composants individuellement
cd user-panel/src && node -e "console.log('Test Node.js')"
```

### Tests de Fonctionnalité

1. **Test React de base**
   ```jsx
   // App-test.jsx
   function App() {
     return <div>React fonctionne !</div>
   }
   export default App
   ```

2. **Test Tailwind**
   ```jsx
   function App() {
     return (
       <div className="p-4 bg-blue-500 text-white">
         Tailwind fonctionne !
       </div>
     )
   }
   ```

3. **Test Router**
   ```jsx
   import { BrowserRouter, Routes, Route } from 'react-router-dom'
   
   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<div>Router fonctionne !</div>} />
         </Routes>
       </BrowserRouter>
     )
   }
   ```

## 🔄 Procédure de Reset Complet

Si rien ne fonctionne, suivez cette procédure :

```bash
# 1. Arrêter tous les processus
taskkill /f /im node.exe

# 2. Nettoyer les caches
cd user-panel
rm -rf node_modules .vite dist
cd ../admin-panel  
rm -rf node_modules .vite dist
cd ../server
rm -rf node_modules

# 3. Réinstaller tout
cd ..
.\install-all.bat

# 4. Utiliser les versions de travail
cd user-panel/src
copy App-working.jsx App.jsx
cd ../../admin-panel/src
copy App-working.jsx App.jsx

# 5. Redémarrer
cd ../..
.\start-dev.ps1
```

## 📞 Support

Si les problèmes persistent :

1. **Exécutez le diagnostic complet**
   ```bash
   .\diagnose.ps1 -Verbose > diagnostic.log
   ```

2. **Vérifiez les logs dans la console du navigateur**

3. **Consultez les fichiers de debug créés**
   - `App-debug.jsx` - Version ultra-simple
   - `App-working.jsx` - Version fonctionnelle
   - `App-complex.jsx` - Version complète originale

4. **Versions de fallback disponibles**
   - `App-test.jsx` - Test basique
   - `App-tailwind-test.jsx` - Test Tailwind
   - `App-router-test.jsx` - Test Router
   - `App-zustand-test.jsx` - Test Zustand
   - `App-toast-test.jsx` - Test Toast

---

**Lesigne Platform - Toujours fonctionnel ! 🚀**
