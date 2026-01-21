const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const db = require('../server/src/config/database');
const { v4: uuidv4 } = require('uuid');

const updatePlans = async () => {
    console.log('🔄 Mise à jour des plans...');

    try {
        // 1. Définir les nouveaux plans
        const plans = [
            {
                key: 'basic',
                name: 'Basic',
                description: 'Pour démarrer votre business (1 Mois)',
                price: 30000,
                max_shops: 2,
                features: JSON.stringify([
                    "2 Boutiques",
                    "5 Produits gagnants offerts",
                    "Formation vidéo complète création boutique",
                    "Accès à vie Formation Ecom Mastery Gold",
                    "Accès Groupe Suivi (1 Mois)"
                ]),
                display_order: 2
            },
            {
                key: 'premium',
                name: 'Premium',
                description: 'Pour accélérer votre croissance (3 Mois)',
                price: 50000,
                max_shops: 5,
                features: JSON.stringify([
                    "5 Boutiques",
                    "10 Produits gagnants offerts",
                    "Formation vidéo complète",
                    "Accès à vie Formation Ecom Mastery Gold",
                    "Accès Groupe Suivi (3 Mois)"
                ]),
                display_order: 3
            },
            {
                key: 'gold',
                name: 'Gold',
                description: 'L\'expérience ultime pour scaler (6 Mois)',
                price: 99000,
                max_shops: 10,
                features: JSON.stringify([
                    "10 Boutiques",
                    "50 Produits gagnants offerts",
                    "Formation vidéo complète",
                    "Liste de fournisseurs",
                    "Équipe vente Afrique",
                    "Accès à vie Formation Ecom Mastery Gold",
                    "Accès Groupe Suivi (Illimité)"
                ]),
                display_order: 4
            }
        ];

        // 2. Mettre à jour ou insérer
        for (const plan of plans) {
            console.log(`Traitement du plan: ${plan.name}...`);

            // Check existence
            const check = await db.query('SELECT id FROM plans_config WHERE plan_key = ?', [plan.key]);

            if (check.rows.length > 0) {
                // Update
                await db.query(`
                    UPDATE plans_config 
                    SET name = ?, description = ?, price = ?, max_shops = ?, features = ?, display_order = ?, updated_at = NOW()
                    WHERE plan_key = ?
                `, [plan.name, plan.description, plan.price, plan.max_shops, plan.features, plan.display_order, plan.key]);
                console.log(`✅ Plan ${plan.name} mis à jour.`);
            } else {
                // Insert (si le plan n'existait pas, ex: Gold)
                await db.query(`
                    INSERT INTO plans_config (id, plan_key, name, description, price, currency, max_shops, features, is_active, display_order)
                    VALUES (?, ?, ?, ?, ?, 'XOF', ?, ?, TRUE, ?)
                `, [uuidv4(), plan.key, plan.name, plan.description, plan.price, plan.max_shops, plan.features, plan.display_order]);
                console.log(`✅ Plan ${plan.name} créé.`);
            }
        }

        console.log('🚀 Tous les plans ont été mis à jour avec succès.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
};

updatePlans();
