/**
 * Point d'entrée pour Hostinger Node.js Selector
 */
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
require('dotenv').config(); // Fallback à la racine

// Charger l'application backend directement
const app = require('./server/src/index.js');
const fs = require('fs');

// --- DEBUG ENVIRONNEMENT (V6) ---
app.get('/env-debug', (req, res) => {
  const cwd = process.cwd();
  const files = fs.readdirSync(cwd);
  res.json({
    message: 'V6-ENV-DEBUG',
    cwd: cwd,
    files_in_root: files,
    has_env: fs.existsSync('.env'),
    env_db_url: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'
  });
});

const PORT = process.env.PORT || 5000;

// En production sur Hostinger, le serveur doit écouter sur le port fourni par l'environnement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Assimε démarré sur le port ${PORT}`);
  });
}

module.exports = app;
