const AppError = require('../utils/AppError');

const handleDBError = err => {
    // Erreurs PostgreSQL communes (Codes d'état SQL)
    // https://www.postgresql.org/docs/current/errcodes-appendix.html

    if (err.code === '23505') {
        const value = err.detail ? err.detail.match(/\((.*?)\)=\((.*?)\)/)[2] : 'inconnue';
        return new AppError(`La valeur "${value}" existe déjà. Veuillez en utiliser une autre.`, 400);
    }

    if (err.code === '28P01' || err.code === '28000') {
        return new AppError('Erreur d\'authentification à la base de données. Vérifiez votre mot de passe Supabase dans DATABASE_URL.', 500);
    }

    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === '08001' || err.code === '08004' || err.code === '08006') {
        return new AppError('Impossible de se connecter à Supabase. Vérifiez l\'URL de la base de données ou si Supabase est en ligne.', 500);
    }

    if (err.code === '3D000') {
        return new AppError('La base de données spécifiée n\'existe pas. Vérifiez le nom dans DATABASE_URL.', 500);
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
