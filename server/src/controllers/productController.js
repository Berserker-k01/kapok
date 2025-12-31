const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync');

exports.getProductsByShop = catchAsync(async (req, res, next) => {
    const result = await productService.getProductsByShop(req.params.shopId, req.query);

    res.status(200).json(result);
});

exports.createProduct = catchAsync(async (req, res, next) => {
    const product = await productService.createProduct(req.user.id, req.body);

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
