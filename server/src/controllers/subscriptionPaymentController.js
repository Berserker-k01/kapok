const db = require('../config/database')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const { AppError } = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')

// Configuration Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/payment-proofs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `proof-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new AppError('Seules les images sont autorisées (JPEG, PNG, GIF, WEBP)', 400))
    }
  }
})

// Obtenir tous les plans disponibles
exports.getPlans = catchAsync(async (req, res) => {
  const query = `
    SELECT * FROM plans_config 
    WHERE is_active = TRUE 
    ORDER BY display_order ASC
  `
  const result = await db.query(query)

  res.json({
    success: true,
    plans: result.rows
  })
})

// Obtenir les numéros de téléphone pour paiement
exports.getPaymentNumbers = catchAsync(async (req, res) => {
  const query = `
    SELECT * FROM payment_config 
    WHERE is_active = TRUE 
    ORDER BY display_order ASC
  `
  const result = await db.query(query)

  res.json({
    success: true,
    paymentNumbers: result.rows
  })
})

// Créer une demande de paiement d'abonnement
exports.createPaymentRequest = catchAsync(async (req, res) => {
  const { planKey, paymentProvider, paymentPhone } = req.body
  const userId = req.user.id

  // Vérifier que le plan existe
  const planQuery = 'SELECT * FROM plans_config WHERE plan_key = ? AND is_active = TRUE'
  const planResult = await db.query(planQuery, [planKey])

  if (planResult.rows.length === 0) {
    throw new AppError('Plan non trouvé ou inactif', 404)
  }

  const plan = planResult.rows[0]

  // Calculer le montant avec réduction
  let finalAmount = parseFloat(plan.price)
  if (plan.discount_percent > 0) {
    finalAmount = finalAmount * (1 - plan.discount_percent / 100)
  }

  // Vérifier s'il y a déjà un paiement en attente pour cet utilisateur
  const pendingQuery = `
    SELECT id FROM subscription_payments 
    WHERE user_id = ? AND status = 'pending'
  `
  const pendingResult = await db.query(pendingQuery, [userId])

  if (pendingResult.rows.length > 0) {
    throw new AppError('Vous avez déjà un paiement en attente de validation', 400)
  }

  // Créer la demande de paiement
  const paymentId = uuidv4(); // Generate UUID manually for MySQL INSERT
  const insertQuery = `
    INSERT INTO subscription_payments 
    (id, user_id, plan_key, plan_name, amount, currency, payment_provider, payment_phone, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
  `

  await db.query(insertQuery, [
    paymentId,
    userId,
    planKey,
    plan.name,
    finalAmount,
    plan.currency,
    paymentProvider,
    paymentPhone
  ])

  // Fetch created payment
  const fetchQuery = 'SELECT * FROM subscription_payments WHERE id = ?';
  const insertResult = await db.query(fetchQuery, [paymentId]);

  res.status(201).json({
    success: true,
    payment: insertResult.rows[0],
    message: 'Demande de paiement créée avec succès'
  })
})

// Upload de la preuve de paiement
exports.uploadPaymentProof = catchAsync(async (req, res) => {
  const { paymentId } = req.params
  const userId = req.user.id

  if (!req.file) {
    throw new AppError('Aucune image fournie', 400)
  }

  // Vérifier que le paiement appartient à l'utilisateur
  const paymentQuery = 'SELECT * FROM subscription_payments WHERE id = ? AND user_id = ?'
  const paymentResult = await db.query(paymentQuery, [paymentId, userId])

  if (paymentResult.rows.length === 0) {
    // Supprimer le fichier uploadé si le paiement n'existe pas
    fs.unlinkSync(req.file.path)
    throw new AppError('Paiement non trouvé', 404)
  }

  const payment = paymentResult.rows[0]

  if (payment.status !== 'pending') {
    fs.unlinkSync(req.file.path)
    throw new AppError('Ce paiement ne peut plus être modifié', 400)
  }

  // Construire l'URL de l'image (à adapter selon votre configuration)
  const imageUrl = `/uploads/payment-proofs/${req.file.filename}`

  // Mettre à jour le paiement avec l'URL de la preuve
  const updateQuery = `
    UPDATE subscription_payments 
    SET proof_image_url = ?, updated_at = NOW()
    WHERE id = ?
  `

  await db.query(updateQuery, [imageUrl, paymentId])

  const fetchQuery = 'SELECT * FROM subscription_payments WHERE id = ?'
  const updateResult = await db.query(fetchQuery, [paymentId])

  res.json({
    success: true,
    payment: updateResult.rows[0],
    message: 'Preuve de paiement téléversée avec succès'
  })
})

// Obtenir les paiements de l'utilisateur
exports.getUserPayments = catchAsync(async (req, res) => {
  const userId = req.user.id

  const query = `
    SELECT * FROM subscription_payments 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `

  const result = await db.query(query, [userId])

  res.json({
    success: true,
    payments: result.rows
  })
})

// Obtenir un paiement spécifique
exports.getPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params
  const userId = req.user.id

  const query = `
    SELECT sp.*, u.name as user_name, u.email as user_email
    FROM subscription_payments sp
    JOIN users u ON sp.user_id = u.id
    WHERE sp.id = ? AND (sp.user_id = ? OR ? = 'admin' OR ? = 'super_admin')
  `

  const result = await db.query(query, [paymentId, userId, req.user.role, req.user.role])

  if (result.rows.length === 0) {
    throw new AppError('Paiement non trouvé', 404)
  }

  res.json({
    success: true,
    payment: result.rows[0]
  })
})

// ADMIN: Obtenir tous les paiements en attente
exports.getPendingPayments = catchAsync(async (req, res) => {
  const query = `
    SELECT 
      sp.*,
      u.name as user_name,
      u.email as user_email,
      u.phone as user_phone
    FROM subscription_payments sp
    JOIN users u ON sp.user_id = u.id
    WHERE sp.status = 'pending'
    ORDER BY sp.created_at DESC
  `

  const result = await db.query(query)

  res.json({
    success: true,
    payments: result.rows
  })
})

// ADMIN: Approuver un paiement
exports.approvePayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params
  const { adminNotes } = req.body
  const adminId = req.user.id

  // Récupérer le paiement
  const paymentQuery = 'SELECT * FROM subscription_payments WHERE id = ?'
  const paymentResult = await db.query(paymentQuery, [paymentId])

  if (paymentResult.rows.length === 0) {
    throw new AppError('Paiement non trouvé', 404)
  }

  const payment = paymentResult.rows[0]

  if (payment.status !== 'pending') {
    throw new AppError('Ce paiement a déjà été traité', 400)
  }

  // Fetch plan details to get duration
  const planConfigQuery = 'SELECT duration_months FROM plans_config WHERE plan_key = ?';
  const planConfigResult = await db.query(planConfigQuery, [payment.plan_key]);
  const durationMonths = planConfigResult.rows.length > 0 ? planConfigResult.rows[0].duration_months : 1;

  // Démarrer une transaction
  await db.query('BEGIN')

  try {
    // Mettre à jour le statut du paiement
    const updatePaymentQuery = `
      UPDATE subscription_payments 
      SET status = 'approved',
          admin_notes = ?,
          reviewed_by = ?,
          reviewed_at = NOW(),
          updated_at = NOW()
      WHERE id = ?
    `
    await db.query(updatePaymentQuery, [adminNotes || null, adminId, paymentId])

    // Mettre à jour le plan de l'utilisateur
    const updateUserQuery = `
      UPDATE users 
      SET plan = ?, updated_at = NOW()
    `
    await db.query(updateUserQuery, [payment.plan_key, payment.user_id])

    // Déterminer la durée de l'abonnement
    const intervalValue = durationMonths;

    // Créer ou mettre à jour l'abonnement
    const subscriptionQuery = `
      INSERT INTO subscriptions 
      (id, user_id, plan_name, status, price, currency, current_period_start, current_period_end)
      VALUES (UUID(), ?, ?, 'active', ?, ?, NOW(), NOW() + INTERVAL ? MONTH)
      ON DUPLICATE KEY UPDATE status = 'active', current_period_end = NOW() + INTERVAL ? MONTH, price = VALUES(price), plan_name = VALUES(plan_name)
    `
    await db.query(subscriptionQuery, [
      payment.user_id,
      payment.plan_name,
      payment.amount,
      payment.currency,
      intervalValue,
      intervalValue
    ])

    await db.query('COMMIT')

    res.json({
      success: true,
      message: 'Paiement approuvé et plan activé avec succès'
    })
  } catch (error) {
    await db.query('ROLLBACK')
    throw error
  }
})

// ADMIN: Rejeter un paiement
exports.rejectPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params
  const { adminNotes } = req.body
  const adminId = req.user.id

  const query = `
    UPDATE subscription_payments 
    SET status = 'rejected',
        admin_notes = ?,
        reviewed_by = ?,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = ? AND status = 'pending'
  `

  await db.query(query, [adminNotes || null, adminId, paymentId])

  const fetchQuery = 'SELECT * FROM subscription_payments WHERE id = ?'
  const result = await db.query(fetchQuery, [paymentId])

  if (result.rows.length === 0) {
    throw new AppError('Paiement non trouvé ou déjà traité', 404)
  }

  res.json({
    success: true,
    message: 'Paiement rejeté',
    payment: result.rows[0]
  })
})

// Exporter multer pour l'utilisation dans les routes
exports.upload = upload.single('proofImage')

