const express = require('express')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const planConfigController = require('../controllers/planConfigController')

const router = express.Router()

// Public routes
router.get('/', planConfigController.getAllPlans)
router.get('/:planId', planConfigController.getPlan)

// Protected routes (Admin only)
router.use(authenticateToken, requireAdmin)

router.post('/', planConfigController.createPlan)
router.put('/:planId', planConfigController.updatePlan)
router.delete('/:planId', planConfigController.deletePlan)

module.exports = router

