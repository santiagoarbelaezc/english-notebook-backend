const Achievement = require('../models/Achievement');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Obtener todos los logros del usuario
exports.getAllAchievements = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, search } = req.query;

    const filter = { user: userId };

    if (type) {
      const validTypes = ['vocabulary', 'grammar', 'conversation', 'reading', 'milestone', 'streak', 'custom'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de logro inválido', 400);
        return next(error);
      }
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const achievements = await Achievement.find(filter).sort({ unlockedDate: -1 });

    res.status(200).json({
      success: true,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo logros: ${error.message}`);
    next(error);
  }
};

// Crear nuevo logro
exports.createAchievement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, type, icon, details, progress, points, notes } = req.body;

    // Validaciones
    if (!title) {
      const error = new AppError('El título es requerido', 400);
      return next(error);
    }

    if (!type) {
      const error = new AppError('El tipo de logro es requerido', 400);
      return next(error);
    }

    const validTypes = ['vocabulary', 'grammar', 'conversation', 'reading', 'milestone', 'streak', 'custom'];
    if (!validTypes.includes(type)) {
      const error = new AppError('Tipo de logro inválido', 400);
      return next(error);
    }

    // Crear logro
    const achievement = await Achievement.create({
      user: userId,
      title: title.trim(),
      description: description || '',
      type,
      icon: icon || '🏆',
      details: details || {},
      progress: progress || 100,
      points: points || 0,
      notes: notes || ''
    });

    logger.info(`✅ Logro creado: ${title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Logro creado exitosamente',
      achievement
    });
  } catch (error) {
    logger.error(`❌ Error creando logro: ${error.message}`);
    next(error);
  }
};

// Obtener un logro específico
exports.getAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const achievement = await Achievement.findOne({ _id: id, user: userId });

    if (!achievement) {
      const error = new AppError('Logro no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      achievement
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo logro: ${error.message}`);
    next(error);
  }
};

// Actualizar logro
exports.updateAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, icon, details, progress, points, notes } = req.body;

    const achievement = await Achievement.findOne({ _id: id, user: userId });

    if (!achievement) {
      const error = new AppError('Logro no encontrado', 404);
      return next(error);
    }

    // Validar progreso si se proporciona
    if (progress !== undefined) {
      if (progress < 0 || progress > 100) {
        const error = new AppError('El progreso debe estar entre 0 y 100', 400);
        return next(error);
      }
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (details) updateData.details = details;
    if (progress !== undefined) updateData.progress = progress;
    if (points !== undefined) updateData.points = points;
    if (notes !== undefined) updateData.notes = notes;

    const updatedAchievement = await Achievement.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Logro actualizado: ${updatedAchievement.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Logro actualizado exitosamente',
      achievement: updatedAchievement
    });
  } catch (error) {
    logger.error(`❌ Error actualizando logro: ${error.message}`);
    next(error);
  }
};

// Eliminar logro
exports.deleteAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const achievement = await Achievement.findOneAndDelete({ _id: id, user: userId });

    if (!achievement) {
      const error = new AppError('Logro no encontrado', 404);
      return next(error);
    }

    logger.info(`✅ Logro eliminado: ${achievement.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Logro eliminado exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando logro: ${error.message}`);
    next(error);
  }
};

// Obtener logros por tipo
exports.getByType = async (req, res, next) => {
  try {
    const { achievementType } = req.params;
    const userId = req.user.id;

    const validTypes = ['vocabulary', 'grammar', 'conversation', 'reading', 'milestone', 'streak', 'custom'];
    if (!validTypes.includes(achievementType)) {
      const error = new AppError('Tipo de logro inválido', 400);
      return next(error);
    }

    const achievements = await Achievement.find({ user: userId, type: achievementType }).sort({ unlockedDate: -1 });

    res.status(200).json({
      success: true,
      type: achievementType,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo logros por tipo: ${error.message}`);
    next(error);
  }
};

// Actualizar progreso del logro
exports.updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { progress } = req.body;

    if (progress === undefined) {
      const error = new AppError('El progreso es requerido', 400);
      return next(error);
    }

    if (progress < 0 || progress > 100) {
      const error = new AppError('El progreso debe estar entre 0 y 100', 400);
      return next(error);
    }

    const achievement = await Achievement.findOne({ _id: id, user: userId });

    if (!achievement) {
      const error = new AppError('Logro no encontrado', 404);
      return next(error);
    }

    achievement.progress = progress;
    await achievement.save();

    logger.info(`✅ Progreso actualizado: ${achievement.title} (${progress}%) por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Progreso actualizado exitosamente',
      achievement
    });
  } catch (error) {
    logger.error(`❌ Error actualizando progreso: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de logros
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalAchievements = await Achievement.countDocuments({ user: userId });
    const totalPoints = await Achievement.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    // Contar por tipo
    const byType = await Achievement.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Promedio de progreso
    const avgProgress = await Achievement.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, average: { $avg: '$progress' } } }
    ]);

    // Logros completados (progreso = 100)
    const completedAchievements = await Achievement.countDocuments({ user: userId, progress: 100 });

    res.status(200).json({
      success: true,
      stats: {
        totalAchievements,
        completedAchievements,
        totalPoints: totalPoints[0]?.total || 0,
        averageProgress: avgProgress[0]?.average?.toFixed(2) || 0,
        byType
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Obtener logros cercanos a completar (progreso > 50)
exports.getInProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const achievements = await Achievement.find({
      user: userId,
      progress: { $gt: 0, $lt: 100 }
    }).sort({ progress: -1 });

    res.status(200).json({
      success: true,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo logros en progreso: ${error.message}`);
    next(error);
  }
};
