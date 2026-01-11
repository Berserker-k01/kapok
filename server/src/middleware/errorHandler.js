const AppError = require('../utils/AppError');

const handleDBError = err => {
    // Erreurs PostgreSQL communes (Codes d'état SQL)
    // https://www.postgresql.org/docs/current/errcodes-appendix.html

    if (err.code === '23505' || err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        // MySQL donne souvent le message dans err.sqlMessage
        const value = err.detail ? err.detail : 'inconnue';
        return new AppError(`Une entrée existe déjà (Doublon).`, 400);
    }

    if (err.code === '28P01' || err.code === '28000' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        return new AppError('Erreur d\'authentification à la base de données.', 500);
    }

    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        return new AppError('Impossible de se connecter à la base de données.', 500);
    }

    if (err.code === '3D000' || err.code === 'ER_BAD_DB_ERROR') {
        return new AppError('La base de données spécifiée n\'existe pas.', 500);
    }

    // Erreurs de schéma ou de colonnes (souvent pendant le dev/migration)
    if (err.code === '42P01') {
        return new AppError(`Erreur technique : La table "${err.table || 'données'}" est introuvable. Avez-vous exécuté le script SQL sur Supabase ?`, 500);
    }

    if (err.code === '42703') {
        return new AppError('Erreur technique : Une colonne est manquante dans la base de données. Vérifiez vos migrations.', 500);
    }

    // Message par défaut pour les erreurs DB non gérées
    return new AppError(`Erreur de base de données (Code ${err.code || '???'}) : ${err.message}`, 500);
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }
    // Programming or other unknown error
    else {
        console.error('ERROR 💥', err);
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
            stack: err.stack
        });
    } else {
        let error = { ...err };
        error.message = err.message;

        // Gérer les erreurs de base de données (pg)
        if (err.code || err.severity) {
            error = handleDBError(err);
        }

        sendErrorProd(error, res);
    }
};
