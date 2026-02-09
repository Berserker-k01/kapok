const fs = require('fs');
const path = require('path');

// Script de diagnostic pour vérifier le stockage des images

console.log('=== DIAGNOSTIC STOCKAGE IMAGES ===\n');

// 1. Vérifier le dossier uploads
const uploadsDir = path.join(__dirname, 'uploads');
console.log('1. Dossier uploads:');
console.log(`   Chemin: ${uploadsDir}`);
console.log(`   Existe: ${fs.existsSync(uploadsDir)}`);

if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`   Nombre de fichiers: ${files.length}`);
    if (files.length > 0) {
        console.log('   Fichiers:');
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            console.log(`     - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
    } else {
        console.log('   ⚠️  Aucun fichier trouvé');
    }
} else {
    console.log('   ❌ Le dossier n\'existe pas!');
}

// 2. Vérifier les permissions
console.log('\n2. Permissions:');
try {
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log('   ✅ Écriture autorisée');
} catch (err) {
    console.log('   ❌ Pas de permission d\'écriture!');
    console.log(`   Erreur: ${err.message}`);
}

// 3. Vérifier l'environnement
console.log('\n3. Environnement:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`);
console.log(`   API_URL: ${process.env.API_URL || 'non défini'}`);
console.log(`   Plateforme: ${process.platform}`);
console.log(`   CWD: ${process.cwd()}`);

// 4. Tester la création d'un fichier
console.log('\n4. Test d\'écriture:');
const testFile = path.join(uploadsDir, 'test-' + Date.now() + '.txt');
try {
    fs.writeFileSync(testFile, 'Test de persistance');
    console.log('   ✅ Fichier test créé');

    // Vérifier qu'on peut le lire
    const content = fs.readFileSync(testFile, 'utf8');
    console.log('   ✅ Fichier test lu');

    // Supprimer le fichier test
    fs.unlinkSync(testFile);
    console.log('   ✅ Fichier test supprimé');
} catch (err) {
    console.log('   ❌ Erreur lors du test d\'écriture!');
    console.log(`   Erreur: ${err.message}`);
}

// 5. Recommandations
console.log('\n=== RECOMMANDATIONS ===');
console.log('Si les images disparaissent après redémarrage:');
console.log('1. Votre hébergement utilise un système de fichiers éphémère');
console.log('2. Solutions:');
console.log('   a) Utiliser un stockage cloud (AWS S3, Cloudinary, etc.)');
console.log('   b) Utiliser un volume persistant (Docker volumes)');
console.log('   c) Utiliser un hébergement avec stockage persistant');
console.log('\nSi vous êtes sur Hostinger/cPanel:');
console.log('   - Vérifiez que le dossier uploads est bien déployé');
console.log('   - Vérifiez les permissions (755 ou 775)');
console.log('   - Vérifiez que le chemin est correct dans .env');
