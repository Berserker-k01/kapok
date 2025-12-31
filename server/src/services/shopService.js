const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

class ShopService {
  async getAllShops(userId) {
    const query = `
      SELECT 
        s.*,
        COUNT(p.id) as product_count,
        COUNT(o.id) as order_count
      FROM shops s
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id
      WHERE s.owner_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  async createShop(userId, shopData) {
    const { name, description, category, theme } = shopData;
    const PLANS = require('../config/plans');

    // Récupérer le plan de l'utilisateur
    const userQuery = 'SELECT plan FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const userPlan = userResult.rows[0].plan || 'free';

    // Récupérer les limites dynamiques depuis la DB
    let planLimit = 2; // Fallback

    if (userPlan === 'free') {
      const settingsQuery = "SELECT value FROM platform_settings WHERE key = 'free_plan_shops_limit'";
      const settingsResult = await db.query(settingsQuery);
      if (settingsResult.rows.length > 0) {
        planLimit = parseInt(settingsResult.rows[0].value);
      }
    } else {
      // Pour les autres plans, on garde la config statique pour l'instant (ou on pourrait aussi la mettre en DB)
      planLimit = PLANS[userPlan]?.maxShops || 2;
    }

    // Vérifier la limite de boutiques
    const countQuery = 'SELECT COUNT(*) FROM shops WHERE owner_id = $1';
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
    const slugQuery = 'SELECT id FROM shops WHERE slug = $1';
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      shopId, name, description || '', category || 'general',
      theme || 'default', slug, userId
    ]);

    return result.rows[0];
  }

  async getShopById(shopId) {
    const query = `
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM shops s
      LEFT JOIN products p ON s.id = p.shop_id
      LEFT JOIN orders o ON s.id = o.shop_id AND o.status = 'completed'
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const result = await db.query(query, [shopId]);

    if (result.rows.length === 0) {
      throw new AppError('Boutique non trouvée', 404);
    }

    return result.rows[0];
  }

  async getShopBySlug(slug) {
    const query = `
      SELECT s.*, json_build_object(
        'facebookPixelId', s.settings->>'facebookPixelId',
        'googleAnalyticsId', s.settings->>'googleAnalyticsId'
      ) as tracking
      FROM shops s
      WHERE slug = $1
    `;
    const result = await db.query(query, [slug]);
    return result.rows[0];
  }

  async updateShop(shopId, updateData) {
    const { name, description, category, theme, settings } = updateData;

    const updateQuery = `
      UPDATE shops 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        theme = COALESCE($4, theme),
        settings = COALESCE($5, settings),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      name, description, category, theme,
      settings ? JSON.stringify(settings) : null, shopId
    ]);

    if (result.rows.length === 0) {
      throw new AppError('Boutique non trouvée', 404);
    }

    return result.rows[0];
  }

  async deleteShop(shopId) {
    // Vérifier s'il y a des commandes en cours
    const ordersQuery = `
      SELECT COUNT(*) FROM orders 
      WHERE shop_id = $1 AND status IN ('pending', 'processing', 'shipped')
    `;
    const ordersResult = await db.query(ordersQuery, [shopId]);
    const pendingOrders = parseInt(ordersResult.rows[0].count);

    if (pendingOrders > 0) {
      throw new AppError('Impossible de supprimer la boutique : commandes en cours', 400);
    }

    await db.query('DELETE FROM shops WHERE id = $1', [shopId]);
  }

  async getShopStats(shopId) {
    // Statistiques générales
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM products WHERE shop_id = $1) as total_products,
        (SELECT COUNT(*) FROM orders WHERE shop_id = $1) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE shop_id = $1 AND status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE shop_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30_days
    `;

    const statsResult = await db.query(statsQuery, [shopId]);

    // Ventes par mois (6 derniers mois)
    const salesQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE shop_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
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
      WHERE o.shop_id = $1 AND o.status = 'completed'
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
      WHERE o.shop_id = $1 AND o.status = 'completed'
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
      WHERE shop_id = $1
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
}

module.exports = new ShopService();
