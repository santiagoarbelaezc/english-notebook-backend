const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { updateLoginStreak, initializeAchievements } = require('../utils/achievementHelper');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Registrar nuevo usuario
exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password, passwordConfirm, englishLevel } = req.body;

    // Validaciones básicas
    if (!name || !username || !email || !password || !passwordConfirm) {
      const error = new AppError('Por favor proporciona todos los campos requeridos', 400);
      return next(error);
    }

    if (password !== passwordConfirm) {
      const error = new AppError('Las contraseñas no coinciden', 400);
      return next(error);
    }

    if (password.length < 6) {
      const error = new AppError('La contraseña debe tener al menos 6 caracteres', 400);
      return next(error);
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      const error = new AppError('El email o nombre de usuario ya está registrado', 400);
      return next(error);
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      name,
      username,
      email,
      password,
      passwordConfirm,
      englishLevel: englishLevel || 'A1'
    });

    // Crear perfil asociado
    await Profile.create({
      user: newUser._id
    });

    // Inicializar logros para el nuevo usuario
    await initializeAchievements(newUser._id);

    // Generar token
    const token = generateToken(newUser._id);

    logger.info(`✅ Usuario registrado: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        englishLevel: newUser.englishLevel
      }
    });
  } catch (error) {
    logger.error(`❌ Error en registro: ${error.message}`);
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      const error = new AppError('Por favor proporciona email y contraseña', 400);
      return next(error);
    }

    // Buscar usuario y seleccionar contraseña
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new AppError('Email o contraseña incorrectos', 401);
      return next(error);
    }

    // Comparar contraseñas
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      const error = new AppError('Email o contraseña incorrectos', 401);
      return next(error);
    }

    if (!user.isActive) {
      const error = new AppError('Tu cuenta ha sido desactivada', 403);
      return next(error);
    }

    // Generar token
    const token = generateToken(user._id);

    // Actualizar racha de login y verificar logros de racha
    const streakResult = await updateLoginStreak(user._id);

    logger.info(`✅ Usuario logueado: ${user.username}`);

    res.status(200).json({
      success: true,
      message: 'Sesión iniciada exitosamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        englishLevel: user.englishLevel
      },
      streak: {
        currentStreak: streakResult.streakDays,
        longestStreak: streakResult.longestStreak,
        newAchievements: streakResult.newAchievements
      }
    });
  } catch (error) {
    logger.error(`❌ Error en login: ${error.message}`);
    next(error);
  }
};

// Obtener usuario actual
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('profile');

    if (!user) {
      const error = new AppError('Usuario no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo usuario: ${error.message}`);
    next(error);
  }
};

// Logout (limpiar token en frontend)
exports.logout = async (req, res, next) => {
  try {
    logger.info(`✅ Usuario deslogueado: ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error en logout: ${error.message}`);
    next(error);
  }
};

// Verificar token
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      const error = new AppError('No se proporcionó token', 401);
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new AppError('Usuario no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logger.error(`❌ Error verificando token: ${error.message}`);

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado', 401));
    }

    next(error);
  }
};
