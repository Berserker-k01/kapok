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
    /\.vercel\.app$/ // Tous les sous-domaines Vercel
  ],
  credentials: true
}))

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', require('./routes/ai')); // Import direct pour l'IA

// Route racine pour vérifier que l'API tourne
app.get('/', (req, res) => {
  res.send('API Assimε est en ligne ! 🚀');
});

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
