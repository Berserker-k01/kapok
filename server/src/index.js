const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const shopRoutes = require('./routes/shops')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')
const adminRoutes = require('./routes/admin')
const subscriptionRoutes = require('./routes/subscriptions')
const subscriptionPaymentRoutes = require('./routes/subscriptionPayments')
const planConfigRoutes = require('./routes/planConfig')
const paymentConfigRoutes = require('./routes/paymentConfig')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5000

// --- DEBUG ENVIRONNEMENT (V8 - BUILD CHECK) ---
const fs = require('fs');
app.get('/env-debug', (req, res) => {
  const cwd = process.cwd();
  const userDistPath = path.join(__dirname, '../../user-panel/dist/index.html');
  const adminDistPath = path.join(__dirname, '../../admin-panel/dist/index.html');

  res.json({
    message: 'V8-BUILD-CHECK',
    env: process.env.NODE_ENV,
    cwd: cwd,
    has_env_root: fs.existsSync(path.join(cwd, '.env')),
    build_user_exists: fs.existsSync(userDistPath),
    build_admin_exists: fs.existsSync(adminDistPath),
    user_dist_path_checked: userDistPath
  });
});

// Trust Proxy pour Vercel/Heroku
app.set('trust proxy', 1);

// Middleware de sécurité
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', // client
    'http://localhost:3001', // user-panel
    'http://localhost:3002', // admin-panel
    process.env.FRONTEND_URL, // URL Vercel
    process.env.USER_PANEL_URL, // User Panel URL
    process.env.ADMIN_PANEL_URL, // Admin Panel URL
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/subscription-payments', subscriptionPaymentRoutes);
app.use('/api/admin/plans', planConfigRoutes);
app.use('/api/admin/payment-numbers', paymentConfigRoutes);
app.use('/api/ai', require('./routes/ai')); // Import direct pour l'IA

// Route racine retirée pour laisser React gérer le '/'
// app.get('/', ...);

// Route de santé pour les healthchecks
// Route de santé pour les healthchecks (Test connexion MySQL)
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
    database_connection: dbStatus,
    db_test_error: error,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handler
app.use(require('./middleware/errorHandler'));

// --- PRODUCTION: SERVIR LES FRONTENDS ---
if (process.env.NODE_ENV === 'production') {
  const adminDist = path.join(__dirname, '../../admin-panel/dist');
  const userDist = path.join(__dirname, '../../user-panel/dist');

  // 1. Admin Panel (/admin)
  app.use('/admin', express.static(adminDist));
  app.get(['/admin', '/admin/*'], (req, res) => {
    res.sendFile(path.join(adminDist, 'index.html'));
  });

  // 2. User Panel (/)
  app.use(express.static(userDist));
  app.get('*', (req, res) => {
    // Ne pas intercepter les API ou uploads qui ont échoué
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.join(userDist, 'index.html'));
  });
}

// --- ROUTE DIAGNOSTIC SCHEMA (V9) ---
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
      message: 'V9-SCHEMA-CHECK',
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
    console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 API disponible sur: http://localhost:${PORT}/api`)
  })
}
