const db = require('../config/database')
const { AppError } = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')

// Obtenir tous les numéros de paiement (admin)
exports.getAllPaymentNumbers = catchAsync(async (req, res) => {
  const query = 'SELECT * FROM payment_config ORDER BY display_order ASC'
  const result = await db.query(query)
  
  res.json({
    success: true,
    paymentNumbers: result.rows
  })
})

// Obtenir un numéro de paiement spécifique
exports.getPaymentNumber = catchAsync(async (req, res) => {
  const { id } = req.params
  
  const query = 'SELECT * FROM payment_config WHERE id = $1'
  const result = await db.query(query, [id])
  
  if (result.rows.length === 0) {
    throw new AppError('Numéro de paiement non trouvé', 404)
  }
  
  res.json({
    success: true,
    paymentNumber: result.rows[0]
  })
})

// Créer un nouveau numéro de paiement
exports.createPaymentNumber = catchAsync(async (req, res) => {
  const {
    providerName,
    phoneNumber,
    providerType,
    isActive,
    displayOrder,
    instructions
  } = req.body

  const insertQuery = `
    INSERT INTO payment_config 
    (provider_name, phone_number, provider_type, is_active, display_order, instructions)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
  
  const result = await db.query(insertQuery, [
    providerName,
    phoneNumber,
    providerType || 'mobile_money',
    isActive !== undefined ? isActive : true,
    displayOrder || 0,
    instructions || null
  ])

  res.status(201).json({
    success: true,
    paymentNumber: result.rows[0],
    message: 'Numéro de paiement créé avec succès'
  })
})

// Mettre à jour un numéro de paiement
exports.updatePaymentNumber = catchAsync(async (req, res) => {
  const { id } = req.params
  const {
    providerName,
    phoneNumber,
    providerType,
    isActive,
    displayOrder,
    instructions
  } = req.body

  const updates = []
  const values = []
  let paramCount = 1

  if (providerName !== undefined) {
    updates.push(`provider_name = $${paramCount++}`)
    values.push(providerName)
  }
  if (phoneNumber !== undefined) {
    updates.push(`phone_number = $${paramCount++}`)
    values.push(phoneNumber)
  }
  if (providerType !== undefined) {
    updates.push(`provider_type = $${paramCount++}`)
    values.push(providerType)
  }
  if (isActive !== undefined) {
    updates.push(`is_active = $${paramCount++}`)
    values.push(isActive)
  }
  if (displayOrder !== undefined) {
    updates.push(`display_order = $${paramCount++}`)
    values.push(displayOrder)
  }
  if (instructions !== undefined) {
    updates.push(`instructions = $${paramCount++}`)
    values.push(instructions)
  }

  if (updates.length === 0) {
    throw new AppError('Aucune donnée à mettre à jour', 400)
  }

  updates.push(`updated_at = NOW()`)
  values.push(id)

  const query = `
    UPDATE payment_config 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `
  
  const result = await db.query(query, values)

  if (result.rows.length === 0) {
    throw new AppError('Numéro de paiement non trouvé', 404)
  }

  res.json({
    success: true,
    paymentNumber: result.rows[0],
    message: 'Numéro de paiement mis à jour avec succès'
  })
})

// Supprimer un numéro de paiement
exports.deletePaymentNumber = catchAsync(async (req, res) => {
  const { id } = req.params

  const deleteQuery = 'DELETE FROM payment_config WHERE id = $1 RETURNING *'
  const result = await db.query(deleteQuery, [id])

  if (result.rows.length === 0) {
    throw new AppError('Numéro de paiement non trouvé', 404)
  }

  res.json({
    success: true,
    message: 'Numéro de paiement supprimé avec succès'
  })
})

