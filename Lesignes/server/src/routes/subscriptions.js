const express = require('express')
const db = require('../config/database')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Obtenir les abonnements (admin seulement)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        u.name as user_name,
        u.email as user_email
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `
    
    const result = await db.query(query)

    res.json({
      subscriptions: result.rows
    })

  } catch (error) {
    console.error('Erreur récupération abonnements:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des abonnements' })
  }
})

module.exports = router
