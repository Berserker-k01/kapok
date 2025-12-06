const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, requireShopOwnership } = require('../middleware/auth');

const router = express.Router();

// Routes publiques (ou semi-publiques)
router.get('/:productId', productController.getProduct);

// Routes protégées
router.use(authenticateToken);

router.get('/shop/:shopId', requireShopOwnership, productController.getProductsByShop);
router.post('/', productController.createProduct);

router
  .route('/:productId')
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
