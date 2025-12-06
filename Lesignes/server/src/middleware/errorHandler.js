const AppError = require('../utils/AppError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    // Regex pour extraire la valeur entre guillemets si possible, sinon message générique
    const value = err.detail ? err.detail.match(/(["'])(\\?.)*?\1/)[0] : 'Duplicate field';
    const message = `Valeur en doublon : ${value}. Veuillez utiliser une autre valeur.`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue, veuillez réessayer plus tard.'
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        if (error.code === '23505') error = handleDuplicateFieldsDB(error); // Code PostgreSQL pour duplicate key
        if (error.name === 'CastError') error = handleCastErrorDB(error);

        sendErrorProd(error, res);
    }
};
