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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://e-assime.com',
    'https://admin.e-assime.com',
    'https://www.e-assime.com',
    /\.vercel\.app$/, // Tous les sous-domaines Vercel
    /\.fly\.dev$/ // Tous les sous-domaines Fly.io
  ],
  credentials: true
}))

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/subscription-payments', require('./routes/subscriptionPayments'));
app.use('/api/admin/plans', require('./routes/planConfig'));
app.use('/api/admin/payment-numbers', require('./routes/paymentConfig'));
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

// Export pour Vercel (Serverless)
module.exports = app;

// Démarrage serveur (Local uniquement)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Assimε démarré sur le port ${PORT}`)
  })
}
