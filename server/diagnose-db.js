const db = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

async function runDiagnosis() {
    const report = [];
    const log = (step, status, message, details = null) => {
        console.log(`[${status}] ${step}: ${message}`);
        report.push({ step, status, message, details });
        if (status === 'ERROR') console.error(details);
    };

    log('INIT', 'INFO', 'Démarrage du diagnostic complet...');

    let testUserId = uuidv4();
    let testShopId = uuidv4();
    let testProductId = uuidv4();

    try {
        // 1. TEST CONNEXION
        try {
            await db.pool.execute('SELECT 1');
            log('1. Database Connection', 'SUCCESS', 'Connexion MySQL établie');
        } catch (e) {
            log('1. Database Connection', 'ERROR', 'Echec connexion', e.message);
            throw e; // Stop si pas de DB
        }

        // 2. TEST PLANS CONFIG (Lecture)
        try {
            // Simule ce que le controlleur fait
            const query = 'SELECT * FROM plans_config ORDER BY display_order ASC';
            const result = await db.query(query);
            if (result.rows.length > 0) {
                log('2. Fetch Plans', 'SUCCESS', `${result.rows.length} plans trouvés`);
            } else {
                log('2. Fetch Plans', 'WARNING', 'Table plans_config vide');
            }
        } catch (e) {
            log('2. Fetch Plans', 'ERROR', 'Crash SQL sur lecture plans', e);
        }

        // 3. TEST USERS (Création)
        try {
            const email = `diag-${Date.now()}@test.com`;
            const insertQuery = `
        INSERT INTO users (id, name, email, password, role, status, created_at)
        VALUES (?, ?, ?, 'hash', 'user', 'active', NOW())
      `;
            await db.query(insertQuery, [testUserId, 'Diag User', email]);

            const check = await db.query('SELECT * FROM users WHERE id = ?', [testUserId]);
            if (check.rows.length > 0) {
                log('3. Create User', 'SUCCESS', 'Utilisateur créé et relu');
            } else {
                log('3. Create User', 'ERROR', 'Utilisateur créé mais introuvable (INSERT silencieux ?)');
            }
        } catch (e) {
            log('3. Create User', 'ERROR', 'Crash création user', e);
        }

        // 4. TEST SHOPS (Création + Lecture Stats)
        try {
            const slug = `shop-${Date.now()}`;
            const insertShop = `
        INSERT INTO shops (id, name, description, slug, owner_id, status, created_at)
        VALUES (?, 'Test Shop', 'Desc', ?, ?, 'active', NOW())
      `;
            await db.query(insertShop, [testShopId, slug, testUserId]);
            log('4.1 Create Shop', 'SUCCESS', 'Boutique créée');

            // Test Stats (Souvent la cause des erreurs)
            try {
                const statsQuery = `
          SELECT 
            (SELECT COUNT(*) FROM products WHERE shop_id = ?) as total_products,
            (SELECT COUNT(*) FROM orders WHERE shop_id = ?) as total_orders
        `;
                // Noter l'usage des ? multiples comme corrigé
                await db.query(statsQuery, [testShopId, testShopId]);
                log('4.2 Shop Stats (Basic)', 'SUCCESS', 'Requête stats simple OK');
            } catch (e) {
                log('4.2 Shop Stats (Basic)', 'ERROR', 'Crash stats simple', e);
            }

            // Test Date Logic (MySQL vs PG)
            try {
                const salesQuery = `
          SELECT DATE_FORMAT(created_at, '%Y-%m-01') as month
          FROM shops WHERE id = ?
        `;
                await db.query(salesQuery, [testShopId]);
                log('4.3 Date Functions', 'SUCCESS', 'Fonctions date MySQL OK');
            } catch (e) {
                log('4.3 Date Functions', 'ERROR', 'Problème syntaxe Date (PG functions?)', e);
            }

        } catch (e) {
            log('4. Create Shop', 'ERROR', 'Crash global boutique', e);
        }

        // 5. TEST PRODUCTS
        try {
            const insertProd = `
        INSERT INTO products (id, name, price, shop_id, status, created_at)
        VALUES (?, 'Product Test', 1000, ?, 'active', NOW())
      `;
            await db.query(insertProd, [testProductId, testShopId]);
            log('5. Create Product', 'SUCCESS', 'Produit créé');
        } catch (e) {
            log('5. Create Product', 'ERROR', 'Crash création produit', e);
        }

        // 6. TEST PAYMENT REQUEST (Critical Check)
        try {
            const paymentId = uuidv4();
            const insertPayment = `
        INSERT INTO subscription_payments 
        (id, user_id, plan_key, plan_name, amount, currency, payment_provider, payment_phone, status, created_at, updated_at)
        VALUES (?, ?, 'pro', 'Pro Plan', 5000, 'XOF', 'TMoney', '90909090', 'pending', NOW(), NOW())
      `;
            await db.query(insertPayment, [paymentId, testUserId]);
            log('6. Create Payment', 'SUCCESS', 'Paiement créé avec succès');

            // Select back
            const payCheck = await db.query('SELECT * FROM subscription_payments WHERE id = ?', [paymentId]);
            if (payCheck.rows.length > 0) log('6.1 Payment Check', 'SUCCESS', 'Paiement relu OK');
        } catch (e) {
            log('6. Create Payment', 'ERROR', 'CRASH CRÉATION PAIEMENT', e);
        }

        // CLEANUP
        try {
            await db.query('DELETE FROM users WHERE id = ?', [testUserId]); // Cascade devrait tout nettoyer
            log('6. Cleanup', 'SUCCESS', 'Données test nettoyées');
        } catch (e) {
            log('6. Cleanup', 'WARNING', 'Echec nettoyage', e.message);
        }

    } catch (error) {
        log('GLOBAL', 'FATAL', 'Erreur inattendue du script', error);
    } finally {
        console.log('--- RAPPORT FINAL TERMINÉ ---');
        // Si exécuté via require dans une route API, on pourrait retourner 'report'
        return report;
    }
}

// Si exécuté directement : node diagnose-db.js
if (require.main === module) {
    runDiagnosis().then(() => process.exit());
}

module.exports = runDiagnosis;
