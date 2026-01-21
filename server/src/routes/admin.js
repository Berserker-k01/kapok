const express = require('express')
const db = require('../config/database')
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth')

const router = express.Router()

// Toutes les routes admin nécessitent une authentification admin
router.use(authenticateToken)
router.use(requireAdmin)

// Dashboard stats pour admin
router.get('/dashboard', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'user' AND status = 'active') as active_users,
        (SELECT COUNT(*) FROM shops) as total_shops,
        (SELECT COUNT(*) FROM shops WHERE status = 'active') as active_shops,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL 30 DAY) as new_users_30d
    `

    const result = await db.query(statsQuery)

    // Croissance mensuelle
    const growthQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-01') as month,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as new_users,
        (SELECT COUNT(*) FROM shops WHERE DATE_FORMAT(created_at, '%Y-%m-01') = DATE_FORMAT(u.created_at, '%Y-%m-01')) as new_shops,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed' AND DATE_FORMAT(created_at, '%Y-%m-01') = DATE_FORMAT(u.created_at, '%Y-%m-01')) as total_revenue
      FROM users u
      WHERE created_at >= CURRENT_DATE - INTERVAL 6 MONTH
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
      ORDER BY month DESC
    `

    const growthResult = await db.query(growthQuery)

    res.json({
      stats: result.rows[0],
      monthlyGrowth: growthResult.rows
    })

  } catch (error) {
    console.error('Erreur dashboard admin:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' })
  }
})

// --- Gestion des Paramètres Plateforme ---

// Récupérer les paramètres
router.get('/settings', async (req, res) => {
  try {
    const query = 'SELECT `key`, value FROM platform_settings'
    const result = await db.query(query)

    // Convertir en objet { key: value }
    const settings = result.rows.reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {})

    res.json({ settings })
  } catch (error) {
    console.error('Erreur récupération paramètres:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' })
  }
})

// Mettre à jour les paramètres
router.put('/settings', requireSuperAdmin, async (req, res) => {
  try {
    const settings = req.body // { platform_name: '...', ... }

    // On met à jour chaque clé reçue
    const keys = Object.keys(settings)

    for (const key of keys) {
      await db.query(
        'INSERT INTO platform_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()',
        [key, String(settings[key])]
      )
    }

    res.json({ message: 'Paramètres mis à jour avec succès' })
  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' })
  }
})

// Obtenir tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at, u.last_login, u.plan,
        COUNT(DISTINCT s.id) as shop_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        (SELECT current_period_end FROM subscriptions sub WHERE sub.user_id = u.id AND sub.status = 'active' LIMIT 1) as subscription_end
      FROM users u
      LEFT JOIN shops s ON u.id = s.owner_id
      LEFT JOIN orders o ON s.id = o.shop_id AND o.status = 'completed'
      WHERE u.role = 'user'
    `
    let queryParams = []

    // MySQL: pas de paramCount, juste l'ordre

    if (status) {
      query += ` AND u.status = ?`
      queryParams.push(status)
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ?)`
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await db.query(query, queryParams)

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Erreur récupération utilisateurs admin:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' })
  }
})

// Obtenir toutes les boutiques
router.get('/shops', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        s.*,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM shops s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id AND o.status = 'completed'
    `
    let queryParams = []
    let paramCount = 0

    if (status) {
      query += ` WHERE s.status = ?`
      queryParams.push(status)
    }

    query += ` GROUP BY s.id, u.name, u.email ORDER BY s.created_at DESC LIMIT ? OFFSET ?`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await db.query(query, queryParams)

    res.json({
      shops: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Erreur récupération boutiques admin:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des boutiques' })
  }
})

// Suspendre/Activer un utilisateur (Super Admin seulement)
router.put('/users/:userId/status', requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const userId = req.params.userId

    const validStatuses = ['active', 'suspended', 'banned']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }

    const updateQuery = `
      UPDATE users 
      SET status = ?, updated_at = NOW()
      WHERE id = ? AND role = 'user'
    `

    await db.query(updateQuery, [status, userId])

    // FETCH AFTER UPDATE
    const result = await db.query('SELECT id, name, email, status FROM users WHERE id = ?', [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json({
      message: 'Statut utilisateur mis à jour',
      user: result.rows[0]
    })

  } catch (error) {
    console.error('Erreur mise à jour statut utilisateur:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' })
  }
})

module.exports = router
