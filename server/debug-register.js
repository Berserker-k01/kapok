const db = require('./src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function testRegister() {
    console.log('--- DÉBUT DU TEST D\'INSCRIPTION ---');

    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    try {
        console.log('1. Vérification email...');
        const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        console.log('   Résultat SELECT email:', existingUser);

        if (existingUser.rows && existingUser.rows.length > 0) {
            console.log('   L\'utilisateur existe déjà (Erreur inattendue pour un email random)');
            return;
        }

        console.log('2. Hachage mot de passe...');
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('   Mot de passe haché OK');

        const userId = uuidv4();
        console.log('   Generated UUID:', userId);

        const insertQuery = `
      INSERT INTO users (id, name, email, password, role, status, created_at)
      VALUES (?, ?, ?, ?, 'user', 'active', NOW())
    `;

        console.log('3. Tentative INSERT...');
        await db.query(insertQuery, [userId, name, email, hashedPassword]);
        console.log('   INSERT terminé sans erreur');

        console.log('4. Tentative SELECT après insert...');
        const selectQuery = 'SELECT id, name, email FROM users WHERE id = ?';
        const result = await db.query(selectQuery, [userId]);
        console.log('   Résultat SELECT final:', result);

        if (result.rows && result.rows.length > 0) {
            console.log('✅ SUCCÈS : Utilisateur créé et retrouvé !');
        } else {
            console.log('❌ ÉCHEC : Utilisateur non trouvé après insertion.');
        }

    } catch (error) {
        console.error('❌ ERREUR CRITIQUE :', error);
    } finally {
        console.log('--- FIN DU TEST ---');
        process.exit(0);
    }
}

testRegister();
