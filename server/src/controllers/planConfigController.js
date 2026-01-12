const db = require('../config/database')
const { AppError } = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')

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
  const {
    planKey,
    name,
    description,
    price,
    currency,
    maxShops,
    features,
    discountPercent,
    isActive,
    displayOrder
  } = req.body

  // Vérifier que la clé du plan est unique
  const checkQuery = 'SELECT id FROM plans_config WHERE plan_key = ?'
  const checkResult = await db.query(checkQuery, [planKey])

  if (checkResult.rows.length > 0) {
    throw new AppError('Une clé de plan avec ce nom existe déjà', 400)
  }

  const insertQuery = `
    INSERT INTO plans_config 
    (id, plan_key, name, description, price, currency, max_shops, features, discount_percent, is_active, display_order)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const result = await db.query(insertQuery, [
    planKey,
    name,
    description || null,
    price,
    currency || 'XOF',
    maxShops || null,
    JSON.stringify(features || []),
    discountPercent || 0,
    isActive !== undefined ? isActive : true,
    displayOrder || 0
  ])

  res.status(201).json({
    success: true,
    plan: result.rows[0],
    message: 'Plan créé avec succès'
  })
})

// Mettre à jour un plan
exports.updatePlan = catchAsync(async (req, res) => {
  const { planId } = req.params
  const {
    name,
    description,
    price,
    currency,
    maxShops,
    features,
    discountPercent,
    isActive,
    displayOrder
  } = req.body

  // Construire la requête dynamiquement
  const updates = []
  const values = []

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
  if (maxShops !== undefined) {
    updates.push('max_shops = ?')
    values.push(maxShops)
  }
  if (features !== undefined) {
    updates.push('features = ?')
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

  const result = await db.query(query, values)

  if (result.rows.length === 0) {
    throw new AppError('Plan non trouvé', 404)
  }

  res.json({
    success: true,
    plan: result.rows[0],
    message: 'Plan mis à jour avec succès'
  })
})

// Supprimer un plan
exports.deletePlan = catchAsync(async (req, res) => {
  const { planId } = req.params

  // Vérifier s'il y a des paiements ou abonnements actifs avec ce plan
  const checkQuery = `
    SELECT COUNT(*) as count FROM subscription_payments 
    WHERE plan_key = (SELECT plan_key FROM plans_config WHERE id = ?)
  `
  const checkResult = await db.query(checkQuery, [planId])

  if (parseInt(checkResult.rows[0].count) > 0) {
    throw new AppError('Impossible de supprimer ce plan car il est utilisé', 400)
  }

  const deleteQuery = 'DELETE FROM plans_config WHERE id = ?'
  const result = await db.query(deleteQuery, [planId])

  if (result.rows.length === 0) {
    throw new AppError('Plan non trouvé', 404)
  }

  res.json({
    success: true,
    message: 'Plan supprimé avec succès'
  })
})

