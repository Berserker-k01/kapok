const shopService = require('../services/shopService');
const catchAsync = require('../utils/catchAsync');

exports.getAllShops = catchAsync(async (req, res, next) => {
    const shops = await shopService.getAllShops(req.user.id);

    res.status(200).json({
        status: 'success',
        results: shops.length,
        data: { shops }
    });
});

exports.getShopBySlug = catchAsync(async (req, res, next) => {
    const shop = await shopService.getShopBySlug(req.params.slug);
    if (!shop) {
        return res.status(404).json({ status: 'fail', message: 'Boutique non trouvée' });
    }
    res.status(200).json({
        status: 'success',
        data: { shop }
    });
});

exports.createShop = catchAsync(async (req, res, next) => {
    const shop = await shopService.createShop(req.user.id, req.body);

    res.status(201).json({
        status: 'success',
        message: 'Boutique créée avec succès',
        data: { shop }
    });
});

exports.getShop = catchAsync(async (req, res, next) => {
    const shop = await shopService.getShopById(req.params.shopId);

    res.status(200).json({
        status: 'success',
        data: { shop }
    });
});

exports.updateShop = catchAsync(async (req, res, next) => {
    const shop = await shopService.updateShop(req.params.shopId, req.body);

    res.status(200).json({
        status: 'success',
        message: 'Boutique mise à jour avec succès',
        data: { shop }
    });
});

exports.deleteShop = catchAsync(async (req, res, next) => {
    await shopService.deleteShop(req.params.shopId);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getShopStats = catchAsync(async (req, res, next) => {
    const stats = await shopService.getShopStats(req.params.shopId);

    res.status(200).json({
        status: 'success',
        data: stats
    });
});
