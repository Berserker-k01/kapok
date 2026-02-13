const AppError = require('../utils/AppError');

const handleDBError = err => {
    // Erreurs PostgreSQL communes
    // https://www.postgresql.org/docs/current/errcodes-appendix.html

    if (err.code === '23505') {
        return new AppError('Une entrée existe déjà (Doublon).', 400);
    }

    if (err.code === '28P01' || err.code === '28000') {
        return new AppError("Erreur d'authentification à la base de données.", 500);
    }

    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        return new AppError('Impossible de se connecter à la base de données.', 500);
    }

    if (err.code === '3D000') {
        return new AppError("La base de données spécifiée n'existe pas.", 500);
    }

    if (err.code === '42P01') {
        return new AppError(`Erreur technique : Table introuvable. Vérifiez que le schéma SQL a été exécuté.`, 500);
    }

    if (err.code === '42703') {
        return new AppError('Erreur technique : Colonne manquante. Vérifiez vos migrations.', 500);
    }

    return new AppError(`Erreur de base de données (Code ${err.code || '???'}) : ${err.message}`, 500);
};

const sendErrorProd = (err, res) => {
    console.error('ERROR 💥', err);

    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    } else {
        res.status(500).json({
            success: false,
            error: `Une erreur système est survenue : ${err.message}`
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            stack: err.stack,
            code: err.code
        });
    } else {
        let error = { ...err };
        error.message = err.message;

        // Gérer les erreurs PostgreSQL
        if (err.code || err.severity) {
            error = handleDBError(err);
        }

        sendErrorProd(error, res);
    }
};
