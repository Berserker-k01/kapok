
const shopService = require('../services/shopService');
const catchAsync = require('../utils/catchAsync');

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(target, source) {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

exports.getAllShops = catchAsync(async (req, res, next) => {
    // DEBUG: Log user ID to verify coherence
    console.log(`[ShopController] Getting shops for UserID: ${req.user.id}`);

    // Parallel fetch for perf
    const [shops, limitData] = await Promise.all([
        shopService.getAllShops(req.user.id),
        shopService.getUserShopLimit(req.user.id)
    ]);

    res.status(200).json({
        status: 'success',
        results: shops.length,
        data: {
            shops,
            limits: limitData
        }
    });
});

exports.getShopBySlug = catchAsync(async (req, res, next) => {
    const shop = await shopService.getShopBySlug(req.params.slug);

    if (!shop) {
        return res.status(404).json({ status: 'fail', message: 'Boutique non trouvée' });
    }

    // Vérifier si la boutique est active
    if (shop.status !== 'active') {
        return res.status(503).json({
            status: 'fail',
            message: 'Cette boutique est actuellement indisponible ou en maintenance.'
        });
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

    // Ensure settings is valid JSON object
    if (shop.settings && typeof shop.settings === 'string') {
        try {
            shop.settings = JSON.parse(shop.settings);
        } catch (e) {
            console.error('[ShopController] Failed to parse settings on GET:', e);
            shop.settings = {};
        }
    }

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

    // 1. Gérer les données de la requête
    let updateData = { ...req.body };

    console.log('[ShopController] Received update for:', req.params.shopId);

    // Récupérer la boutique actuelle pour ne rien perdre
    let currentShop;
    try {
        currentShop = await shopService.getShopById(req.params.shopId);
    } catch (error) {
        return res.status(404).json({ status: 'fail', message: 'Boutique introuvable avant mise à jour' });
    }

    let currentSettings = currentShop.settings || {};
    // Si c'est une string JSON en base, on parse
    if (typeof currentSettings === 'string') {
        try { currentSettings = JSON.parse(currentSettings); } catch (e) { currentSettings = {}; }
    }

    // Préparer les nouveaux settings
    let newSettings = {};
    if (updateData.settings) {
        if (typeof updateData.settings === 'string') {
            try {
                newSettings = JSON.parse(updateData.settings);
            } catch (e) {
                console.error('[ShopController] Failed to parse settings JSON:', e.message);
                return res.status(400).json({
                    status: 'fail',
                    message: 'Format des paramètres (settings) invalide.',
                    error: e.message
                });
            }
        } else {
            newSettings = updateData.settings;
        }
    }

    // FUSION INTELLIGENTE (Deep Merge)
    // On part de l'existant et on applique les changements
    updateData.settings = deepMerge(currentSettings, newSettings);

    // S'assurer que la structure minimale existe pour les images
    if (!updateData.settings.themeConfig) updateData.settings.themeConfig = {};
    if (!updateData.settings.themeConfig.content) updateData.settings.themeConfig.content = {};

    // Utiliser les fichiers locaux
    if (req.files) {
        // URL DYNAMIQUE (Marche en Local ET en Prod)
        const protocol = req.protocol;
        const host = req.get('host');
        const cleanBaseUrl = `${protocol}://${host}/api`;

        if (req.files['logo'] && req.files['logo'][0]) {
            const logoUrl = `${cleanBaseUrl}/uploads/${req.files['logo'][0].filename}`;
            updateData.settings.themeConfig.content.logoUrl = logoUrl;
            console.log('[Shop] ✅ Logo updated (Local/Merged):', logoUrl);
        }
        if (req.files['banner'] && req.files['banner'][0]) {
            const bannerUrl = `${cleanBaseUrl}/uploads/${req.files['banner'][0].filename}`;
            updateData.settings.themeConfig.content.bannerUrl = bannerUrl;
            console.log('[Shop] ✅ Banner updated (Local/Merged):', bannerUrl);
        }
    }

    // Clean data (simple cleanup for top-level fields)
    const keysToClean = ['name', 'description', 'category', 'theme', 'status'];
    keysToClean.forEach(key => {
        if (updateData[key] === '' || updateData[key] === 'null' || updateData[key] === 'undefined') {
            updateData[key] = null;
        }
    });

    // On passe updateData avec le settings fusionné au service
    // Le service fera COALESCE(?, settings), mais comme on passe un objet complet fusionné, c'est bon.

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
