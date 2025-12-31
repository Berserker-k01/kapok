const express = require('express')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const paymentConfigController = require('../controllers/paymentConfigController')

const router = express.Router()

// Toutes les routes nécessitent l'authentification admin
router.use(authenticateToken, requireAdmin)

router.get('/', paymentConfigController.getAllPaymentNumbers)
router.get('/:id', paymentConfigController.getPaymentNumber)
router.post('/', paymentConfigController.createPaymentNumber)
router.put('/:id', paymentConfigController.updatePaymentNumber)
router.delete('/:id', paymentConfigController.deletePaymentNumber)

module.exports = router

