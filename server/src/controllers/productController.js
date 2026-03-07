const productService = require('../services/productService');
const collectionService = require('../services/collectionService');
const catchAsync = require('../utils/catchAsync');

exports.getPublicProductsByShop = catchAsync(async (req, res, next) => {
    // Force filters for public view
    const filters = { ...req.query, status: 'active' };
    const result = await productService.getProductsByShop(req.params.shopId, filters);

    res.status(200).json({
        status: 'success',
        results: result.products.length,
        data: { products: result.products, pagination: result.pagination }
    });
});

exports.getProductsByShop = catchAsync(async (req, res, next) => {
    const result = await productService.getProductsByShop(req.params.shopId, req.query);

    res.status(200).json(result);
});

exports.createProduct = catchAsync(async (req, res, next) => {
    console.log('[Product] Creating product...');
    console.log('[Product] User ID:', req.user.id);
    console.log('[Product] Has file:', !!req.file);

    // Gestion des images uploadées (STOCKAGE LOCAL)
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(f => `/api/uploads/${f.filename}`);
        req.body.image_url = req.body.images[0]; // fallback pour compatibilité
        console.log('[Product] ✅ Images generated (Local):', req.body.images);
    } else {
        console.log('[Product] ⚠️  No images uploaded');
    }

    const product = await productService.createProduct(req.user.id, req.body);
    console.log('[Product] ✅ Product created with ID:', product.id);

    // [MODIFICATION] Ajout optionnel à une collection
    if (req.body.collectionId) {
        try {
            await collectionService.addProductToCollection(req.body.collectionId, product.id);
            console.log('[Product] ✅ Added to collection:', req.body.collectionId);
        } catch (error) {
            console.error('[Product] ❌ Error adding to collection:', error);
            // On ne bloque pas la création du produit si l'ajout à la collection échoue
        }
    }

    res.status(201).json({
        status: 'success',
        message: 'Produit créé avec succès',
        data: { product }
    });
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await productService.getProductById(req.params.productId);

    res.status(200).json({
        status: 'success',
        data: { product }
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    // Gestion des images existantes (issues du front-end)
    let images = [];
    if (req.body.existingImages) {
        images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
    }

    // Ajout des nouvelles images uploadées
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => `/api/uploads/${f.filename}`);
        images = [...images, ...newImages];
        console.log('[Product] ✅ Nouvelles images uploadées:', newImages);
    }

    // Mise à jour de req.body avec la liste fusionnée
    if (images.length > 0) {
        req.body.images = images;
        req.body.image_url = images[0];
    } else {
        req.body.images = [];
        req.body.image_url = null;
    }

    const product = await productService.updateProduct(req.user.id, req.params.productId, req.body);

    if (req.body.collectionId !== undefined) {
        try {
            // First remove from all existing collections for this product (simple 1-to-many behavior simulation for UI sake)
            const db = require('../config/database');
            await db.query('DELETE FROM collection_products WHERE product_id = ?', [req.params.productId]);

            if (req.body.collectionId) {
                await collectionService.addProductToCollection(req.body.collectionId, product.id);
            }
        } catch (error) {
            console.error('[Product] ❌ Error updating collection:', error);
        }
    }

    res.status(200).json({
        status: 'success',
        message: 'Produit mis à jour avec succès',
        data: { product }
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    await productService.deleteProduct(req.user.id, req.params.productId);

    res.status(204).json({
        status: 'success',
        data: null
    });
});
