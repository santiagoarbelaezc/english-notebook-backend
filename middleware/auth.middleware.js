const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./error.middleware');
const logger = require('../utils/logger');

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Por favor inicia sesión para acceder a este recurso', 401));
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('El usuario perteneciente a este token ya no existe', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Tu cuenta ha sido desactivada', 403));
    }

    // Pasar usuario al siguiente middleware
    req.user = user;
    next();
  } catch (error) {
    logger.error(`❌ Error en protección de ruta: ${error.message}`);

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Tu sesión ha expirado. Por favor inicia sesión de nuevo', 401));
    }

    next(error);
  }
};

// Middleware para permitir solo propietario del recurso
exports.ownerOnly = (req, res, next) => {
  if (req.params.userId && req.user._id.toString() !== req.params.userId) {
    return next(new AppError('No tienes permiso para acceder a este recurso', 403));
  }
  next();
};

// Middleware para permitir solo usuarios activos
exports.activeUsersOnly = (req, res, next) => {
  if (!req.user.isActive) {
    return next(new AppError('Tu cuenta ha sido desactivada', 403));
  }
  next();
};
