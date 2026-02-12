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

    // Gestion de l'image uploadée (STOCKAGE LOCAL)
    if (req.file) {
        // URL RELATIVE pour compatibilité reverse proxy (Nginx/Hostinger)
        req.body.image_url = `/api/uploads/${req.file.filename}`;

        console.log('[Product] ✅ Image generated (Local):');
        console.log('[Product]    URL:', req.body.image_url);
        console.log('[Product]    Filename:', req.file.filename);
    } else {
        console.log('[Product] ⚠️  No image uploaded');
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
    // Gestion de l'image uploadée (STOCKAGE LOCAL)
    if (req.file) {
        // URL RELATIVE pour compatibilité reverse proxy (Nginx/Hostinger)
        req.body.image_url = `/api/uploads/${req.file.filename}`;

        console.log('[Product] ✅ Image updated (Local):', req.body.image_url);
    }

    const product = await productService.updateProduct(req.user.id, req.params.productId, req.body);

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
