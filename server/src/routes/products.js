const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, requireShopOwnership } = require('../middleware/auth');

// Utiliser le middleware storage local
const upload = require('../middleware/upload');

const router = express.Router();

// Routes publiques (ou semi-publiques)
router.get('/public/shop/:shopId', productController.getPublicProductsByShop);
router.get('/:productId', productController.getProduct);

// Routes protégées
router.use(authenticateToken);

router.get('/shop/:shopId', requireShopOwnership, productController.getProductsByShop);

// Support up to 5 multiple images
router.post('/', upload.array('images', 5), productController.createProduct);

router
  .route('/:productId')
  .put(upload.array('images', 5), productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
