const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../config/database')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// --- Routes Admin ---

// Lister tous les utilisateurs (Admin seulement)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.plan, u.status, u.created_at,
        COUNT(DISTINCT s.id) as shop_count
      FROM users u
      LEFT JOIN shops s ON u.id = s.owner_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `
    const result = await db.query(query)
    res.json({ users: result.rows })
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Modifier le plan d'un utilisateur (Admin seulement)
router.put('/:id/plan', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { plan } = req.body
    const userId = req.params.id

    if (!['free', 'basic', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Plan invalide' })
    }

    const updateQuery = `
      UPDATE users 
      SET plan = ?, updated_at = NOW()
      WHERE id = ?
    `
    await db.query(updateQuery, [plan, userId])

    // FETCH AFTER UPDATE
    const result = await db.query('SELECT id, name, email, plan FROM users WHERE id = ?', [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json({
      message: 'Plan mis à jour avec succès',
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Erreur mise à jour plan:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// --- Routes Utilisateur ---

// Obtenir le profil utilisateur
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at, u.last_login,
        COUNT(DISTINCT s.id) as shop_count,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count
      FROM users u
      LEFT JOIN shops s ON u.id = s.owner_id
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id
      WHERE u.id = ?
      GROUP BY u.id
    `

    const result = await db.query(query, [req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json({ user: result.rows[0] })

  } catch (error) {
    console.error('Erreur profil utilisateur:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' })
  }
})

// Mettre à jour le profil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body
    const userId = req.user.id

    if (!name || !email) {
      return res.status(400).json({ error: 'Nom et email requis' })
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== req.user.email) {
      const emailCheck = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId])
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' })
      }
    }

    const updateQuery = `
      UPDATE users 
      SET name = ?, email = ?, updated_at = NOW()
      WHERE id = ?
    `

    await db.query(updateQuery, [name, email, userId])

    // FETCH AFTER UPDATE
    const result = await db.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [userId])

    res.json({
      message: 'Profil mis à jour avec succès',
      user: result.rows[0]
    })

  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' })
  }
})

// Changer le mot de passe
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
    }

    // Vérifier le mot de passe actuel
    const userQuery = 'SELECT password FROM users WHERE id = ?'
    const userResult = await db.query(userQuery, [userId])

    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password)
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' })
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour
    await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId])

    res.json({ message: 'Mot de passe mis à jour avec succès' })

  } catch (error) {
    console.error('Erreur changement mot de passe:', error)
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' })
  }
})

// Obtenir les statistiques utilisateur
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*)::integer FROM shops WHERE owner_id = ?) as total_shops,
        (SELECT COUNT(*)::integer FROM products p JOIN shops s ON p.shop_id = s.id WHERE s.owner_id = ?) as total_products,
        (SELECT COUNT(*)::integer FROM orders o JOIN shops s ON o.shop_id = s.id WHERE s.owner_id = ?) as total_orders,
        (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o JOIN shops s ON o.shop_id = s.id WHERE s.owner_id = ? AND o.status = 'completed') as total_revenue
    `

    const result = await db.query(statsQuery, [req.user.id])

    res.json({ stats: result.rows[0] })

  } catch (error) {
    console.error('Erreur statistiques utilisateur:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' })
  }
})

module.exports = router
