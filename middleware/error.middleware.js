const logger = require('../utils/logger');
const constants = require('../config/constants');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log del error
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Error de desarrollo: enviar detalles
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Error de producción
  const errorResponse = {
    success: false,
    message: err.isOperational ? err.message : constants.ERROR_MESSAGES.SERVER_ERROR
  };

  // Validación de Mongoose
  if (err.name === 'ValidationError') {
    errorResponse.message = 'Error de validación';
    errorResponse.errors = Object.values(err.errors).map(el => el.message);
    err.statusCode = 400;
  }

  // Duplicado de MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    errorResponse.message = `El ${field} '${err.keyValue[field]}' ya está registrado`;
    err.statusCode = 400;
  }

  // Token JWT inválido
  if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Token inválido';
    err.statusCode = 401;
  }

  // Token JWT expirado
  if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expirado';
    err.statusCode = 401;
  }

  res.status(err.statusCode).json(errorResponse);
};

module.exports = {
  errorHandler,
  AppError
};