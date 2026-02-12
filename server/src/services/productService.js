const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

class ProductService {
    async getProductsByShop(shopId, queryParams) {
        const { page = 1, limit = 20, category, search } = queryParams;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM products WHERE shop_id = ?';
        let sqlParams = [shopId];

        if (category) {
            query += ` AND category = ?`;
            sqlParams.push(category);
        }

        if (search) {
            // MySQL est insensible à la casse par défaut avec utf8mb4_unicode_ci
            query += ` AND (name LIKE ? OR description LIKE ?)`;
            sqlParams.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        sqlParams.push(parseInt(limit), parseInt(offset));

        const result = await db.query(query, sqlParams);

        // Compter le total
        let countQuery = 'SELECT COUNT(*) AS count FROM products WHERE shop_id = ?';
        let countParams = [shopId];

        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        const products = result.rows.map(p => {
            let images = p.images;
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch (e) {
                    images = [];
                }
            }
            return {
                ...p,
                image_url: (Array.isArray(images) && images.length > 0) ? images[0] : null
            };
        });

        return {
            products: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async createProduct(userId, productData) {
        // Mapping frontend 'stock' -> backend 'inventory'
        if (productData.stock !== undefined && productData.inventory === undefined) {
            productData.inventory = productData.stock;
        }

        const {
            name, description, price, category, shopId,
            image_url, inventory, sku, weight, dimensions
        } = productData;

        // DB Alignment: image_url -> images JSON
        const images = productData.images || (image_url ? [image_url] : []);

        if (!name || !price || !shopId) {
            throw new AppError('Nom, prix et boutique requis', 400);
        }

        // Vérifier que l'utilisateur possède cette boutique
        const shopCheck = await db.query('SELECT id FROM shops WHERE id = ? AND owner_id = ?', [shopId, userId]);
        if (shopCheck.rows.length === 0) {
            throw new AppError('Accès non autorisé à cette boutique', 403);
        }

        const productId = uuidv4();
        const insertQuery = `
      INSERT INTO products (
        id, name, description, price, category, shop_id, 
        images, inventory, sku, weight, dimensions, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;

        await db.query(insertQuery, [
            productId, name, description || '', parseFloat(price), category || 'general',
            shopId, JSON.stringify(images || []), inventory || 0, sku || '',
            weight || 0, JSON.stringify(dimensions || {}),
        ]);

        // FETCH AFTER INSERT
        const result = await db.query('SELECT * FROM products WHERE id = ?', [productId]);

        return result.rows[0];
    }

    async getProductById(productId) {
        const query = 'SELECT * FROM products WHERE id = ?';
        const result = await db.query(query, [productId]);

        if (result.rows.length === 0) {
            throw new AppError('Produit non trouvé', 404);
        }

        const product = result.rows[0];

        // Parser images JSON (mysql2 execute retourne string)
        let images = product.images;
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch (e) { images = []; }
        }
        product.images = images;
        product.image_url = (Array.isArray(images) && images.length > 0) ? images[0] : null;

        return product;
    }

    async updateProduct(userId, productId, updateData) {
        // Mapping frontend 'stock' -> backend 'inventory'
        if (updateData.stock !== undefined && updateData.inventory === undefined) {
            updateData.inventory = updateData.stock;
        }

        const { name, description, price, category, image_url, inventory, sku, weight, dimensions } = updateData;

        let { images } = updateData;
        if (image_url) {
            images = [image_url];
        }

        // Vérifier que l'utilisateur possède ce produit
        const ownershipCheck = await db.query(`
      SELECT p.id FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = ? AND s.owner_id = ?
    `, [productId, userId]);

        if (ownershipCheck.rows.length === 0) {
            throw new AppError('Accès non autorisé à ce produit', 403);
        }

        const updateQuery = `
      UPDATE products 
      SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category = COALESCE(?, category),
        images = COALESCE(?, images),
        inventory = COALESCE(?, inventory),
        sku = COALESCE(?, sku),
        weight = COALESCE(?, weight),
        dimensions = COALESCE(?, dimensions),
        updated_at = NOW()
      WHERE id = ?
    `;

        // IMPORTANT: MySQL crash si param est undefined. On doit passer null.
        await db.query(updateQuery, [
            name !== undefined ? name : null,
            description !== undefined ? description : null,
            price !== undefined ? parseFloat(price) : null,
            category !== undefined ? category : null,
            images !== undefined ? JSON.stringify(images) : null,
            inventory !== undefined ? inventory : null,
            sku !== undefined ? sku : null,
            weight !== undefined ? weight : null,
            dimensions !== undefined ? JSON.stringify(dimensions) : null,
            productId
        ]);

        // FETCH AFTER UPDATE
        const result = await db.query('SELECT * FROM products WHERE id = ?', [productId]);

        return result.rows[0];
    }

    async deleteProduct(userId, productId) {
        // Vérifier que l'utilisateur possède ce produit
        const ownershipCheck = await db.query(`
      SELECT p.id FROM products p 
      JOIN shops s ON p.shop_id = s.id 
      WHERE p.id = ? AND s.owner_id = ?
    `, [productId, userId]);

        if (ownershipCheck.rows.length === 0) {
            throw new AppError('Accès non autorisé à ce produit', 403);
        }

        await db.query('DELETE FROM products WHERE id = ?', [productId]);
    }
}

module.exports = new ProductService();
