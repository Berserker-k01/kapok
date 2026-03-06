const express = require('express')
const db = require('../config/database')
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth')
const bcrypt = require('bcryptjs')

const router = express.Router()

// Toutes les routes admin nécessitent une authentification admin
router.use(authenticateToken)
router.use(requireAdmin)

// Dashboard stats pour admin
router.get('/dashboard', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*)::integer FROM users WHERE role = 'user') as total_users,
        (SELECT COUNT(*)::integer FROM users WHERE role = 'user' AND status = 'active') as active_users,
        (SELECT COUNT(*)::integer FROM shops) as total_shops,
        (SELECT COUNT(*)::integer FROM shops WHERE status = 'active') as active_shops,
        (SELECT COUNT(*)::integer FROM products) as total_products,
        (SELECT COUNT(*)::integer FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*)::integer FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d
    `

    const result = await db.query(statsQuery)

    // Croissance mensuelle
    const growthQuery = `
      SELECT 
        m.month,
        COALESCE(u_stats.new_users, 0)::integer as new_users,
        COALESCE(s_stats.new_shops, 0)::integer as new_shops,
        COALESCE(o_stats.total_revenue, 0) as total_revenue
      FROM (
        SELECT DISTINCT TO_CHAR(created_at, 'YYYY-MM-01') as month
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      ) m
      LEFT JOIN (
        SELECT TO_CHAR(created_at, 'YYYY-MM-01') as month, COUNT(*)::integer as new_users
        FROM users WHERE role = 'user' AND created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-01')
      ) u_stats ON m.month = u_stats.month
      LEFT JOIN (
        SELECT TO_CHAR(created_at, 'YYYY-MM-01') as month, COUNT(*)::integer as new_shops
        FROM shops WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-01')
      ) s_stats ON m.month = s_stats.month
      LEFT JOIN (
        SELECT TO_CHAR(created_at, 'YYYY-MM-01') as month, COALESCE(SUM(total_amount), 0) as total_revenue
        FROM orders WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-01')
      ) o_stats ON m.month = o_stats.month
      ORDER BY m.month DESC
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
    const query = 'SELECT key, value FROM platform_settings'
    const result = await db.query(query)

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
    const settings = req.body

    const keys = Object.keys(settings)

    for (const key of keys) {
      await db.query(
        `INSERT INTO platform_settings (key, value) VALUES (?, ?)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
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
        COUNT(DISTINCT s.id)::integer as shop_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        (SELECT current_period_end FROM subscriptions sub WHERE sub.user_id = u.id AND sub.status = 'active' LIMIT 1) as subscription_end
      FROM users u
      LEFT JOIN shops s ON u.id = s.owner_id
      LEFT JOIN orders o ON s.id = o.shop_id AND o.status = 'completed'
      WHERE u.role = 'user'
    `
    let queryParams = []

    if (status) {
      query += ` AND u.status = ?`
      queryParams.push(status)
    }

    if (search) {
      query += ` AND (u.name ILIKE ? OR u.email ILIKE ?)`
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
        COUNT(DISTINCT p.id)::integer as product_count,
        COUNT(DISTINCT o.id)::integer as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM shops s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id AND o.status = 'completed'
    `
    let queryParams = []

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

// Obtenir tous les produits de toutes les boutiques
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        p.*,
        s.name as shop_name,
        s.slug as shop_slug,
        u.name as owner_name,
        u.email as owner_email
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      JOIN users u ON s.owner_id = u.id
    `
    let queryParams = []

    if (search) {
      query += ` WHERE p.name ILIKE ? OR s.name ILIKE ? OR u.name ILIKE ?`
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await db.query(query, queryParams)

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Erreur récupération produits admin:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' })
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

// Réinitialiser le mot de passe d'un utilisateur (Admin)
router.post('/users/:userId/reset-password', async (req, res) => {
  try {
    const userId = req.params.userId
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId])

    res.json({ message: 'Mot de passe réinitialisé avec succès' })
  } catch (error) {
    console.error('Erreur reset password:', error)
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' })
  }
})

// Annuler le plan d'un utilisateur (Admin)
router.post('/users/:userId/cancel-plan', async (req, res) => {
  try {
    const userId = req.params.userId

    await db.query("UPDATE users SET plan = 'free', updated_at = NOW() WHERE id = ?", [userId])

    await db.query("UPDATE subscriptions SET status = 'cancelled', current_period_end = NOW() WHERE user_id = ? AND status = 'active'", [userId])

    res.json({ message: 'Plan annulé avec succès' })
  } catch (error) {
    console.error('Erreur annulation plan:', error)
    res.status(500).json({ error: 'Erreur lors de l\'annulation du plan' })
  }
})

// ============================================
// --- Gestion des Administrateurs ---
// ============================================

// Lister tous les admins
router.get('/admins', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, status, created_at, last_login
       FROM users WHERE role IN ('admin', 'super_admin')
       ORDER BY role DESC, created_at ASC`
    )
    res.json({ admins: result.rows })
  } catch (error) {
    console.error('Erreur liste admins:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des administrateurs' })
  }
})

// Créer un nouvel admin (Super Admin seulement)
router.post('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe sont requis' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' })
    }
    const validRoles = ['admin', 'super_admin']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' })
    }

    // Vérifier si l'email existe déjà
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { v4: uuidv4 } = require('uuid')
    const userId = uuidv4()

    await db.query(
      `INSERT INTO users (id, name, email, password, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [userId, name, email, hashedPassword, role]
    )

    const result = await db.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [userId])
    res.status(201).json({ message: 'Administrateur créé avec succès', admin: result.rows[0] })
  } catch (error) {
    console.error('Erreur création admin:', error)
    res.status(500).json({ error: 'Erreur lors de la création de l\'administrateur' })
  }
})

// Modifier un admin (Super Admin seulement)
router.put('/admins/:adminId', requireSuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params
    const { name, email, password, role } = req.body

    const adminCheck = await db.query(
      "SELECT id FROM users WHERE id = ? AND role IN ('admin', 'super_admin')", [adminId]
    )
    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Administrateur non trouvé' })
    }

    // Vérifier que l'email n'est pas pris par un autre utilisateur
    if (email) {
      const emailCheck = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, adminId])
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' })
      }
    }

    const fields = []
    const params = []

    if (name) { fields.push('name = ?'); params.push(name) }
    if (email) { fields.push('email = ?'); params.push(email) }
    if (role && ['admin', 'super_admin'].includes(role)) { fields.push('role = ?'); params.push(role) }
    if (password && password.length >= 6) {
      const hashed = await bcrypt.hash(password, 10)
      fields.push('password = ?')
      params.push(hashed)
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' })
    }

    fields.push('updated_at = NOW()')
    params.push(adminId)

    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params)

    const result = await db.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [adminId])
    res.json({ message: 'Administrateur mis à jour', admin: result.rows[0] })
  } catch (error) {
    console.error('Erreur mise à jour admin:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour' })
  }
})

// Supprimer un admin (Super Admin seulement, ne peut pas se supprimer lui-même)
router.delete('/admins/:adminId', requireSuperAdmin, async (req, res) => {
  try {
    const { adminId } = req.params

    if (adminId === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
    }

    const adminCheck = await db.query(
      "SELECT id FROM users WHERE id = ? AND role IN ('admin', 'super_admin')", [adminId]
    )
    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Administrateur non trouvé' })
    }

    await db.query('DELETE FROM users WHERE id = ?', [adminId])
    res.json({ message: 'Administrateur supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression admin:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression' })
  }
})

module.exports = router
