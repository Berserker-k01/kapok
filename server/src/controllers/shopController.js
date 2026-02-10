const shopService = require('../services/shopService');
const catchAsync = require('../utils/catchAsync');

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

    // 1. Gérer les données de la requête
    let updateData = { ...req.body };

    console.log('[ShopController] Received update for:', req.params.shopId);
    console.log('[ShopController] Body keys:', Object.keys(req.body));
    console.log('[ShopController] Files keys:', req.files ? Object.keys(req.files) : 'None');

    // Parse 'settings' JSON si c'est une string (cas FormData)
    if (typeof updateData.settings === 'string') {
        try {
            updateData.settings = JSON.parse(updateData.settings);
            console.log('[ShopController] Parsed settings successfully');
        } catch (e) {
            console.error('[ShopController] Failed to parse settings JSON:', e.message);
            // Fallback: on garde la string ou on met null ? 
            // Si on met null, le service ignorera l'update (COALESCE). C'est plus sûr que {} qui écrase tout.
            updateData.settings = undefined;
        }
    }

    // Ensure structure ONLY if we have settings (avoid overwriting with empty object if not provided)
    if (updateData.settings) {
        if (!updateData.settings.themeConfig) updateData.settings.themeConfig = {};
        if (!updateData.settings.themeConfig.content) updateData.settings.themeConfig.content = {};
    }

    // Utiliser les fichiers locaux
    if (req.files) {
        const baseUrl = process.env.API_URL || 'https://e-assime.com/api';
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');

        // On doit s'assurer que settings existe pour y mettre les URLs
        if (!updateData.settings) {
            // Si pas de settings fourni mais des fichiers, on doit récupérer l'existant ou créer structure min
            updateData.settings = { themeConfig: { content: {} } };
            // Note: Ceci est risqué si on écrase, mais shopService fait COALESCE.
            // Le mieux serait que le Service fasse un merge, ou que le controller fasse un GET avant.
            // Pour l'instant, on suppose que le front envoie tout ou rien.
        }

        // Réassurance structure (au cas où on vient de le créer)
        if (!updateData.settings.themeConfig) updateData.settings.themeConfig = {};
        if (!updateData.settings.themeConfig.content) updateData.settings.themeConfig.content = {};

        if (req.files['logo'] && req.files['logo'][0]) {
            updateData.settings.themeConfig.content.logoUrl = `${cleanBaseUrl}/uploads/${req.files['logo'][0].filename}`;
            console.log('[Shop] ✅ Logo updated (Local):', updateData.settings.themeConfig.content.logoUrl);
        }
        if (req.files['banner'] && req.files['banner'][0]) {
            updateData.settings.themeConfig.content.bannerUrl = `${cleanBaseUrl}/uploads/${req.files['banner'][0].filename}`;
            console.log('[Shop] ✅ Banner updated (Local):', updateData.settings.themeConfig.content.bannerUrl);
        }
    }

    // Clean data (MAIS ne pas toucher à settings qui est déjà un objet propre)
    // On nettoie manuellement pour éviter de casser settings
    const keysToClean = ['name', 'description', 'category', 'theme', 'status']; // status ajouté
    keysToClean.forEach(key => {
        if (updateData[key] === '' || updateData[key] === 'null' || updateData[key] === 'undefined') {
            updateData[key] = null;
        }
    });

    // On ne passe PAS par cleanData global qui est récursif et agressif sur 'settings'

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
