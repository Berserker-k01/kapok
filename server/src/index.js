const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

// --- CONFIGURATION ---
const PORT = process.env.PORT || 5000

const app = express()

// Trust Proxy (Docker/Nginx)
app.set('trust proxy', 1)

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Helmet — sécurité avec CSP permissif pour images/styles
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://connect.facebook.net", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      // PAS de upgradeInsecureRequests tant que HTTPS n'est pas activé
    },
  },
}))

// Rate limiting
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
  })
  app.use('/api/', limiter)
}

// Middleware de parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Sécurité: Strip double /api/api/ → /api/
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/')
  }
  next()
})

// --- UPLOADS: Fichiers statiques (images uploadées) ---
const uploadDir = process.env.UPLOAD_PATH
  ? path.resolve(process.env.UPLOAD_PATH)
  : path.join(__dirname, '../uploads')

console.log('------------------------------------------------')
console.log('[Server] 📂 Static files configuration:')
console.log(`[Server]    Upload Path: ${uploadDir}`)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
    console.log('[Server]    Created uploads directory')
  }
  // Créer sous-dossier payment-proofs
  const proofDir = path.join(uploadDir, 'payment-proofs')
  if (!fs.existsSync(proofDir)) {
    fs.mkdirSync(proofDir, { recursive: true })
  }
  fs.accessSync(uploadDir, fs.constants.W_OK)
  const files = fs.readdirSync(uploadDir).filter(f => f !== '.gitkeep')
  console.log(`[Server]    Status: ✅ Writable (${files.length} items)`)
} catch (e) {
  console.error(`[Server]    Status: ❌ Error (${e.message})`)
}
console.log('------------------------------------------------')

app.use('/api/uploads', express.static(uploadDir))
app.use('/uploads', express.static(uploadDir))

// --- HEALTH CHECK ---
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected'
  try {
    const db = require('./config/database')
    await db.pool.query('SELECT 1')
    dbStatus = 'connected'
  } catch (e) {
    dbStatus = 'error: ' + e.message
  }

  res.status(dbStatus === 'connected' ? 200 : 500).json({
    status: dbStatus === 'connected' ? 'ok' : 'error',
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// --- DIAGNOSTIC IMAGES ---
app.get('/api/debug-images', async (req, res) => {
  try {
    const db = require('./config/database')

    const uploadInfo = {
      path: uploadDir,
      exists: fs.existsSync(uploadDir),
      files: [],
    }
    if (uploadInfo.exists) {
      try {
        uploadInfo.files = fs.readdirSync(uploadDir).filter(f => f !== '.gitkeep').slice(0, 20)
      } catch (e) { uploadInfo.files = ['ERROR: ' + e.message] }
    }

    const result = await db.query('SELECT id, name, images, created_at FROM products ORDER BY created_at DESC LIMIT 5')
    const productsDebug = result.rows.map(p => {
      let images = p.images
      if (typeof images === 'string') {
        try { images = JSON.parse(images) } catch (e) { images = p.images }
      }
      const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null
      let fileExists = false
      if (firstImage) {
        const filename = firstImage.split('/').pop()
        fileExists = fs.existsSync(path.join(uploadDir, filename))
      }
      return { id: p.id, name: p.name, images, firstImage, fileExists }
    })

    const shopsResult = await db.query('SELECT id, name, logo_url, banner_url FROM shops LIMIT 5')

    res.json({ uploads: uploadInfo, products: productsDebug, shops: shopsResult.rows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// --- ROUTES API ---
app.use(require('./middleware/subdomainMiddleware'))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/shops', require('./routes/shops'))
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/subscriptions', require('./routes/subscriptions'))
app.use('/api/subscription-payments', require('./routes/subscriptionPayments'))
app.use('/api/plans', require('./routes/planConfig'))
app.use('/api/admin/payment-numbers', require('./routes/paymentConfig'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/collections', require('./routes/collections'))

// Error Handler
app.use(require('./middleware/errorHandler'))

// --- PRODUCTION: SERVIR LES FRONTENDS ---
// En Docker: /app/admin-panel-dist et /app/user-panel-dist
// En local/dev: ../../admin-panel/dist et ../../user-panel/dist
const adminDist = process.env.ADMIN_DIST_PATH
  || (fs.existsSync(path.join(__dirname, '../admin-panel-dist'))
    ? path.join(__dirname, '../admin-panel-dist')
    : path.join(__dirname, '../../admin-panel/dist'))

const userDist = process.env.USER_DIST_PATH
  || (fs.existsSync(path.join(__dirname, '../user-panel-dist'))
    ? path.join(__dirname, '../user-panel-dist')
    : path.join(__dirname, '../../user-panel/dist'))

// 1. Admin Panel (/admin)
app.use('/admin', express.static(adminDist))
app.get(['/admin', '/admin/*'], (req, res) => {
  const indexPath = path.join(adminDist, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Admin Panel Build Not Found')
  }
})

// 2. User Panel (/)
app.use(express.static(userDist))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Not Found' })
  }
  const indexPath = path.join(userDist, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('User Panel Build Not Found')
  }
})

// Export pour tests
module.exports = app

// Démarrage serveur
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Assimε démarré sur le port ${PORT} (${process.env.NODE_ENV || 'development'})`)
  })
}
