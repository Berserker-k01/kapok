const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, requireShopOwnership } = require('../middleware/auth');

const upload = require('../middleware/upload');

const router = express.Router();

// Routes publiques (ou semi-publiques)
router.get('/:productId', productController.getProduct);

// Routes protégées
router.use(authenticateToken);

router.get('/shop/:shopId', requireShopOwnership, productController.getProductsByShop);
router.post('/', upload.single('image'), productController.createProduct);

router
  .route('/:productId')
  .put(upload.single('image'), productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
