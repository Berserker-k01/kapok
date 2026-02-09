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

// CORS Configuration permissive pour supporter PWA/Mobile
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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

// SÉCURITÉ DOUBLE API PATH: Strip /api/api/ -> /api/
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  }
  next();
});

// --- DEBUG LOGGER SIMPLIFIÉ (Non-bloquant) ---
// Patch pour gérer BigInt (MySQL COUNT retourne BigInt)
BigInt.prototype.toJSON = function () { return this.toString() }

const REQUEST_LOGS = [];
app.use((req, res, next) => {
  // Prevent circular reference: Do not log the debug-requests endpoint itself
  if (req.url.startsWith('/api/debug-requests')) return next();

  const start = Date.now();
  const logEntry = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    ip: req.ip
  };

  // Capture response
  const oldJson = res.json;
  res.json = function (data) {
    logEntry.response = data;
    logEntry.duration = Date.now() - start;
    if (REQUEST_LOGS.length > 50) REQUEST_LOGS.shift();
    REQUEST_LOGS.push(logEntry);
    return oldJson.apply(res, arguments);
  };

  next();
});

app.get('/api/debug-requests', (req, res) => {
  const db = require('./config/database');

  res.json({
    status: 'active',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: PORT,
      API_URL: process.env.API_URL
    },
    requests_count: REQUEST_LOGS.length,
    logs: REQUEST_LOGS
  });
});

// Servir les fichiers statiques (images uploadées)
// Servir les fichiers statiques (images uploadées) - Alias pour accès via API router
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
// Garder l'ancien alias au cas où
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

// --- ROUTE DIAGNOSTIC CONFIG DB (AFFICHER LA CONFIG UTILISÉE) ---
app.get('/api/debug-db-config', async (req, res) => {
  try {
    const db = require('./config/database');

    // Récupérer la config du pool (sans le mot de passe complet)
    const config = db.pool.pool.config.connectionConfig;

    res.json({
      message: 'DB-CONFIG-CHECK',
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database,
        passwordLength: config.password ? config.password.length : 0,
        passwordFirstChar: config.password ? config.password[0] : null,
        passwordLastChar: config.password ? config.password[config.password.length - 1] : null
      },
      env_vars: {
        DB_HOST: process.env.DB_HOST || 'NOT SET',
        DB_USER: process.env.DB_USER || 'NOT SET',
        DB_NAME: process.env.DB_NAME || 'NOT SET',
        DB_PORT: process.env.DB_PORT || 'NOT SET',
        DB_PASSWORD_SET: !!process.env.DB_PASSWORD
      }
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
      stack: e.stack
    });
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
app.use('/api/collections', require('./routes/collections'));

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
