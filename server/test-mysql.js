require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Test de connexion MySQL (Hostinger)...');
console.log('----------------------------------------');
console.log(`📡 Hôte : ${process.env.DB_HOST}`);
console.log(`👤 Utilisateur : ${process.env.DB_USER}`);
console.log(`🗄️  Base de données : ${process.env.DB_NAME}`);
console.log(`🔌 Port : ${process.env.DB_PORT || 3306}`);
console.log('----------------------------------------');

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connexion à la base MySQL RÉUSSIE !');
        const [rows] = await connection.execute('SELECT NOW() as now');
        console.log('🕒 Heure du serveur DB :', rows[0].now);

        await connection.end();
        console.log('✅ Déconnexion propre.');
        process.exit(0);
    } catch (err) {
        console.error('❌ ÉCHEC de la connexion MySQL :');
        console.error(err.message);
        console.log('\n💡 Conseils Hostinger :');
        console.log('1. Vérifiez que "Accès distant" (Remote MySQL) est activé dans le dashboard Hostinger.');
        console.log('2. Ajoutez votre IP actuelle (celle de ce PC) dans la liste blanche.');
        console.log('3. Vérifiez vos identifiants (utilisateur u123_xxx, base u123_xxx).');
        process.exit(1);
    }
})();
