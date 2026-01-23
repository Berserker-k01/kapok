const express = require('express')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const subscriptionPaymentController = require('../controllers/subscriptionPaymentController')

const router = express.Router()

// Routes publiques (pour obtenir les plans et numéros de paiement)
router.get('/plans', subscriptionPaymentController.getPlans)
router.get('/payment-numbers', subscriptionPaymentController.getPaymentNumbers)

// Routes utilisateur authentifié
router.post('/request', authenticateToken, subscriptionPaymentController.createPaymentRequest)
router.post('/:paymentId/upload-proof', authenticateToken, subscriptionPaymentController.upload, subscriptionPaymentController.uploadPaymentProof)
router.get('/my-payments', authenticateToken, subscriptionPaymentController.getUserPayments)
router.get('/active', authenticateToken, subscriptionPaymentController.getActiveSubscription)
router.get('/:paymentId', authenticateToken, subscriptionPaymentController.getPayment)

// Routes admin
router.get('/admin/pending', authenticateToken, requireAdmin, subscriptionPaymentController.getPendingPayments)
router.post('/admin/:paymentId/approve', authenticateToken, requireAdmin, subscriptionPaymentController.approvePayment)
router.post('/admin/:paymentId/reject', authenticateToken, requireAdmin, subscriptionPaymentController.rejectPayment)

module.exports = router

