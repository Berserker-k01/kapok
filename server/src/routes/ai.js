const express = require('express');
const aiController = require('../controllers/aiController');
const { authenticateToken, requireAIAccess } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes IA nécessitent : être authentifié + avoir un plan Premium/Gold
router.use(authenticateToken);
router.use(requireAIAccess);

router.post('/generate-description', aiController.generateDescription);
router.post('/chat', aiController.chat);

module.exports = router;
