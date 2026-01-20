const collectionService = require('../services/collectionService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getShopCollections = catchAsync(async (req, res, next) => {
    const shopId = req.params.shopId || req.query.shopId;
    if (!shopId) return next(new AppError('Shop ID is required', 400));

    const collections = await collectionService.getCollectionsByShop(shopId);

    res.status(200).json({
        status: 'success',
        results: collections.length,
        data: { collections }
    });
});

exports.createCollection = catchAsync(async (req, res, next) => {
    // Requires shopId in body or params, mostly params if routed through shop
    // Assuming route: POST /shops/:shopId/collections OR POST /collections (with shopId in body)

    const shopId = req.body.shopId || req.params.shopId;
    if (!shopId) return next(new AppError('Shop ID is required', 400));

    const collection = await collectionService.createCollection(shopId, req.body);

    res.status(201).json({
        status: 'success',
        data: { collection }
    });
});

exports.getCollection = catchAsync(async (req, res, next) => {
    const collection = await collectionService.getCollectionById(req.params.id);
    if (!collection) return next(new AppError('Collection not found', 404));

    const products = await collectionService.getCollectionProducts(req.params.id);

    res.status(200).json({
        status: 'success',
        data: { collection, products }
    });
});

exports.updateCollection = catchAsync(async (req, res, next) => {
    const collection = await collectionService.updateCollection(req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        data: { collection }
    });
});

exports.deleteCollection = catchAsync(async (req, res, next) => {
    await collectionService.deleteCollection(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.addProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    if (!productId) return next(new AppError('Product ID is required', 400));

    await collectionService.addProductToCollection(req.params.id, productId);

    res.status(200).json({
        status: 'success',
        message: 'Product added to collection'
    });
});

exports.removeProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    await collectionService.removeProductFromCollection(req.params.id, productId);

    res.status(204).json({
        status: 'success',
        data: null
    });
});
