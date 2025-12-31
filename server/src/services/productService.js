const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

class ProductService {
    async getProductsByShop(shopId, queryParams) {
        const { page = 1, limit = 20, category, search } = queryParams;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM products WHERE shop_id = $1';
        let sqlParams = [shopId];
        let paramCount = 1;

        if (category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            sqlParams.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            sqlParams.push(`%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        sqlParams.push(limit, offset);

        const result = await db.query(query, sqlParams);

        // Compter le total
        let countQuery = 'SELECT COUNT(*) FROM products WHERE shop_id = $1';
        let countParams = [shopId];

        if (category) {
            countQuery += ' AND category = $2';
            countParams.push(category);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        return {
            products: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async createProduct(userId, productData) {
        const {
            name, description, price, category, shopId,
            images, inventory, sku, weight, dimensions
        } = productData;

        if (!name || !price || !shopId) {
            throw new AppError('Nom, prix et boutique requis', 400);
        }

        // Vérifier que l'utilisateur possède cette boutique
        const shopCheck = await db.query('SELECT id FROM shops WHERE id = $1 AND owner_id = $2', [shopId, userId]);
        if (shopCheck.rows.length === 0) {
            throw new AppError('Accès non autorisé à cette boutique', 403);
        }

        const productId = uuidv4();
        const insertQuery = `
      INSERT INTO products (
        id, name, description, price, category, shop_id, 
        images, inventory, sku, weight, dimensions, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW(), NOW())
      RETURNING *
    `;

        const result = await db.query(insertQuery, [
            productId, name, description || '', parseFloat(price), category || 'general',
            shopId, JSON.stringify(images || []), inventory || 0, sku || '',
            weight || 0, JSON.stringify(dimensions || {}),
        ]);

        return result.rows[0];
    }

    async getProductById(productId) {
        const query = 'SELECT * FROM products WHERE id = $1';
        const result = await db.query(query, [productId]);

        if (result.rows.length === 0) {
            throw new AppError('Produit non trouvé', 404);
        }

        return result.rows[0];
    }

    async updateProduct(userId, productId, updateData) {
        const { name, description, price, category, images, inventory, sku, weight, dimensions } = updateData;

        // Vérifier que l'utilisateur possède ce produit
        const ownershipCheck = await db.query(`
      SELECT p.id FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = $1 AND s.owner_id = $2
    `, [productId, userId]);

        if (ownershipCheck.rows.length === 0) {
            throw new AppError('Accès non autorisé à ce produit', 403);
        }

        const updateQuery = `
      UPDATE products 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        images = COALESCE($5, images),
        inventory = COALESCE($6, inventory),
        sku = COALESCE($7, sku),
        weight = COALESCE($8, weight),
        dimensions = COALESCE($9, dimensions),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

        const result = await db.query(updateQuery, [
            name, description, price ? parseFloat(price) : null, category,
            images ? JSON.stringify(images) : null, inventory, sku, weight,
            dimensions ? JSON.stringify(dimensions) : null, productId
        ]);

        return result.rows[0];
    }

    async deleteProduct(userId, productId) {
        // Vérifier que l'utilisateur possède ce produit
        const ownershipCheck = await db.query(`
      SELECT p.id FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = $1 AND s.owner_id = $2
    `, [productId, userId]);

        if (ownershipCheck.rows.length === 0) {
            throw new AppError('Accès non autorisé à ce produit', 403);
        }

        await db.query('DELETE FROM products WHERE id = $1', [productId]);
    }
}

module.exports = new ProductService();
