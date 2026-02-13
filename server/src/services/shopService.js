const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

/**
 * Normalise une URL d'image pour toujours retourner un chemin relatif.
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
            return url;
        } catch (e) { return url; }
    }
    return url;
}

function normalizeShopImages(shop) {
    if (!shop) return shop;
    if (shop.logo_url) shop.logo_url = normalizeImageUrl(shop.logo_url);
    if (shop.banner_url) shop.banner_url = normalizeImageUrl(shop.banner_url);
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
        COUNT(DISTINCT p.id)::integer as product_count,
        COUNT(DISTINCT o.id)::integer as order_count
      FROM shops s
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id
      WHERE s.owner_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;
    const result = await db.query(query, [userId]);

    return result.rows.map(shop => {
      if (shop.settings && typeof shop.settings === 'string') {
        try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
      }
      return normalizeShopImages(shop);
    });
  }

  async createShop(userId, shopData) {
    const { name, description, category, theme } = shopData;

    const { limit: planLimit, plan: userPlan } = await this.getUserShopLimit(userId);

    const countQuery = 'SELECT COUNT(*)::integer AS count FROM shops WHERE owner_id = ?';
    const countResult = await db.query(countQuery, [userId]);
    const shopCount = parseInt(countResult.rows[0].count);

    if (shopCount >= planLimit) {
      throw new AppError(`Limite de boutiques atteinte pour le plan ${userPlan} (Max ${planLimit})`, 400);
    }

    let slug = shopData.slug || name;
    slug = slug.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

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

    const selectQuery = 'SELECT * FROM shops WHERE id = ?';
    const result = await db.query(selectQuery, [shopId]);

    return result.rows[0];
  }

  async getShopById(shopId) {
    const query = `
      SELECT 
        s.*,
        COUNT(DISTINCT p.id)::integer as product_count,
        COUNT(DISTINCT o.id)::integer as order_count,
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

    if (shop.settings && typeof shop.settings === 'string') {
      try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
    }

    return normalizeShopImages(shop);
  }

  async getShopBySlug(slug) {
    const query = 'SELECT s.* FROM shops s WHERE slug = ?';
    const result = await db.query(query, [slug]);
    
    if (result.rows.length === 0) return null;

    const shop = result.rows[0];

    if (shop.settings && typeof shop.settings === 'string') {
      try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
    }

    shop.tracking = {
      facebookPixelId: shop.settings?.facebookPixelId || null,
      googleAnalyticsId: shop.settings?.googleAnalyticsId || null,
    };

    return normalizeShopImages(shop);
  }

  async updateShop(shopId, updateData) {
    const { name, description, category, theme, settings, status, logo_url, banner_url } = updateData;

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
        settings = COALESCE(?::jsonb, settings),
        logo_url = COALESCE(?, logo_url),
        banner_url = COALESCE(?, banner_url),
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      safeName, safeDescription, safeCategory, safeTheme, safeStatus,
      safeSettings, safeLogoUrl, safeBannerUrl, shopId
    ]);

    const result = await db.query('SELECT * FROM shops WHERE id = ?', [shopId]);

    if (result.rows.length === 0) {
      throw new AppError('Boutique non trouvée', 404);
    }

    const shop = result.rows[0];

    if (shop.settings && typeof shop.settings === 'string') {
      try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
    }

    return normalizeShopImages(shop);
  }

  async deleteShop(shopId) {
    const ordersQuery = `
      SELECT COUNT(*)::integer AS count FROM orders 
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
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*)::integer FROM products WHERE shop_id = ?) as total_products,
        (SELECT COUNT(*)::integer FROM orders WHERE shop_id = ?) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE shop_id = ? AND status IN ('completed', 'delivered', 'validated_by_customer')) as total_revenue,
        (SELECT COUNT(*)::integer FROM orders WHERE shop_id = ? AND created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30_days
    `;

    const statsResult = await db.query(statsQuery, [shopId, shopId, shopId, shopId]);

    const salesQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-01') as month,
        COUNT(*)::integer as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE shop_id = ? AND created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-01')
      ORDER BY month DESC
    `;

    const salesResult = await db.query(salesQuery, [shopId]);

    const topProductsQuery = `
      SELECT 
        p.name,
        COUNT(oi.id)::integer as sales,
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
    const userQuery = 'SELECT plan FROM users WHERE id = ?';
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) return { limit: 2, plan: 'free' };

    const userPlan = userResult.rows[0].plan || 'free';

    const planConfigQuery = 'SELECT * FROM plans_config';
    const planConfigResult = await db.query(planConfigQuery);

    let planLimit = 2;

    const matchedPlan = planConfigResult.rows.find(p =>
      (p.plan_key && p.plan_key.toLowerCase() === userPlan.toLowerCase())
    );

    if (matchedPlan) {
      planLimit = matchedPlan.max_shops === null ? 9999 : parseInt(matchedPlan.max_shops);
    } else {
      if (['pro', 'premium', 'gold', 'unlimited'].includes(userPlan.toLowerCase())) {
        planLimit = 9999;
      } else if (['basic', 'starter'].includes(userPlan.toLowerCase())) {
        planLimit = 5;
      } else {
        try {
          const settingsQuery = "SELECT value FROM platform_settings WHERE key = 'free_plan_shops_limit'";
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
