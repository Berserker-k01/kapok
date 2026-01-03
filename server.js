/**
 * NOUVEAU POINT D'ENTRÉE - SOLUTION DE SECOURS
 * Ce fichier remplace index.js pour forcer Hostinger à rafraîchir le cache.
 */
const path = require('path');
const express = require('express');

// 1. Initialisation express
const app = express();

// 2. Chargement des variables d'environnement
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
require('dotenv').config();

// 3. LOG DE DÉMARRAGE (Visible dans les logs Hostinger)
const startupTime = new Date().toISOString();
console.log(`[${startupTime}] >>> DÉMARRAGE DU SERVEUR (NOUVELLE SOLUTION) <<<`);

// 4. TEST DE SANTÉ IMMÉDIAT (Pour vérifier si ce fichier tourne)
app.get('/api/health-check-v5', async (req, res) => {
    let dbStatus = 'waiting';
    let dbError = null;
    try {
        const db = require('./server/src/config/database');
        await db.query('SELECT 1');
        dbStatus = 'ok';
    } catch (e) {
        dbStatus = 'error';
        dbError = e.message;
    }

    res.json({
        status: 'UP',
        version: 'v5.0-FLAT',
        startup: startupTime,
        database: dbStatus,
        db_error: dbError,
        env_check: !!process.env.DATABASE_URL,
        cwd: process.cwd()
    });
});

// 5. Chargement de l'application réelle
const mainApp = require('./server/src/index.js');
app.use(mainApp);

// 6. Écoute
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur le port ${PORT}`);
});

module.exports = app;
