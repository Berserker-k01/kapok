// Test de connexion MySQL DIRECT (sans .env, sans rien)
// Ce script teste la connexion avec les identifiants en dur

const mysql = require('mysql2/promise');

console.log('🔍 TEST DE CONNEXION MYSQL DIRECT');
console.log('=====================================\n');

// Configuration EXACTE Hostinger (en dur)
const configs = [
    {
        name: 'Config 1: localhost',
        host: 'localhost',
        user: 'u980915146_admin',
        password: 'Daniel2005k@ssi',
        database: 'u980915146_assimedb',
        port: 3306
    },
    {
        name: 'Config 2: 127.0.0.1',
        host: '127.0.0.1',
        user: 'u980915146_admin',
        password: 'Daniel2005k@ssi',
        database: 'u980915146_assimedb',
        port: 3306
    }
];

async function testConnection(config) {
    console.log(`\n📡 Test: ${config.name}`);
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Password length: ${config.password.length} chars\n`);

    try {
        const connection = await mysql.createConnection(config);
        console.log('   ✅ CONNEXION RÉUSSIE !');

        // Test d'une requête simple
        const [rows] = await connection.execute('SELECT NOW() as now, DATABASE() as db, USER() as user');
        console.log('   ✅ REQUÊTE RÉUSSIE !');
        console.log('   📊 Résultat:');
        console.log('      - Heure serveur:', rows[0].now);
        console.log('      - Base active:', rows[0].db);
        console.log('      - Utilisateur:', rows[0].user);

        // Test de la table users
        try {
            const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
            console.log('   ✅ Table "users" accessible !');
            console.log('      - Nombre d\'utilisateurs:', users[0].count);
        } catch (err) {
            console.log('   ⚠️  Table "users" non accessible:', err.message);
        }

        await connection.end();
        console.log('   ✅ Déconnexion propre\n');
        return true;

    } catch (error) {
        console.log('   ❌ ÉCHEC DE CONNEXION');
        console.log('   📛 Code erreur:', error.code);
        console.log('   📛 Message:', error.message);
        console.log('   📛 Errno:', error.errno);

        // Diagnostic détaillé selon le type d'erreur
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n   💡 DIAGNOSTIC: Accès refusé');
            console.log('      - Le mot de passe ou l\'utilisateur est incorrect');
            console.log('      - OU l\'utilisateur n\'a pas les droits sur cette base');
            console.log('      - OU l\'hôte n\'est pas autorisé pour cet utilisateur');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n   💡 DIAGNOSTIC: Connexion refusée');
            console.log('      - Le serveur MySQL n\'est pas accessible sur ce host:port');
            console.log('      - Vérifiez que MySQL tourne bien');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n   💡 DIAGNOSTIC: Base de données introuvable');
            console.log('      - La base "u980915146_assimedb" n\'existe pas');
            console.log('      - Vérifiez le nom exact dans le panel Hostinger');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n   💡 DIAGNOSTIC: Timeout');
            console.log('      - Le serveur ne répond pas (firewall, réseau)');
        }

        console.log('');
        return false;
    }
}

(async () => {
    console.log('🎯 Objectif: Trouver la bonne configuration MySQL\n');

    let success = false;
    for (const config of configs) {
        const result = await testConnection(config);
        if (result) {
            success = true;
            console.log('🎉 CONFIGURATION FONCTIONNELLE TROUVÉE !');
            console.log(`   Utilisez: host="${config.host}"\n`);
            break;
        }
    }

    if (!success) {
        console.log('❌ AUCUNE CONFIGURATION N\'A FONCTIONNÉ\n');
        console.log('📋 ACTIONS À FAIRE:');
        console.log('   1. Connectez-vous au panel Hostinger');
        console.log('   2. Allez dans "Bases de données MySQL"');
        console.log('   3. Vérifiez:');
        console.log('      - Le nom exact de la base de données');
        console.log('      - Le nom d\'utilisateur exact');
        console.log('      - Que l\'utilisateur a bien accès à cette base');
        console.log('   4. Si besoin, réinitialisez le mot de passe');
        console.log('   5. Vérifiez que "Accès distant" est activé si vous testez depuis votre PC\n');
    }

    process.exit(success ? 0 : 1);
})();
