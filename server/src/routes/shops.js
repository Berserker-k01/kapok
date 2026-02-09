const express = require('express');
const shopController = require('../controllers/shopController');
const { authenticateToken, requireShopOwnership } = require('../middleware/auth');

// Utiliser le middleware Cloudinary au lieu du stockage local
const { cloudinaryMultipleMiddleware } = require('../middleware/uploadCloudinary');

const router = express.Router();

// Route publique pour le storefront
router.get('/public/:slug', shopController.getShopBySlug);

// Routes protégées par authentification
router.use(authenticateToken);

router
  .route('/')
  .get(shopController.getAllShops)
  .post(shopController.createShop);

// Routes nécessitant d'être propriétaire de la boutique
router
  .route('/:shopId')
  .get(requireShopOwnership, shopController.getShop)
  .put(
    requireShopOwnership,
    ...cloudinaryMultipleMiddleware([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 }
    ]),
    shopController.updateShop
  )
  .delete(requireShopOwnership, shopController.deleteShop);

router.get('/:shopId/stats', requireShopOwnership, shopController.getShopStats);

module.exports = router;
