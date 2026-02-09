require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🔍 Test de configuration Cloudinary...');

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log(`☁️  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`🔑 API Key: ${process.env.CLOUDINARY_API_KEY ? '******' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'Non définie'}`);

// Test de connexion (ping)
cloudinary.api.ping()
    .then(result => {
        console.log('\n✅ Connexion réussie !');
        console.log('Status:', result);
        console.log('\n🎉 Tout est prêt ! Vous pouvez redémarrer votre serveur.');
    })
    .catch(error => {
        console.error('\n❌ Échec de la connexion :');
        console.error(error.message);
        console.log('\nVérifiez vos identifiants dans le fichier .env');
    });
