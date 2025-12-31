const jwt = require('jsonwebtoken')
const db = require('../config/database')

const JWT_SECRET = process.env.JWT_SECRET || 'lesigne_secret_key_2024'

// Middleware d'authentification générique
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Cas spécial pour l'admin démo (bypass DB)
    if (decoded.userId === 'admin-demo') {
      req.user = {
        id: 'admin-demo',
        email: 'admin@assime.com',
        role: 'super_admin',
        status: 'active'
      }
      return next()
    }

    // Vérifier si l'utilisateur existe toujours
    const userQuery = 'SELECT id, email, role, status FROM users WHERE id = $1'
    const userResult = await db.query(userQuery, [decoded.userId])

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' })
    }

    const user = userResult.rows[0]

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Compte suspendu ou inactif' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(403).json({ error: 'Token invalide ou erreur serveur' })
  }
}

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accès administrateur requis' })
  }
  next()
}

// Middleware pour vérifier le rôle super admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accès super administrateur requis' })
  }
  next()
}

// Middleware pour vérifier la propriété d'une boutique
const requireShopOwnership = async (req, res, next) => {
  try {
    const shopId = req.params.shopId || req.body.shopId

    if (!shopId) {
      return res.status(400).json({ error: 'ID de boutique requis' })
    }

    // Vérifier si l'utilisateur possède cette boutique
    const query = 'SELECT id FROM shops WHERE id = $1 AND owner_id = $2'
    const result = await db.query(query, [shopId, req.user.id])

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Accès non autorisé à cette boutique' })
    }

    req.shop = result.rows[0]
    next()
  } catch (error) {
    console.error('Erreur vérification propriété boutique:', error)
    res.status(500).json({ error: 'Erreur interne' })
  }
}

// Générer un token JWT
const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  requireShopOwnership,
  generateToken,
  JWT_SECRET
}
