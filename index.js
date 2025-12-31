/**
 * Point d'entrée pour Hostinger Auto-Deploy
 * Ce fichier permet à Hostinger de détecter et démarrer l'application Node.js
 */

const path = require('path');
const fs = require('fs');

// Chemin vers le dossier server
const serverPath = path.join(__dirname, 'server');

// Vérifier que le dossier server existe
if (!fs.existsSync(serverPath)) {
  console.error('❌ Erreur: Le dossier server/ n\'existe pas');
  process.exit(1);
}

// Charger les variables d'environnement depuis server/.env si existe
const envPath = path.join(serverPath, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  // Essayer de charger depuis la racine
  require('dotenv').config();
}

// Changer le répertoire de travail vers server/
process.chdir(serverPath);

// Démarrer l'application
try {
  require('./src/index.js');
} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error);
  process.exit(1);
}

