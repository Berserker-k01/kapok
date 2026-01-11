const db = require('../config/database')
const sheetService = require('../services/sheetService')
const { v4: uuidv4 } = require('uuid')

exports.getOrdersByShop = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query
        const offset = (page - 1) * limit

        // Vérifier que l'utilisateur possède cette boutique
        const shopCheck = await db.query('SELECT id FROM shops WHERE id = ? AND owner_id = ?', [req.params.shopId, req.user.id])
        if (shopCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Accès non autorisé à cette boutique' })
        }

        let query = `
      SELECT o.*, 
             JSON_OBJECT(
               'name', c.name,
               'email', c.email,
               'phone', c.phone
             ) as customer
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.shop_id = ?
    `
        let queryParams = [req.params.shopId]
        let paramCount = 1

        if (status && status !== 'all') {
            query += ` AND o.status = ?`
            queryParams.push(status)
        }

        query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
        queryParams.push(parseInt(limit), parseInt(offset))

        const result = await db.query(query, queryParams)

        res.json({
            orders: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            }
        })

    } catch (error) {
        console.error('Erreur récupération commandes:', error)
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes' })
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body
        const orderId = req.params.orderId

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'validated_by_customer', 'cancelled']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Statut invalide' })
        }

        // Vérifier que l'utilisateur possède cette commande
        const ownershipCheck = await db.query(`
      SELECT o.id FROM orders o 
      JOIN shops s ON o.shop_id = s.id 
      WHERE o.id = ? AND s.owner_id = ?
    `, [orderId, req.user.id])

        if (ownershipCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Accès non autorisé à cette commande' })
        }

        const updateQuery = `
      UPDATE orders 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `

        await db.query(updateQuery, [status, orderId])

        // FETCH AFTER UPDATE
        const result = await db.query('SELECT * FROM orders WHERE id = ?', [orderId])

        res.json({
            message: 'Statut de commande mis à jour',
            order: result.rows[0]
        })

    } catch (error) {
        console.error('Erreur mise à jour commande:', error)
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' })
    }
}

exports.getOrderPublic = async (req, res) => {
    try {
        const { orderId } = req.params

        const query = `
      SELECT o.id, o.order_number, o.total_amount, o.currency, o.created_at, s.name as shop_name
      FROM orders o
      JOIN shops s ON o.shop_id = s.id
      WHERE o.id = ?
    `
        const result = await db.query(query, [orderId])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Commande non trouvée' })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error('Erreur récupération commande publique:', error)
        res.status(500).json({ error: 'Erreur serveur' })
    }
}

exports.validateOrder = async (req, res) => {
    try {
        const { orderId } = req.params

        const updateQuery = `
      UPDATE orders 
      SET status = 'validated_by_customer', updated_at = NOW()
      WHERE id = ? AND status = 'delivered'
    `

        await db.query(updateQuery, [orderId])

        // FETCH AFTER UPDATE
        const result = await db.query('SELECT * FROM orders WHERE id = ?', [orderId])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Commande non trouvée ou statut incorrect (doit être livrée)' })
        }

        res.json({
            message: 'Commande validée avec succès',
            order: result.rows[0]
        })

    } catch (error) {
        console.error('Erreur validation commande:', error)
        res.status(500).json({ error: 'Erreur lors de la validation de la commande' })
    }
}
exports.createPublicOrder = async (req, res) => {
    try {
        const { firstName, lastName, phone, address, city, quantity, productId, shopId } = req.body

        // 1. Récupérer le produit et la boutique
        // Note: Dans une vraie implémentation, on vérifierait le stock ici
        const productQuery = `
            SELECT p.*, s.currency 
            FROM products p 
            JOIN shops s ON p.shop_id = s.id 
            WHERE p.id = ?
        `
        const productResult = await db.query(productQuery, [productId])

        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Produit non trouvé' })
        }

        const product = productResult.rows[0]
        const totalAmount = product.price * quantity

        // 2. Créer ou récupérer le client (simplifié pour COD)
        // On cherche par téléphone pour éviter les doublons
        let customerId
        const customerCheck = await db.query('SELECT id FROM customers WHERE phone = ?', [phone])

        if (customerCheck.rows.length > 0) {
            customerId = customerCheck.rows[0].id
        } else {
            const newCustomer = await db.query(`
                INSERT INTO customers (name, phone, address, city, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [`${firstName} ${lastName}`, phone, address, city])

            // FETCH CUSTOMER ID (using SELECT because no INSERT RETURNING in MySQL for simple queries either if we want to be safe, though LAST_INSERT_ID() works for auto-increment. Assuming UUID or AI? Customers usually have UUID in this app?)
            // Wait, schema says customers id is integer? Or UUID? Schema mysql file says customers id is CHAR(36).
            // So we need to generate UUID or find it.
            // Ah, the original code used RETURNING id.
            // If ID is auto-generated by DB (default UUID()), we can't get it easily without SELECT query on phone.
            // BUT, if we generate it here? The original code didn't generate it.
            // Let's assume we need to query it back.

            const fetchedCustomer = await db.query('SELECT id FROM customers WHERE phone = ?', [phone])
            customerId = fetchedCustomer.rows[0].id
        }

        // 3. Créer la commande
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
        const newOrder = await db.query(`
            INSERT INTO orders (
                shop_id, customer_id, total_amount, currency, status, 
                payment_status, payment_method, order_number, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, 'pending', 'pending', 'cod', ?, NOW(), NOW())
        `, [product.shop_id, customerId, totalAmount, product.currency, orderNumber])

        // FETCH AFTER INSERT
        const fetchedOrder = await db.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber])

        const order = fetchedOrder.rows[0]

        // 4. Ajouter les items
        await db.query(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        `, [order.id, product.id, quantity, product.price])

        // 5. Enrichir l'objet commande pour le Sheet
        const fullOrder = {
            ...order,
            customer: { name: `${firstName} ${lastName}`, phone, address: `${address}, ${city}` },
            items: [{ quantity, product_name: product.name }]
        }

        // 6. Synchro Google Sheet (Asynchrone - ne bloque pas la réponse)
        sheetService.appendOrder(fullOrder).catch(err => console.error('Sheet sync error:', err))

        res.status(201).json({
            message: 'Commande créée avec succès',
            order: fullOrder
        })

    } catch (error) {
        console.error('Erreur création commande publique:', error)
        res.status(500).json({ error: 'Erreur lors de la création de la commande' })
    }
}
