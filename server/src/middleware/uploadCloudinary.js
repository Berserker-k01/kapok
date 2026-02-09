const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('[Cloudinary] Configuration loaded');
console.log('[Cloudinary] Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('[Cloudinary] API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('[Cloudinary] API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Stockage en mémoire temporaire avant upload vers Cloudinary
const storage = multer.memoryStorage();

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

// Fonction helper pour uploader vers Cloudinary
const uploadToCloudinary = (buffer, originalname, folder = 'e-assime') => {
    return new Promise((resolve, reject) => {
        const filename = `${Date.now()}-${uuidv4()}${path.extname(originalname)}`;

        console.log('[Cloudinary] Uploading:', filename);

        // Upload vers Cloudinary via stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                public_id: filename,
                resource_type: 'image',
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' } // Optimisation automatique
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary] ❌ Upload failed:', error);
                    reject(error);
                } else {
                    console.log('[Cloudinary] ✅ Upload successful');
                    console.log('[Cloudinary]    URL:', result.secure_url);
                    console.log('[Cloudinary]    Size:', (result.bytes / 1024).toFixed(2), 'KB');
                    resolve(result);
                }
            }
        );

        uploadStream.end(buffer);
    });
};

// Middleware pour gérer l'upload Cloudinary après Multer
const cloudinaryMiddleware = (fieldName) => {
    return [
        upload.single(fieldName),
        async (req, res, next) => {
            try {
                if (!req.file) {
                    console.log('[Cloudinary] No file to upload');
                    return next();
                }

                console.log('[Cloudinary] Processing file:', req.file.originalname);

                // Upload vers Cloudinary
                const result = await uploadToCloudinary(
                    req.file.buffer,
                    req.file.originalname,
                    'e-assime/products'
                );

                // Ajouter l'URL Cloudinary à la requête
                req.cloudinaryResult = result;
                req.file.cloudinaryUrl = result.secure_url;
                req.file.cloudinaryPublicId = result.public_id;

                console.log('[Cloudinary] ✅ File ready:', result.secure_url);
                next();
            } catch (error) {
                console.error('[Cloudinary] ❌ Error:', error);
                next(error);
            }
        }
    ];
};

// Middleware pour gérer plusieurs fichiers (logos, bannières, etc.)
const cloudinaryMultipleMiddleware = (fields) => {
    return [
        upload.fields(fields),
        async (req, res, next) => {
            try {
                if (!req.files || Object.keys(req.files).length === 0) {
                    console.log('[Cloudinary] No files to upload');
                    return next();
                }

                console.log('[Cloudinary] Processing multiple files...');

                // Uploader chaque fichier vers Cloudinary
                for (const fieldName in req.files) {
                    const files = req.files[fieldName];

                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        console.log('[Cloudinary] Processing:', fieldName, '-', file.originalname);

                        const result = await uploadToCloudinary(
                            file.buffer,
                            file.originalname,
                            `e-assime/${fieldName}`
                        );

                        // Ajouter les infos Cloudinary
                        file.cloudinaryUrl = result.secure_url;
                        file.cloudinaryPublicId = result.public_id;
                    }
                }

                console.log('[Cloudinary] ✅ All files uploaded');
                next();
            } catch (error) {
                console.error('[Cloudinary] ❌ Error:', error);
                next(error);
            }
        }
    ];
};

// Fonction pour supprimer une image de Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        console.log('[Cloudinary] Deleting:', publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('[Cloudinary] ✅ Deleted:', result);
        return result;
    } catch (error) {
        console.error('[Cloudinary] ❌ Delete failed:', error);
        throw error;
    }
};

module.exports = {
    upload,
    cloudinaryMiddleware,
    cloudinaryMultipleMiddleware,
    uploadToCloudinary,
    deleteFromCloudinary,
    cloudinary
};
