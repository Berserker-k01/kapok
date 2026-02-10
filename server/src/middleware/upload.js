const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
// Utiliser UPLOAD_PATH du .env si défini, sinon uploads à la racine du projet
const UPLOAD_ROOT = process.env.UPLOAD_PATH
    ? path.resolve(process.env.UPLOAD_PATH)
    : path.join(process.cwd(), 'uploads');

console.log('[Upload] 📂 Configuration du stockage local:', UPLOAD_ROOT);

// S'assurer que le dossier existe
if (!fs.existsSync(UPLOAD_ROOT)) {
    console.log('[Upload] 🛠️ Création du dossier uploads...');
    try {
        fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
        console.log('[Upload] ✅ Dossier créé avec succès');

        // Créer un fichier .gitkeep pour git
        fs.writeFileSync(path.join(UPLOAD_ROOT, '.gitkeep'), '');
    } catch (err) {
        console.error('[Upload] ❌ Erreur création dossier:', err);
    }
}

// Vérifier les permissions en écriture
try {
    fs.accessSync(UPLOAD_ROOT, fs.constants.W_OK);
    console.log('[Upload] ✅ Dossier accessible en écriture');
} catch (err) {
    console.error('[Upload] ❌ Dossier NON accessible en écriture:', err);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Double vérification au moment de l'upload
        if (!fs.existsSync(UPLOAD_ROOT)) {
            fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
        }
        cb(null, UPLOAD_ROOT);
    },
    filename: (req, file, cb) => {
        // Nom unique: timestamp-uuid.ext
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const ext = path.extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;

        console.log(`[Upload] 💾 Enregistrement fichier: ${filename}`);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté (images uniquement)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limite
        files: 5
    }
});

module.exports = upload;
