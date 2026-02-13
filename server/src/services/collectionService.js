const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

class CollectionService {
    async createCollection(shopId, data) {
        const { name, description, image_url, slug } = data;

        // Generate slug from name if not provided
        let finalSlug = slug || name;
        finalSlug = finalSlug.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // Check slug uniqueness within the shop
        const slugQuery = 'SELECT id FROM collections WHERE shop_id = ? AND slug = ?';
        const slugResult = await db.query(slugQuery, [shopId, finalSlug]);

        if (slugResult.rows.length > 0) {
            // Append random string if slug exists
            finalSlug = `${finalSlug}-${Math.floor(Math.random() * 1000)}`;
        }

        const collectionId = uuidv4();
        const query = `
      INSERT INTO collections (id, shop_id, name, slug, description, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `;

        await db.query(query, [collectionId, shopId, name, finalSlug, description, image_url]);

        const newCollection = await this.getCollectionById(collectionId);
        return newCollection;
    }

    async getCollectionsByShop(shopId) {
        const query = `
      SELECT c.*, COUNT(cp.product_id)::integer as product_count
      FROM collections c
      LEFT JOIN collection_products cp ON c.id = cp.collection_id
      WHERE c.shop_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
        const result = await db.query(query, [shopId]);
        return result.rows;
    }

    async getCollectionById(collectionId) {
        const query = 'SELECT * FROM collections WHERE id = ?';
        const result = await db.query(query, [collectionId]);
        if (result.rows.length === 0) return null;
        return result.rows[0];
    }

    async updateCollection(collectionId, data) {
        const { name, description, image_url, status, slug } = data;

        // Only update fields that are provided
        const updateQuery = `
      UPDATE collections 
      SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status),
        slug = COALESCE(?, slug),
        updated_at = NOW()
      WHERE id = ?
    `;

        await db.query(updateQuery, [name, description, image_url, status, slug, collectionId]);
        return this.getCollectionById(collectionId);
    }

    async deleteCollection(collectionId) {
        await db.query('DELETE FROM collections WHERE id = ?', [collectionId]);
    }

    async addProductToCollection(collectionId, productId) {
        // Check if relation exists
        const checkQuery = 'SELECT * FROM collection_products WHERE collection_id = ? AND product_id = ?';
        const checkResult = await db.query(checkQuery, [collectionId, productId]);

        if (checkResult.rows.length === 0) {
            const insertQuery = 'INSERT INTO collection_products (collection_id, product_id) VALUES (?, ?)';
            await db.query(insertQuery, [collectionId, productId]);
        }
    }

    async removeProductFromCollection(collectionId, productId) {
        const query = 'DELETE FROM collection_products WHERE collection_id = ? AND product_id = ?';
        await db.query(query, [collectionId, productId]);
    }

    async getCollectionProducts(collectionId) {
        const query = `
      SELECT p.* 
      FROM products p
      JOIN collection_products cp ON p.id = cp.product_id
      WHERE cp.collection_id = ?
      ORDER BY cp.created_at DESC
    `;
        const result = await db.query(query, [collectionId]);
        return result.rows;
    }
}

module.exports = new CollectionService();
