const User = require('../models/User');
const Profile = require('../models/Profile');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Actualizar datos del usuario
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, englishLevel } = req.body;
    const userId = req.user.id;

    // Validar campos
    if (!name && !email && !englishLevel) {
      const error = new AppError('Debes proporcionar al menos un campo para actualizar', 400);
      return next(error);
    }

    // Objeto con campos a actualizar
    const updateData = {};

    if (name) {
      if (name.length < 2) {
        const error = new AppError('El nombre debe tener al menos 2 caracteres', 400);
        return next(error);
      }
      updateData.name = name.trim();
    }

    if (email) {
      // Verificar que el email sea válido
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        const error = new AppError('Email inválido', 400);
        return next(error);
      }

      // Verificar que el email no esté en uso
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        const error = new AppError('Este email ya está registrado', 400);
        return next(error);
      }

      updateData.email = email.toLowerCase();
    }

    if (englishLevel) {
      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validLevels.includes(englishLevel)) {
        const error = new AppError('Nivel de inglés inválido. Valores válidos: A1, A2, B1, B2, C1, C2', 400);
        return next(error);
      }
      updateData.englishLevel = englishLevel;
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate('profile');

    logger.info(`✅ Perfil actualizado: ${updatedUser.username}`);

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    logger.error(`❌ Error actualizando perfil: ${error.message}`);
    next(error);
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      const error = new AppError('Por favor proporciona todos los campos', 400);
      return next(error);
    }

    if (newPassword.length < 6) {
      const error = new AppError('La nueva contraseña debe tener al menos 6 caracteres', 400);
      return next(error);
    }

    if (newPassword !== confirmPassword) {
      const error = new AppError('Las contraseñas no coinciden', 400);
      return next(error);
    }

    if (currentPassword === newPassword) {
      const error = new AppError('La nueva contraseña debe ser diferente a la actual', 400);
      return next(error);
    }

    // Obtener usuario con contraseña
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error = new AppError('Usuario no encontrado', 404);
      return next(error);
    }

    // Verificar contraseña actual
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      const error = new AppError('La contraseña actual es incorrecta', 401);
      return next(error);
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.passwordConfirm = confirmPassword;
    await user.save();

    logger.info(`✅ Contraseña actualizada: ${user.username}`);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error cambiando contraseña: ${error.message}`);
    next(error);
  }
};

// Eliminar cuenta
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    // Validar contraseña
    if (!password) {
      const error = new AppError('Por favor proporciona tu contraseña para confirmar', 400);
      return next(error);
    }

    // Obtener usuario con contraseña
    const user = await User.findById(userId).select('+password');

    if (!user) {
      const error = new AppError('Usuario no encontrado', 404);
      return next(error);
    }

    // Verificar contraseña
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      const error = new AppError('Contraseña incorrecta', 401);
      return next(error);
    }

    // Eliminar perfil asociado
    await Profile.findOneAndDelete({ user: userId });

    // Eliminar usuario
    await User.findByIdAndDelete(userId);

    logger.info(`✅ Cuenta eliminada: ${user.username}`);

    res.status(200).json({
      success: true,
      message: 'Tu cuenta ha sido eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando cuenta: ${error.message}`);
    next(error);
  }
};

// Obtener datos del usuario (sin protección extra, solo para verificar)
exports.getUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('profile')
      .select('-password -passwordConfirm');

    if (!user) {
      const error = new AppError('Usuario no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo datos del usuario: ${error.message}`);
    next(error);
  }
};
