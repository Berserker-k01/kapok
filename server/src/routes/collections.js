const express = require('express');
const collectionController = require('../controllers/collectionController');
const auth = require('../middleware/auth');
const router = express.Router({ mergeParams: true });

// Routes that might be nested under /shops/:shopId/collections
// or stand-alone /collections with permissions checks

// Public routes (if any needed for storefront, usually fetched via shop)
// For now, we assume admin panel usage mainly, protected by auth

router.use(auth.authenticateToken);

router
    .route('/')
    .get(collectionController.getShopCollections)
    .post(collectionController.createCollection);

router
    .route('/:id')
    .get(collectionController.getCollection)
    .put(collectionController.updateCollection)
    .delete(collectionController.deleteCollection);

router
    .route('/:id/products')
    .post(collectionController.addProduct);

router
    .route('/:id/products/:productId')
    .delete(collectionController.removeProduct);

module.exports = router;
