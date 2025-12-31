const express = require('express')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const planConfigController = require('../controllers/planConfigController')

const router = express.Router()

// Toutes les routes nécessitent l'authentification admin
router.use(authenticateToken, requireAdmin)

router.get('/', planConfigController.getAllPlans)
router.get('/:planId', planConfigController.getPlan)
router.post('/', planConfigController.createPlan)
router.put('/:planId', planConfigController.updatePlan)
router.delete('/:planId', planConfigController.deletePlan)

module.exports = router

