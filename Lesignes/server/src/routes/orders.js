const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const { authenticateToken } = require('../middleware/auth')

// Routes publiques
router.get('/:orderId/public', orderController.getOrderPublic)
router.post('/public', orderController.createPublicOrder)
router.post('/:orderId/validate', orderController.validateOrder)

// Routes protégées
router.use(authenticateToken)

router.get('/shop/:shopId', orderController.getOrdersByShop)
router.put('/:orderId/status', orderController.updateOrderStatus)

module.exports = router
