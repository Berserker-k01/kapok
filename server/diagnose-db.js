require('dotenv').config();
const { Pool } = require('pg');

console.log('--- DIAGNOSTIC BASE DE DONNÉES ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL présente:', process.env.DATABASE_URL ? 'OUI (Masquée pour sécurité)' : 'NON');

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'lesigne_db',
        password: process.env.DB_PASSWORD ? '******' : 'NON DÉFI',
        port: process.env.DB_PORT || 5432,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

if (!process.env.DATABASE_URL) {
    console.log('Détails Config (sans DATABASE_URL):', {
        host: poolConfig.host,
        user: poolConfig.user,
        database: poolConfig.database,
        port: poolConfig.port
    });
}

const pool = new Pool(poolConfig);

async function testConnection() {
    console.log('\nTentative de connexion...');
    try {
        const start = Date.now();
        const res = await pool.query('SELECT NOW()');
        const duration = Date.now() - start;
        console.log('✅ SUCCÈS ! Connexion établie en', duration, 'ms');
        console.log('Heure du serveur DB:', res.rows[0].now);

        // Vérifier les tables
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('\nTables trouvées:', tables.rows.map(r => r.table_name).join(', '));

        process.exit(0);
    } catch (err) {
        console.error('\n❌ ERREUR DE CONNEXION :');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.error('\nCONSEIL :');
        if (err.code === '28P01') console.log('Vérifiez votre MOT DE PASSE dans DATABASE_URL.');
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') console.log('Vérifiez l\'HÔTE (URL) de votre base de données.');
        if (!process.env.DATABASE_URL) console.log('DATABASE_URL n\'est pas définie. Le serveur essaie de se connecter en local (localhost).');

        process.exit(1);
    }
}

testConnection();
