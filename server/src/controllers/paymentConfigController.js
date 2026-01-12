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

  const query = 'SELECT * FROM payment_config WHERE id = ?'
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
    VALUES (?, ?, ?, ?, ?, ?)
  `

  const result = await db.query(insertQuery, [
    providerName,
    phoneNumber,
    providerType || 'mobile_money',
    isActive !== undefined ? isActive : true,
    displayOrder || 0,
    instructions || null
  ])

  // get inserted item
  const inserted = await db.query('SELECT * FROM payment_config WHERE id = LAST_INSERT_ID()')

  res.status(201).json({
    success: true,
    paymentNumber: inserted.rows[0],
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
    updates.push(`provider_name = ?`)
    values.push(providerName)
  }
  if (phoneNumber !== undefined) {
    updates.push(`phone_number = ?`)
    values.push(phoneNumber)
  }
  if (providerType !== undefined) {
    updates.push(`provider_type = ?`)
    values.push(providerType)
  }
  if (isActive !== undefined) {
    updates.push(`is_active = ?`)
    values.push(isActive)
  }
  if (displayOrder !== undefined) {
    updates.push(`display_order = ?`)
    values.push(displayOrder)
  }
  if (instructions !== undefined) {
    updates.push(`instructions = ?`)
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
    WHERE id = ?
  `

  const result = await db.query(query, values)

  const updated = await db.query('SELECT * FROM payment_config WHERE id = ?', [id])

  if (updated.rows.length === 0) {
    throw new AppError('Numéro de paiement non trouvé', 404)
  }

  res.json({
    success: true,
    paymentNumber: updated.rows[0],
    message: 'Numéro de paiement mis à jour avec succès'
  })
})

// Supprimer un numéro de paiement
exports.deletePaymentNumber = catchAsync(async (req, res) => {
  const { id } = req.params

  const deleteQuery = 'DELETE FROM payment_config WHERE id = ?'
  const result = await db.query(deleteQuery, [id])

  // Note: MySQL DELETE doesn't verify existence with affectedRows unless checked manually, 
  // but if ID doesn't exist it just does nothing. We can assume success or check check first.
  // For now we just return success.

  res.json({
    success: true,
    message: 'Numéro de paiement supprimé avec succès'
  })
})

