const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, requireShopOwnership } = require('../middleware/auth');

// Utiliser le middleware Cloudinary au lieu du stockage local
const { cloudinaryMiddleware } = require('../middleware/uploadCloudinary');

const router = express.Router();

// Routes publiques (ou semi-publiques)
router.get('/public/shop/:shopId', productController.getPublicProductsByShop);
router.get('/:productId', productController.getProduct);

// Routes protégées
router.use(authenticateToken);

router.get('/shop/:shopId', requireShopOwnership, productController.getProductsByShop);
router.post('/', ...cloudinaryMiddleware('image'), productController.createProduct);

router
  .route('/:productId')
  .put(...cloudinaryMiddleware('image'), productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
