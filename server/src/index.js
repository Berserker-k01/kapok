const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')

// --- CONFIGURATION STATIQUE (PLUS DE .ENV) ---
process.env.NODE_ENV = 'production';
// IMPORTANT: Hostinger/Heroku injectent le PORT dynamiquement. 
// Ne JAMAIS hardcoder le port en production si l'hébergeur le fournit.
const PORT = process.env.PORT || 5000;

const app = express()

// Trust Proxy pour Hostinger/Vercel
app.set('trust proxy', 1);

// Middleware de sécurité
app.use(helmet())

// Rate limiting (DÉSACTIVÉ TEMPORAIREMENT POUR DEBUG)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
// })
// app.use('/api/', limiter)

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DEBUG LOGGER (Capture les 20 dernières requêtes) ---
// PLACÉ APRÈS LE BODY PARSER POUR VOIR LES DONNÉES
const debugLogs = [];
app.use((req, res, next) => {
  const log = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    bodyKeys: Object.keys(req.body || {}), // Devrait maintenant voir les clés
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      contentType: req.headers['content-type']
    }
  };
  debugLogs.unshift(log);
  if (debugLogs.length > 20) debugLogs.pop();
  next();
});
app.get('/api/debug-requests', (req, res) => res.json(debugLogs));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Check
app.get('/env-debug', (req, res) => {
  res.json({
    message: 'HARDCODED-CONFIG-CHECK',
    env: process.env.NODE_ENV,
    port: PORT,
    cwd: process.cwd()
  });
});

app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnect';
  let error = null;
  try {
    const db = require('./config/database');
    await db.pool.execute('SELECT 1');
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'error';
    error = e.message;
  }

  res.status(dbStatus === 'connected' ? 200 : 500).json({
    status: dbStatus === 'connected' ? 'ok' : 'error',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// --- ROUTE DIAGNOSTIC SCHEMA (POUR DEBUGGER HOSTINGER) ---
app.get('/api/debug-schema', async (req, res) => {
  try {
    const db = require('./config/database');
    const [tables] = await db.pool.execute('SHOW TABLES');

    let usersInfo = { status: 'missing', error: null };
    try {
      const [rows] = await db.pool.execute('SELECT count(*) as count FROM users');
      const [columns] = await db.pool.execute('DESCRIBE users');
      usersInfo = { status: 'exists', count: rows[0].count, columns: columns.map(c => c.Field) };
    } catch (e) { usersInfo.error = e.message; }

    res.json({
      message: 'SCHEMA-CHECK-V2',
      tables: tables,
      users_check: usersInfo
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ROUTE DEBUG REGISTER (SIMULATION INSCRIPTION) ---
app.get('/api/debug-register', async (req, res) => {
  const logs = [];
  const log = (msg, data) => logs.push({ msg, data: data || null });

  try {
    const db = require('./config/database');
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');

    log('1. Début du test d\'inscription');

    // Génération données test
    const email = `debug-${Date.now()}@test.com`;
    const password = 'password123';
    const name = 'Debug User';
    const userId = uuidv4();

    log('2. Données générées', { email, userId });

    // Hachage
    const hashedPassword = await bcrypt.hash(password, 12);
    log('3. Mot de passe haché OK');

    const insertQuery = `
      INSERT INTO users (id, name, email, password, role, status, created_at)
      VALUES (?, ?, ?, ?, 'user', 'active', NOW())
    `;

    log('4. Tentative INSERT...');
    await db.query(insertQuery, [userId, name, email, hashedPassword]);
    log('5. INSERT terminé');

    log('6. Vérification SELECT...');
    const result = await db.query('SELECT id, email, created_at FROM users WHERE id = ?', [userId]);

    if (result.rows && result.rows.length > 0) {
      log('✅ EXTRACT: Utilisateur retrouvé en base !', result.rows[0]);
    } else {
      log('❌ FATAL: Utilisateur introuvable après insert (problème transaction ?)');
    }

    res.json({
      status: 'success',
      logs: logs
    });

  } catch (error) {
    log('❌ ERREUR CRITIQUE', error.message);
    res.status(500).json({
      status: 'error',
      logs: logs,
      stack: error.stack
    });
  }
});

// --- ROUTE DEBUG DATA (VERIFIER CONTENU TABLES SYSTEME) ---
app.get('/api/debug-data', async (req, res) => {
  try {
    const db = require('./config/database');
    const logs = {};

    // Vérifier les plans
    const [plans] = await db.pool.execute('SELECT * FROM plans_config');
    logs.plans = plans;

    // Vérifier les settings
    const [settings] = await db.pool.execute('SELECT * FROM platform_settings');
    logs.settings = settings;

    // Vérifier les moyens de paiement
    const [payments] = await db.pool.execute('SELECT * FROM payment_config');
    logs.payment_methods = payments;

    res.json({
      status: 'success',
      data: logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// --- ROUTE DIAGNOSTIC COMPLET (TEST DB & LOGIC) ---
app.get('/api/diagnose', async (req, res) => {
  const runDiagnosis = require('../diagnose-db');
  const report = await runDiagnosis();
  res.json({ report });
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/subscription-payments', require('./routes/subscriptionPayments'));
app.use('/api/plans', require('./routes/planConfig')); // CHANGED: Was /api/admin/plans
app.use('/api/admin/payment-numbers', require('./routes/paymentConfig')); // Admin only
app.use('/api/ai', require('./routes/ai'));

// Error Handler
app.use(require('./middleware/errorHandler'));

// --- PRODUCTION: SERVIR LES FRONTENDS ---
const adminDist = path.join(__dirname, '../../admin-panel/dist');
const userDist = path.join(__dirname, '../../user-panel/dist');

// 1. Admin Panel (/admin)
app.use('/admin', express.static(adminDist));
app.get(['/admin', '/admin/*'], (req, res) => {
  if (fs.existsSync(path.join(adminDist, 'index.html'))) {
    res.sendFile(path.join(adminDist, 'index.html'));
  } else {
    res.status(404).send('Admin Panel Build Not Found');
  }
});

// 2. User Panel (/)
app.use(express.static(userDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  if (fs.existsSync(path.join(userDist, 'index.html'))) {
    res.sendFile(path.join(userDist, 'index.html'));
  } else {
    res.status(404).send('User Panel Build Not Found');
  }
});


// Export pour Vercel (Serverless)
module.exports = app;

// Démarrage serveur (Local uniquement)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Assimε démarré sur le port ${PORT}`)
  })
}
