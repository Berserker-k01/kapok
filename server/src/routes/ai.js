const express = require('express');
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protéger toutes les routes IA
router.use(authenticateToken);

router.post('/generate-description', aiController.generateDescription);
router.post('/chat', aiController.chat);

module.exports = router;
