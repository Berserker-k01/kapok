const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists and is writable
const uploadDir = path.join(__dirname, '../../uploads');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    console.log('[Upload] Creating uploads directory:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Verify write permissions
try {
    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log('[Upload] ✅ Uploads directory is writable:', uploadDir);
} catch (err) {
    console.error('[Upload] ❌ Uploads directory is NOT writable!');
    console.error('[Upload] Error:', err.message);
    console.error('[Upload] Path:', uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('[Upload] Saving file to:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
        console.log('[Upload] Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('[Upload] File received:', file.originalname, 'Type:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.error('[Upload] ❌ Invalid file type:', file.mimetype);
        cb(new Error('Format de fichier non supporté (Images uniquement)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Log upload errors
upload.onError = (err) => {
    console.error('[Upload] ❌ Upload error:', err);
};

module.exports = upload;
