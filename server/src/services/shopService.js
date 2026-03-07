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
        (SELECT COUNT(id) FROM products WHERE shop_id = s.id) as product_count,
        (SELECT COUNT(id) FROM orders WHERE shop_id = s.id) as order_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE shop_id = s.id) as total_revenue
      FROM shops s
      WHERE s.owner_id = ?
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

    let originalSlug = shopData.slug || name;
    originalSlug = originalSlug.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = originalSlug;
    let counter = 1;

    // Boucle pour garantir l'unicité du slug sans rejeter la création
    while (true) {
      const slugQuery = 'SELECT id FROM shops WHERE slug = ?';
      const slugResult = await db.query(slugQuery, [slug]);

      if (slugResult.rows.length === 0) {
        break; // Le slug est disponible
      }

      // Si déjà pris, on ajoute un suffixe
      slug = `${originalSlug}-${counter}`;
      counter++;

      // Sécurité pour éviter une boucle infinie (très improbable)
      if (counter > 100) {
        throw new AppError('Ce nom de boutique génère trop de collisions, veuillez en choisir un autre', 400);
      }
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
    const {
      name, description, category, theme, settings, status, logo_url, banner_url,
      google_sheet_id, whatsapp_number, notification_email, notifications_enabled
    } = updateData;

    // Construction dynamique de la query — on ne met à jour que ce qui est fourni
    const setClauses = [];
    const values = [];

    if (name !== undefined && name !== null) { setClauses.push(`name = $${values.length + 1}`); values.push(name); }
    if (description !== undefined) { setClauses.push(`description = $${values.length + 1}`); values.push(description); }
    if (category !== undefined && category) { setClauses.push(`category = $${values.length + 1}`); values.push(category); }
    if (theme !== undefined && theme) { setClauses.push(`theme = $${values.length + 1}`); values.push(theme); }
    if (status !== undefined && status) { setClauses.push(`status = $${values.length + 1}`); values.push(status); }
    if (logo_url !== undefined) { setClauses.push(`logo_url = $${values.length + 1}`); values.push(logo_url); }
    if (banner_url !== undefined) { setClauses.push(`banner_url = $${values.length + 1}`); values.push(banner_url); }
    if (google_sheet_id !== undefined) { setClauses.push(`google_sheet_id = $${values.length + 1}`); values.push(google_sheet_id || null); }
    if (whatsapp_number !== undefined) { setClauses.push(`whatsapp_number = $${values.length + 1}`); values.push(whatsapp_number || null); }
    if (notification_email !== undefined) { setClauses.push(`notification_email = $${values.length + 1}`); values.push(notification_email || null); }
    if (notifications_enabled !== undefined) { setClauses.push(`notifications_enabled = $${values.length + 1}`); values.push(notifications_enabled === '1' || notifications_enabled === true); }

    // Settings JSONB — on passe la chaîne JSON directement avec cast explicite
    if (settings !== undefined && settings !== null) {
      const settingsStr = typeof settings === 'string' ? settings : JSON.stringify(settings);
      setClauses.push(`settings = $${values.length + 1}::jsonb`);
      values.push(settingsStr);
    }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length <= 1) {
      // Seulement updated_at — rien à faire
      const result = await db.pool.query('SELECT * FROM shops WHERE id = $1', [shopId]);
      if (result.rows.length === 0) throw new AppError('Boutique non trouvée', 404);
      const shop = result.rows[0];
      if (shop.settings && typeof shop.settings === 'string') {
        try { shop.settings = JSON.parse(shop.settings); } catch (e) { shop.settings = {}; }
      }
      return normalizeShopImages(shop);
    }

    values.push(shopId);
    const updateQuery = `UPDATE shops SET ${setClauses.join(', ')} WHERE id = $${values.length}`;

    // On utilise pool.query directement pour éviter la conversion ? -> $N (déjà fait)
    await db.pool.query(updateQuery, values);

    const result = await db.pool.query('SELECT * FROM shops WHERE id = $1', [shopId]);

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
