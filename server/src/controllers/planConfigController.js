const db = require('../config/database')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const { v4: uuidv4 } = require('uuid')

// Obtenir tous les plans (admin)
exports.getAllPlans = catchAsync(async (req, res) => {
  const query = 'SELECT * FROM plans_config ORDER BY display_order ASC'
  const result = await db.query(query)

  res.json({
    success: true,
    plans: result.rows
  })
})

// Obtenir un plan spécifique
exports.getPlan = catchAsync(async (req, res) => {
  const { planId } = req.params

  const query = 'SELECT * FROM plans_config WHERE id = ?'
  const result = await db.query(query, [planId])

  if (result.rows.length === 0) {
    throw new AppError('Plan non trouvé', 404)
  }

  res.json({
    success: true,
    plan: result.rows[0]
  })
})

// Créer un nouveau plan
exports.createPlan = catchAsync(async (req, res) => {
  const b = req.body
  const planKey = b.planKey || b.plan_key
  const name = b.name
  const description = b.description
  const price = b.price
  const currency = b.currency
  const durationMonths = b.durationMonths || b.duration_months
  const maxShops = b.maxShops || b.max_shops
  const features = b.features
  const discountPercent = b.discountPercent || b.discount_percent
  const isActive = b.isActive !== undefined ? b.isActive : b.is_active
  const displayOrder = b.displayOrder || b.display_order

  // Vérifier que la clé du plan est unique
  const checkQuery = 'SELECT id FROM plans_config WHERE plan_key = ?'
  const checkResult = await db.query(checkQuery, [planKey])

  if (checkResult.rows.length > 0) {
    throw new AppError('Une clé de plan avec ce nom existe déjà', 400)
  }

  const planId = uuidv4()

  const insertQuery = `
    INSERT INTO plans_config 
    (id, plan_key, name, description, price, currency, duration_months, max_shops, features, discount_percent, is_active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  await db.query(insertQuery, [
    planId,
    planKey,
    name,
    description || null,
    price,
    currency || 'XOF',
    durationMonths || 1,
    maxShops || null,
    JSON.stringify(features || []),
    discountPercent || 0,
    isActive !== undefined ? isActive : true,
    displayOrder || 0
  ])

  // Récupérer le plan créé
  const fetchResult = await db.query('SELECT * FROM plans_config WHERE id = ?', [planId])

  res.status(201).json({
    success: true,
    plan: fetchResult.rows[0],
    message: 'Plan créé avec succès'
  })
})

// Mettre à jour un plan
exports.updatePlan = catchAsync(async (req, res) => {
  const { planId } = req.params
  const b = req.body

  // Construire la requête dynamiquement (accepter camelCase ET snake_case)
  const updates = []
  const values = []

  const name = b.name
  const description = b.description
  const price = b.price
  const currency = b.currency
  const durationMonths = b.durationMonths !== undefined ? b.durationMonths : b.duration_months
  const maxShops = b.maxShops !== undefined ? b.maxShops : b.max_shops
  const features = b.features
  const discountPercent = b.discountPercent !== undefined ? b.discountPercent : b.discount_percent
  const isActive = b.isActive !== undefined ? b.isActive : b.is_active
  const displayOrder = b.displayOrder !== undefined ? b.displayOrder : b.display_order

  if (name !== undefined) {
    updates.push('name = ?')
    values.push(name)
  }
  if (description !== undefined) {
    updates.push('description = ?')
    values.push(description)
  }
  if (price !== undefined) {
    updates.push('price = ?')
    values.push(price)
  }
  if (currency !== undefined) {
    updates.push('currency = ?')
    values.push(currency)
  }
  if (durationMonths !== undefined) {
    updates.push('duration_months = ?')
    values.push(durationMonths)
  }
  if (maxShops !== undefined) {
    updates.push('max_shops = ?')
    values.push(maxShops)
  }
  if (features !== undefined) {
    updates.push('features = ?::jsonb')
    values.push(JSON.stringify(features))
  }
  if (discountPercent !== undefined) {
    updates.push('discount_percent = ?')
    values.push(discountPercent)
  }
  if (isActive !== undefined) {
    updates.push('is_active = ?')
    values.push(isActive)
  }
  if (displayOrder !== undefined) {
    updates.push('display_order = ?')
    values.push(displayOrder)
  }

  if (updates.length === 0) {
    throw new AppError('Aucune donnée à mettre à jour', 400)
  }

  updates.push('updated_at = NOW()')
  values.push(planId)

  const query = `
    UPDATE plans_config 
    SET ${updates.join(', ')}
    WHERE id = ?
  `

  // UPDATE
  await db.query(query, values)

  // 2. FETCH UPDATED PLAN
  const fetchQuery = 'SELECT * FROM plans_config WHERE id = ?'
  const fetchResult = await db.query(fetchQuery, [planId])

  if (fetchResult.rows.length === 0) {
    throw new AppError('Plan non trouvé', 404)
  }

  res.json({
    success: true,
    plan: fetchResult.rows[0],
    message: 'Plan mis à jour avec succès'
  })
})

// Supprimer un plan
exports.deletePlan = catchAsync(async (req, res) => {
  const { planId } = req.params

  // Vérifier s'il y a des paiements ou abonnements actifs avec ce plan
  const checkQuery = `
    SELECT COUNT(*)::integer as count FROM subscription_payments 
    WHERE plan_key = (SELECT plan_key FROM plans_config WHERE id = ?)
  `
  const checkResult = await db.query(checkQuery, [planId])

  if (parseInt(checkResult.rows[0].count) > 0) {
    throw new AppError('Impossible de supprimer ce plan car il est utilisé', 400)
  }

  const deleteQuery = 'DELETE FROM plans_config WHERE id = ?'
  const result = await db.query(deleteQuery, [planId])

  if (result.rowCount === 0) {
    throw new AppError('Plan non trouvé', 404)
  }

  res.json({
    success: true,
    message: 'Plan supprimé avec succès'
  })
})

