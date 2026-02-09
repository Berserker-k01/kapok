require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Test de connexion Base de Données...');
console.log('----------------------------------------');
console.log(`📡 Hôte : ${process.env.DB_HOST}`);
console.log(`👤 Utilisateur : ${process.env.DB_USER}`);
console.log(`🗄️  Base de données : ${process.env.DB_NAME}`);
console.log(`🔌 Port : ${process.env.DB_PORT}`);
console.log('----------------------------------------');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.connect()
    .then(client => {
        console.log('✅ Connexion à la base de données RÉUSSIE !');
        return client.query('SELECT NOW()')
            .then(res => {
                console.log('🕒 Heure du serveur DB :', res.rows[0].now);
                client.release();
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ Erreur lors de la requête :', err);
                client.release();
                process.exit(1);
            });
    })
    .catch(err => {
        console.error('❌ ÉCHEC de la connexion :');
        console.error(err.message);
        console.log('\n💡 Conseils :');
        console.log('1. Vérifiez que votre serveur de base de données est bien lancé.');
        console.log('2. Vérifiez que les identifiants dans .env sont corrects.');
        console.log('3. Si vous utilisez Docker, vérifiez que le conteneur db tourne.');
        process.exit(1);
    });
