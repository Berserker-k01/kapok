const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const validator = require('validator')
const db = require('../config/database')
const { generateToken, authenticateToken } = require('../middleware/auth')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')

const router = express.Router()

// Inscription utilisateur
router.post('/register', catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body

  // Validation des données
  if (!name || !email || !password) {
    return next(new AppError('Tous les champs sont requis', 400));
  }

  if (!validator.isEmail(email)) {
    return next(new AppError('Email invalide', 400));
  }

  if (password.length < 6) {
    return next(new AppError('Le mot de passe doit contenir au moins 6 caractères', 400));
  }

  // Vérifier si l'email existe déjà
  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
  if (existingUser.rows.length > 0) {
    return next(new AppError('Cet email est déjà utilisé', 400));
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
    status: 'success',
    message: 'Inscription réussie',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  })
}))

// Connexion utilisateur
router.post('/login', catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    return next(new AppError('Email et mot de passe requis', 400));
  }

  // Trouver l'utilisateur
  const userQuery = 'SELECT id, name, email, password, role, status FROM users WHERE email = $1'
  const userResult = await db.query(userQuery, [email])

  if (userResult.rows.length === 0) {
    return next(new AppError('Identifiants invalides', 401));
  }

  const user = userResult.rows[0]

  // Vérifier le statut du compte
  if (user.status !== 'active') {
    return next(new AppError('Compte suspendu ou inactif', 401));
  }

  // Vérifier le mot de passe
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return next(new AppError('Identifiants invalides', 401));
  }

  // Mettre à jour la dernière connexion
  await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

  // Générer le token
  const token = generateToken(user.id, user.role)

  res.json({
    status: 'success',
    message: 'Connexion réussie',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  })
}))

// Connexion administrateur
router.post('/admin/login', catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    return next(new AppError('Email et mot de passe requis', 400));
  }

  // Connexion démo admin
  if (email === 'admin@assime.com' && password === 'admin123') {
    const token = generateToken('admin-demo', 'super_admin')
    return res.json({
      status: 'success',
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
    return next(new AppError('Accès administrateur non autorisé', 401));
  }

  const admin = adminResult.rows[0]

  if (admin.status !== 'active') {
    return next(new AppError('Compte administrateur suspendu', 401));
  }

  const isValidPassword = await bcrypt.compare(password, admin.password)
  if (!isValidPassword) {
    return next(new AppError('Identifiants invalides', 401));
  }

  await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [admin.id])

  const token = generateToken(admin.id, admin.role)

  res.json({
    status: 'success',
    message: 'Connexion administrateur réussie',
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    },
    token
  })
}))

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
