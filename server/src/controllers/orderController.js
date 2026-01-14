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
        const { firstName, lastName, phone, address, city, quantity, productId, shopId, items } = req.body

        // 1. Validation de shopId
        if (!shopId) {
            return res.status(400).json({ error: 'Shop ID manquant' })
        }

        // 2. Normalisation des items (Cart vs Single Product)
        let orderItems = []
        if (items && Array.isArray(items) && items.length > 0) {
            orderItems = items // Format attendu: [{ productId, quantity }]
        } else if (productId && quantity) {
            orderItems = [{ productId, quantity }]
        } else {
            return res.status(400).json({ error: 'Aucun produit sélectionné' })
        }

        // 3. Récupérer les infos produits et calculer le total
        let totalAmount = 0
        let currency = 'XOF'
        let verifiedItems = []

        for (const item of orderItems) {
            const productQuery = `
                SELECT p.*, s.id as shop_id
                FROM products p 
                JOIN shops s ON p.shop_id = s.id 
                WHERE p.id = ? AND s.id = ?
            `
            const productResult = await db.query(productQuery, [item.productId, shopId])

            if (productResult.rows.length === 0) {
                continue; // Ou erreur 404 si strict
            }

            const product = productResult.rows[0]
            currency = 'XOF' // Default currency since shops table doesn't have it yet
            const itemTotal = product.price * item.quantity
            totalAmount += itemTotal

            verifiedItems.push({
                ...product,
                quantity: item.quantity,
                price: product.price
            })
        }

        if (verifiedItems.length === 0) {
            return res.status(404).json({ error: 'Produits non trouvés ou invalides' })
        }

        // 4. Créer ou récupérer le client
        let customerId
        const customerCheck = await db.query('SELECT id FROM customers WHERE phone = ?', [phone])

        if (customerCheck.rows.length > 0) {
            customerId = customerCheck.rows[0].id
        } else {
            // Check if customer already exists for this shop? No, customers are global or shop-specific? 
            // In this schema, customers seem global but linked via orders.
            await db.query(`
                INSERT INTO customers (name, phone, address, city, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [`${firstName} ${lastName}`, phone, address, city])

            const fetchedCustomer = await db.query('SELECT id FROM customers WHERE phone = ?', [phone])
            customerId = fetchedCustomer.rows[0].id
        }

        // 5. Créer la commande
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
        const newOrder = await db.query(`
            INSERT INTO orders (
                shop_id, customer_id, total_amount, currency, status, 
                payment_status, payment_method, order_number, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, 'pending', 'pending', 'cod', ?, NOW(), NOW())
        `, [shopId, customerId, totalAmount, currency, orderNumber])

        // FETCH AFTER INSERT id needed for items
        const fetchedOrder = await db.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber])
        const order = fetchedOrder.rows[0]

        // 6. Insérer les items
        for (const item of verifiedItems) {
            await db.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `, [order.id, item.id, item.quantity, item.price])
        }

        // 7. Synchro Sheet & Response
        const fullOrder = {
            ...order,
            customer: { name: `${firstName} ${lastName}`, phone, address: `${address}, ${city}` },
            items: verifiedItems.map(i => ({ quantity: i.quantity, product_name: i.name }))
        }

        sheetService.appendOrder(fullOrder).catch(err => console.error('Sheet sync error:', err))

        res.status(201).json({
            message: 'Commande créée avec succès',
            order: fullOrder
        })

    } catch (error) {
        console.error('Erreur création commande publique:', error)
        res.status(500).json({
            error: 'Erreur lors de la création de la commande',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
    }
}
