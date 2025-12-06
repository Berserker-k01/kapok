const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protéger toutes les routes IA
router.use(protect);

router.post('/generate-description', aiController.generateDescription);

module.exports = router;
