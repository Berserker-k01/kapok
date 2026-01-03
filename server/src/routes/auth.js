const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const validator = require('validator')
const db = require('../config/database')
const { generateToken, authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Inscription utilisateur
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation des données
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email invalide' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const userId = uuidv4()
    const insertQuery = `
      INSERT INTO users (id, name, email, password, role, status, created_at)
      VALUES ($1, $2, $3, $4, 'user', 'active', NOW())
      RETURNING id, name, email, role, created_at
    `

    const result = await db.query(insertQuery, [userId, name, email, hashedPassword])
    const user = result.rows[0]

    // Générer le token
    const token = generateToken(user.id, user.role)

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('Erreur inscription:', error)
    res.status(500).json({ error: 'Erreur lors de l\'inscription : ' + error.message })
  }
})

// Connexion utilisateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

    // Trouver l'utilisateur
    const userQuery = 'SELECT id, name, email, password, role, status FROM users WHERE email = $1'
    const userResult = await db.query(userQuery, [email])

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' })
    }

    const user = userResult.rows[0]

    // Vérifier le statut du compte
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Compte suspendu ou inactif' })
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' })
    }

    // Mettre à jour la dernière connexion
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    // Générer le token
    const token = generateToken(user.id, user.role)

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('Erreur connexion:', error)
    res.status(500).json({ error: 'Erreur lors de la connexion : ' + error.message })
  }
})

// Connexion administrateur
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

    // Connexion démo admin
    if (email === 'admin@assime.com' && password === 'admin123') {
      const token = generateToken('admin-demo', 'super_admin')
      return res.json({
        message: 'Connexion admin démo réussie',
        user: {
          id: 'admin-demo',
          name: 'Super Admin',
          email: 'admin@assime.com',
          role: 'super_admin'
        },
        token
      })
    }

    // Trouver l'admin
    const adminQuery = `
      SELECT id, name, email, password, role, status 
      FROM users 
      WHERE email = $1 AND (role = 'admin' OR role = 'super_admin')
    `
    const adminResult = await db.query(adminQuery, [email])

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'Accès administrateur non autorisé' })
    }

    const admin = adminResult.rows[0]

    if (admin.status !== 'active') {
      return res.status(401).json({ error: 'Compte administrateur suspendu' })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' })
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [admin.id])

    const token = generateToken(admin.id, admin.role)

    res.json({
      message: 'Connexion administrateur réussie',
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token
    })

  } catch (error) {
    console.error('Erreur connexion admin:', error)
    res.status(500).json({ error: 'Erreur lors de la connexion administrateur : ' + error.message })
  }
})

// Vérification du token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  })
})

// Déconnexion (côté client principalement)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Déconnexion réussie' })
})

module.exports = router
