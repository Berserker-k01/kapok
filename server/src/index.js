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

// Route de santé pour les healthchecks (Toujours accessible)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'ok';
  try {
    const db = require('./config/database');
    await db.query('SELECT 1');
  } catch (error) {
    dbStatus = 'error: ' + error.message;
  }

  res.status(200).json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Servir les frontends en production
if (process.env.NODE_ENV === 'production') {
  const adminDist = path.join(__dirname, '../../admin-panel/dist');
  const userDist = path.join(__dirname, '../../user-panel/dist');

  console.log('📦 Mode Production : Chargement des frontends...');
  console.log(`- Admin: ${adminDist}`);
  console.log(`- User: ${userDist}`);

  // Admin panel sur /admin
  app.use('/admin', express.static(adminDist));
  app.get(['/admin', '/admin/*'], (req, res) => {
    console.log(`💼 [Routing] Servir Admin Panel pour: ${req.path}`);
    res.sendFile(path.join(adminDist, 'index.html'));
  });

  // User panel à la racine
  app.use(express.static(userDist));

  // Catch-all pour React Router (doit être le DERNIER)
  app.get('*', (req, res) => {
    console.log(`🔍 [Routing] Catch-all pour: ${req.path}`);

    // Si c'est une route /api qui n'existe pas, 404
    if (req.path.startsWith('/api')) {
      console.log(`❌ [Routing] Route API non trouvée: ${req.path}`);
      return res.status(404).json({ error: 'Route API non trouvée' });
    }

    // Sinon, on sert le panel utilisateur
    console.log(`📄 [Routing] Envoi de index.html pour: ${req.path}`);
    res.sendFile(path.join(userDist, 'index.html'));
  });
} else {
  // En développement, une petite route root pour tester
  app.get('/', (req, res) => {
    res.send('API Assimε est en ligne ! 🚀 (Mode Développement)');
  });
}

// Error handler
app.use(require('./middleware/errorHandler'));

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
