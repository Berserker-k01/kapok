require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('--- DIAGNOSTIC BASE DE DONNÉES MYSQL ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL présente:', process.env.DATABASE_URL ? 'OUI (Masquée pour sécurité)' : 'NON');

const poolConfig = process.env.DATABASE_URL
    ? {
        uri: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lesigne_db',
        port: parseInt(process.env.DB_PORT || '3306')
    };

if (!process.env.DATABASE_URL) {
    console.log('Détails Config (sans DATABASE_URL):', {
        host: poolConfig.host,
        user: poolConfig.user,
        database: poolConfig.database,
        port: poolConfig.port
    });
}

async function testConnection() {
    console.log('\nTentative de connexion...');
    let connection;
    try {
        connection = await mysql.createConnection(poolConfig);
        const start = Date.now();
        const [rows] = await connection.execute('SELECT NOW() as now');
        const duration = Date.now() - start;
        console.log('✅ SUCCÈS ! Connexion établie en', duration, 'ms');
        console.log('Heure du serveur DB:', rows[0].now);

        // Vérifier les tables
        const [tables] = await connection.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [poolConfig.database || process.env.DB_NAME]);
        console.log('\nTables trouvées:', tables.map(r => r.table_name).join(', '));

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ ERREUR DE CONNEXION :');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.error('\nCONSEIL :');
        if (err.code === 'ER_ACCESS_DENIED_ERROR') console.log('Vérifiez votre MOT DE PASSE ou USERNAME.');
        if (err.code === 'ER_BAD_DB_ERROR') console.log('La base de données n\'existe pas. Créez-la d\'abord.');
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') console.log('Vérifiez l\'HÔTE et le PORT de votre base de données.');
        if (!process.env.DATABASE_URL) console.log('DATABASE_URL n\'est pas définie. Le serveur essaie de se connecter en local (localhost:3306).');

        if (connection) await connection.end();
        process.exit(1);
    }
}

testConnection();


