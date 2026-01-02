/**
 * Point d'entrée pour Hostinger Node.js Selector
 */
const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
require('dotenv').config(); // Fallback à la racine

// Charger l'application backend directement
// Note: On utilise le chemin relatif sans process.chdir pour éviter les effets de bord sur Hostinger
const app = require('./server/src/index.js');

const PORT = process.env.PORT || 5000;

// En production sur Hostinger, le serveur doit écouter sur le port fourni par l'environnement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Assimε démarré sur le port ${PORT}`);
  });
}

module.exports = app;

