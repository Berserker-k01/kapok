const { Pool } = require('pg');
require('dotenv').config();

// Configuration PostgreSQL pour Docker VPS
// Le nom de l'hôte est 'postgres' (nom du service dans docker-compose.yml)
const poolConfig = {
    host: process.env.PGHOST || 'postgres',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'assime_db',
    user: process.env.PGUSER || 'assime_user',
    password: process.env.PGPASSWORD || 'assime_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

// Hardcoding connection details specifically for the Docker environment if variables are missing
if (process.env.NODE_ENV === 'production' && !process.env.PGHOST) {
    console.log('📦 Docker Context: Using default "postgres" host and standard credentials...');
}

const pool = new Pool(poolConfig);

/**
 * Convertit les placeholders de style MySQL (?) en placeholders PostgreSQL ($1, $2, ...)
 * Cela permet de garder le code des services/routes inchangé.
 */
const convertPlaceholders = (sql) => {
    let counter = 0;
    return sql.replace(/\?/g, () => `$${++counter}`);
};

/**
 * Fonction query compatible - retourne { rows, rowCount, insertId }
 */
const query = async (text, params) => {
    try {
        // Nettoyer les commandes MySQL parasites
        const sql = text.replace(/::jsonb/g, '').trim();
        
        // Convertir les placeholders ? -> $N
        const pgSql = convertPlaceholders(sql);

        const result = await pool.query(pgSql, params || []);

        return {
            rows: result.rows || [],
            rowCount: result.rowCount || 0,
            rowsAffected: result.rowCount || 0,
            // Pour Postgres, l'insertId est souvent dans rows[0].id
            insertId: (result.rows && result.rows[0]) ? result.rows[0].id : null
        };
    } catch (error) {
        console.error('[DB Error] Query:', text.substring(0, 150));
        console.error('[DB Error] Message:', error.message);
        throw error;
    }
};

// Test de connexion
pool.connect()
    .then(client => {
        console.log('✅ Connexion à la base de données PostgreSQL (Docker) établie');
        client.release();
    })
    .catch(err => {
        console.error('❌ Erreur de connexion à la base de données PostgreSQL:', err.message);
        console.warn('ℹ️ Si vous êtes en local hors Docker, assurez-vous que Postgres est lancé sur le port 5432.');
    });

module.exports = {
    query,
    pool
};
