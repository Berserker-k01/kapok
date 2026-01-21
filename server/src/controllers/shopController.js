const shopService = require('../services/shopService');
const catchAsync = require('../utils/catchAsync');

exports.getAllShops = catchAsync(async (req, res, next) => {
    // DEBUG: Log user ID to verify coherence
    console.log(`[ShopController] Getting shops for UserID: ${req.user.id}`);
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
    // Helper function to clean undefined values
    const cleanData = (obj) => {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object' || obj instanceof Date) return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => cleanData(item));
        }

        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined || value === '') {
                cleaned[key] = null;
            } else if (typeof value === 'object' && value !== null) {
                cleaned[key] = cleanData(value);
            } else {
                cleaned[key] = value;
            }
        }
        return cleaned;
    };

    // 1. Handle File Uploads (Banner/Logo)
    let updateData = { ...req.body };
    const baseUrl = process.env.API_URL || 'https://e-assime.com/api';

    // If FormData was sent, 'settings' might be a JSON string. Parse it first.
    if (typeof updateData.settings === 'string') {
        try {
            updateData.settings = JSON.parse(updateData.settings);
        } catch (e) {
            updateData.settings = {};
        }
    }

    // Ensure structure exists
    if (!updateData.settings) updateData.settings = {};
    if (!updateData.settings.themeConfig) updateData.settings.themeConfig = {};
    if (!updateData.settings.themeConfig.content) updateData.settings.themeConfig.content = {};

    if (req.files) {
        if (req.files['logo']) {
            updateData.settings.themeConfig.content.logoUrl = `${baseUrl}/uploads/${req.files['logo'][0].filename}`;
        }
        if (req.files['banner']) {
            updateData.settings.themeConfig.content.bannerUrl = `${baseUrl}/uploads/${req.files['banner'][0].filename}`;
        }
    }

    // Clean all data to convert undefined to null
    updateData = cleanData(updateData);

    const shop = await shopService.updateShop(req.params.shopId, updateData);

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
