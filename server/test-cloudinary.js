require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('--- Testing Cloudinary Configuration ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '******' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '******' : 'MISSING');

if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name_here') {
    console.error('❌ ERREUR: Cloudinary n\'est pas configuré dans .env');
    console.log('Veuillez ouvrir server/.env et mettre vos vraies informations Cloudinary.');
    process.exit(1);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('\n--- Tentative de connexion... ---');

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('❌ Échec de la connexion:', error.message);
        console.error('Détails:', error);
    } else {
        console.log('✅ Connexion réussie ! Status:', result.status);
    }
});
