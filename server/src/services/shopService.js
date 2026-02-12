const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

/**
 * Normalise une URL d'image pour toujours retourner un chemin relatif.
 * Corrige les anciennes URLs absolues (http://127.0.0.1:5000/..., http://localhost:5000/..., etc.)
 */
function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('/api/uploads/') || url.startsWith('/uploads/')) {
        return url.startsWith('/uploads/') ? '/api' + url : url;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            if (pathname.includes('/uploads/')) {
                const uploadsIndex = pathname.indexOf('/uploads/');
                return '/api' + pathname.substring(uploadsIndex);
            }
            return url; // URL externe (Cloudinary, etc.)
        } catch (e) { return url; }
    }
    return url;
}

/**
 * Normalise toutes les URLs d'images dans un objet shop
 */
function normalizeShopImages(shop) {
    if (!shop) return shop;
    if (shop.logo_url) shop.logo_url = normalizeImageUrl(shop.logo_url);
    if (shop.banner_url) shop.banner_url = normalizeImageUrl(shop.banner_url);
    // Normaliser aussi dans les settings
    if (shop.settings?.themeConfig?.content) {
        const content = shop.settings.themeConfig.content;
        if (content.logoUrl) content.logoUrl = normalizeImageUrl(content.logoUrl);
        if (content.bannerUrl) content.bannerUrl = normalizeImageUrl(content.bannerUrl);
    }
    return shop;
}

class ShopService {
  async getAllShops(userId) {
    const query = `
      SELECT 
        s.*,
        CAST(COUNT(DISTINCT p.id) AS UNSIGNED) as product_count,
        CAST(COUNT(DISTINCT o.id) AS UNSIGNED) as order_count
      FROM shops s
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id
      WHERE s.owner_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;
    const result = await db.query(query, [userId]);

    // Parser settings pour chaque boutique (mysql2 execute retourne string)
    return result.rows.map(shop => {
      if (shop.settings && typeof shop.settings === 'string') {
        try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
      }
      return normalizeShopImages(shop);
    });
  }

  async createShop(userId, shopData) {
    const { name, description, category, theme } = shopData;
    // PLANS config removed, using DB table plans_config

    // Récupérer les limites via la nouvelle méthode unifiée
    // Note: createShop uses getUserShopLimit to ensure consistency
    const { limit: planLimit, plan: userPlan } = await this.getUserShopLimit(userId);

    // Vérifier la limite de boutiques
    const countQuery = 'SELECT COUNT(*) AS count FROM shops WHERE owner_id = ?';
    const countResult = await db.query(countQuery, [userId]);
    const shopCount = parseInt(countResult.rows[0].count);

    if (shopCount >= planLimit) {
      throw new AppError(`Limite de boutiques atteinte pour le plan ${userPlan} (Max ${planLimit})`, 400);
    }

    // Générer ou utiliser le slug fourni
    let slug = shopData.slug || name;
    slug = slug.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Vérifier l'unicité du slug
    const slugQuery = 'SELECT id FROM shops WHERE slug = ?';
    const slugResult = await db.query(slugQuery, [slug]);

    if (slugResult.rows.length > 0) {
      throw new AppError('Ce nom de boutique est déjà utilisé', 400);
    }

    const shopId = uuidv4();
    const insertQuery = `
      INSERT INTO shops (
        id, name, description, category, theme, slug, owner_id, 
        status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;

    await db.query(insertQuery, [
      shopId, name, description || '', category || 'general',
      theme || 'default', slug, userId
    ]);

    // FETCH AFTER INSERT (MySQL Manual RETURNING)
    const selectQuery = 'SELECT * FROM shops WHERE id = ?';
    const result = await db.query(selectQuery, [shopId]);

    return result.rows[0];
  }

  async getShopById(shopId) {
    const query = `
      SELECT 
        s.*,
        CAST(COUNT(DISTINCT p.id) AS UNSIGNED) as product_count,
        CAST(COUNT(DISTINCT o.id) AS UNSIGNED) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM shops s
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id AND o.status = 'completed'
      WHERE s.id = ?
      GROUP BY s.id
    `;

    const result = await db.query(query, [shopId]);

    if (result.rows.length === 0) {
      throw new AppError('Boutique non trouvée', 404);
    }

    const shop = result.rows[0];

    // Parser settings si c'est une string JSON (mysql2 execute retourne string)
    if (shop.settings && typeof shop.settings === 'string') {
      try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
    }

    return normalizeShopImages(shop);
  }

  async getShopBySlug(slug) {
    const query = `
      SELECT s.*
      FROM shops s
      WHERE slug = ?
    `;
    const result = await db.query(query, [slug]);
    
    if (result.rows.length === 0) return null;

    const shop = result.rows[0];

    // Parser settings si c'est une string JSON (mysql2 execute retourne string)
    if (shop.settings && typeof shop.settings === 'string') {
      try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
    }

    // Extraire tracking depuis settings pour compatibilité
    shop.tracking = {
      facebookPixelId: shop.settings?.facebookPixelId || null,
      googleAnalyticsId: shop.settings?.googleAnalyticsId || null,
    };

    return normalizeShopImages(shop);
  }

  async updateShop(shopId, updateData) {
    const { name, description, category, theme, settings, status, logo_url, banner_url } = updateData;

    // Convert undefined to null for SQL compatibility
    const safeName = name !== undefined ? name : null;
    const safeDescription = description !== undefined ? description : null;
    const safeCategory = category !== undefined ? category : null;
    const safeTheme = theme !== undefined ? theme : null;
    const safeStatus = status !== undefined ? status : null;
    const safeSettings = settings ? JSON.stringify(settings) : null;
    const safeLogoUrl = logo_url !== undefined ? logo_url : null;
    const safeBannerUrl = banner_url !== undefined ? banner_url : null;

    const updateQuery = `
      UPDATE shops 
      SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        theme = COALESCE(?, theme),
        status = COALESCE(?, status),
        settings = COALESCE(?, settings),
        logo_url = COALESCE(?, logo_url),
        banner_url = COALESCE(?, banner_url),
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      safeName, safeDescription, safeCategory, safeTheme, safeStatus,
      safeSettings, safeLogoUrl, safeBannerUrl, shopId
    ]);

    // FETCH AFTER UPDATE
    const result = await db.query('SELECT * FROM shops WHERE id = ?', [shopId]);

    if (result.rows.length === 0) {
      throw new AppError('Boutique non trouvée', 404);
    }

    const shop = result.rows[0];

    // Parser settings si c'est une string JSON
    if (shop.settings && typeof shop.settings === 'string') {
      try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
    }

    return normalizeShopImages(shop);
  }

  async deleteShop(shopId) {
    // Vérifier s'il y a des commandes en cours
    const ordersQuery = `
      SELECT COUNT(*) AS count FROM orders 
      WHERE shop_id = ? AND status IN ('pending', 'processing', 'shipped')
    `;
    const ordersResult = await db.query(ordersQuery, [shopId]);
    const pendingOrders = parseInt(ordersResult.rows[0].count);

    if (pendingOrders > 0) {
      throw new AppError('Impossible de supprimer la boutique : commandes en cours', 400);
    }

    await db.query('DELETE FROM shops WHERE id = ?', [shopId]);
  }

  async getShopStats(shopId) {
    // Statistiques générales
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM products WHERE shop_id = ?) as total_products,
        (SELECT COUNT(*) FROM orders WHERE shop_id = ?) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE shop_id = ? AND status IN ('completed', 'delivered', 'validated_by_customer')) as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE shop_id = ? AND created_at >= CURRENT_DATE - INTERVAL 30 DAY) as orders_last_30_days
    `;

    const statsResult = await db.query(statsQuery, [shopId, shopId, shopId, shopId]);

    // Ventes par mois (6 derniers mois)
    const salesQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-01') as month,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE shop_id = ? AND created_at >= CURRENT_DATE - INTERVAL 6 MONTH
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
      ORDER BY month DESC
    `;

    const salesResult = await db.query(salesQuery, [shopId]);

    // Top Produits (5 meilleurs)
    const topProductsQuery = `
      SELECT 
        p.name,
        COUNT(oi.id) as sales,
        COALESCE(SUM(oi.total), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.shop_id = ? AND o.status IN ('completed', 'delivered', 'validated_by_customer')
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 5
    `;
    const topProductsResult = await db.query(topProductsQuery, [shopId]);

    // Ventes par Catégorie
    const categoryQuery = `
      SELECT 
        p.category as name,
        COALESCE(SUM(oi.total), 0) as value
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.shop_id = ? AND o.status IN ('completed', 'delivered', 'validated_by_customer')
      GROUP BY p.category
    `;
    const categoryResult = await db.query(categoryQuery, [shopId]);

    // Activité Récente (5 dernières commandes)
    const recentActivityQuery = `
      SELECT 
        'Nouvelle commande' as action,
        orders.order_number as details,
        orders.created_at as time
      FROM orders
      WHERE shop_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const recentActivityResult = await db.query(recentActivityQuery, [shopId]);

    return {
      stats: statsResult.rows[0],
      monthlySales: salesResult.rows,
      topProducts: topProductsResult.rows,
      categorySales: categoryResult.rows,
      recentActivity: recentActivityResult.rows
    };
  }
  async getUserShopLimit(userId) {
    // 1. Get User Plan
    const userQuery = 'SELECT plan FROM users WHERE id = ?';
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) return { limit: 2, plan: 'free' };

    const userPlan = userResult.rows[0].plan || 'free';

    // 2. Get Limits from Config
    const planConfigQuery = 'SELECT * FROM plans_config';
    const planConfigResult = await db.query(planConfigQuery);

    let planLimit = 2; // Default fallback for free

    // DEBUG:
    console.log(`[ShopLimit] Checking limits for UserID: ${userId}, Plan: ${userPlan}`);
    console.log(`[ShopLimit] Available plans in DB:`, planConfigResult.rows.map(p => p.plan_key));

    // Find matching plan (Case Insensitive)
    const matchedPlan = planConfigResult.rows.find(p =>
      (p.plan_key && p.plan_key.toLowerCase() === userPlan.toLowerCase())
    );

    if (matchedPlan) {
      console.log(`[ShopLimit] Match found in DB for ${userPlan}: max_shops=${matchedPlan.max_shops}`);
      planLimit = matchedPlan.max_shops === null ? 9999 : parseInt(matchedPlan.max_shops);
    } else {
      console.log(`[ShopLimit] No DB match for plan '${userPlan}'. Using hardcoded fallbacks.`);

      // Hardcoded safety net
      if (['pro', 'premium', 'gold', 'unlimited'].includes(userPlan.toLowerCase())) {
        planLimit = 9999;
      } else if (['basic', 'starter'].includes(userPlan.toLowerCase())) {
        planLimit = 5;
      } else {
        // Free plan fallback check in settings
        try {
          const settingsQuery = "SELECT value FROM platform_settings WHERE `key` = 'free_plan_shops_limit'";
          const settingsResult = await db.query(settingsQuery);
          if (settingsResult.rows.length > 0) {
            planLimit = parseInt(settingsResult.rows[0].value);
          }
        } catch (e) {
          console.warn('[ShopLimit] Could not fetch platform settings, using default 2');
        }
      }
    }

    return { limit: planLimit, plan: userPlan };
  }
}

module.exports = new ShopService();
