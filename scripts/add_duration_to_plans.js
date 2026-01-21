const mysql = require('mysql2/promise');

const config = {
    host: '127.0.0.1',
    user: 'u980915146_admin',
    password: 'Daniel2005k@ssi',
    database: 'u980915146_assimedb',
    port: 3306
};

const addDurationColumn = async () => {
    console.log('🔄 Ajout de la colonne duration_months via connexion directe...');

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Connecté à MySQL.');

        // 1. Ajouter la colonne
        try {
            await connection.query(`
                ALTER TABLE plans_config 
                ADD COLUMN duration_months INT DEFAULT 1 AFTER currency;
            `);
            console.log('✅ Colonne duration_months ajoutée.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ La colonne existe déjà.');
            } else {
                console.error('Erreur ALTER:', error.message);
            }
        }

        // 2. Mettre à jour les plans
        const updates = [
            { key: 'basic', duration: 1 },
            { key: 'premium', duration: 3 },
            { key: 'gold', duration: 6 },
            { key: 'free', duration: 1000 }
        ];

        for (const update of updates) {
            await connection.query(`
                UPDATE plans_config 
                SET duration_months = ? 
                WHERE plan_key = ?
            `, [update.duration, update.key]);
        }
        console.log('✅ Plans mis à jour.');

        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Echec migration:', error.message);
        if (connection) await connection.end();
        process.exit(1);
    }
};

addDurationColumn();
