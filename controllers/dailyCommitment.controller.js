const DailyCommitment = require('../models/DailyCommitment');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Obtener todos los compromisos del usuario
exports.getAllCommitments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, status, frequency, search } = req.query;

    const filter = { user: userId };

    if (type) {
      const validTypes = ['learn-words', 'study-grammar', 'practice-conversation', 'read-text', 'listen-song', 'custom'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de compromiso inválido', 400);
        return next(error);
      }
      filter.type = type;
    }

    if (status) {
      const validStatus = ['pending', 'in-progress', 'completed'];
      if (!validStatus.includes(status)) {
        const error = new AppError('Estado inválido', 400);
        return next(error);
      }
      filter.status = status;
    }

    if (frequency) {
      const validFrequency = ['daily', 'weekly', 'monthly'];
      if (!validFrequency.includes(frequency)) {
        const error = new AppError('Frecuencia inválida', 400);
        return next(error);
      }
      filter.frequency = frequency;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const commitments = await DailyCommitment.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: commitments.length,
      commitments
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo compromisos: ${error.message}`);
    next(error);
  }
};

// Crear nuevo compromiso
exports.createCommitment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, type, goal, reminder, frequency, endDate, notes } = req.body;

    // Validaciones
    if (!title) {
      const error = new AppError('El título es requerido', 400);
      return next(error);
    }

    if (!type) {
      const error = new AppError('El tipo de compromiso es requerido', 400);
      return next(error);
    }

    const validTypes = ['learn-words', 'study-grammar', 'practice-conversation', 'read-text', 'listen-song', 'custom'];
    if (!validTypes.includes(type)) {
      const error = new AppError('Tipo de compromiso inválido', 400);
      return next(error);
    }

    if (!goal || !goal.value || !goal.unit) {
      const error = new AppError('El objetivo (value y unit) es requerido', 400);
      return next(error);
    }

    const validUnits = ['palabras', 'minutos', 'reglas', 'oraciones', 'líneas', 'custom'];
    if (!validUnits.includes(goal.unit)) {
      const error = new AppError('Unidad de objetivo inválida', 400);
      return next(error);
    }

    // Crear compromiso
    const commitment = await DailyCommitment.create({
      user: userId,
      title: title.trim(),
      description: description || '',
      type,
      goal: {
        value: goal.value,
        unit: goal.unit
      },
      reminder: reminder || { enabled: true },
      frequency: frequency || 'daily',
      endDate: endDate || null,
      notes: notes || ''
    });

    logger.info(`✅ Compromiso creado: ${title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Compromiso creado exitosamente',
      commitment
    });
  } catch (error) {
    logger.error(`❌ Error creando compromiso: ${error.message}`);
    next(error);
  }
};

// Obtener un compromiso específico
exports.getCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const commitment = await DailyCommitment.findOne({ _id: id, user: userId });

    if (!commitment) {
      const error = new AppError('Compromiso no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      commitment
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo compromiso: ${error.message}`);
    next(error);
  }
};

// Actualizar compromiso
exports.updateCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, type, goal, reminder, frequency, endDate, notes, status } = req.body;

    const commitment = await DailyCommitment.findOne({ _id: id, user: userId });

    if (!commitment) {
      const error = new AppError('Compromiso no encontrado', 404);
      return next(error);
    }

    // Validaciones
    if (type) {
      const validTypes = ['learn-words', 'study-grammar', 'practice-conversation', 'read-text', 'listen-song', 'custom'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de compromiso inválido', 400);
        return next(error);
      }
    }

    if (goal) {
      if (goal.value && !goal.unit) {
        const error = new AppError('Si proporciona value, también debe proporcionar unit', 400);
        return next(error);
      }
      if (goal.unit) {
        const validUnits = ['palabras', 'minutos', 'reglas', 'oraciones', 'líneas', 'custom'];
        if (!validUnits.includes(goal.unit)) {
          const error = new AppError('Unidad de objetivo inválida', 400);
          return next(error);
        }
      }
    }

    if (status) {
      const validStatus = ['pending', 'in-progress', 'completed'];
      if (!validStatus.includes(status)) {
        const error = new AppError('Estado inválido', 400);
        return next(error);
      }
      if (status === 'completed' && !commitment.completedAt) {
        commitment.completedAt = new Date();
      }
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;
    if (goal) updateData.goal = { ...commitment.goal.toObject(), ...goal };
    if (reminder) updateData.reminder = reminder;
    if (frequency) updateData.frequency = frequency;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    const updatedCommitment = await DailyCommitment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Compromiso actualizado: ${updatedCommitment.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Compromiso actualizado exitosamente',
      commitment: updatedCommitment
    });
  } catch (error) {
    logger.error(`❌ Error actualizando compromiso: ${error.message}`);
    next(error);
  }
};

// Eliminar compromiso
exports.deleteCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const commitment = await DailyCommitment.findOneAndDelete({ _id: id, user: userId });

    if (!commitment) {
      const error = new AppError('Compromiso no encontrado', 404);
      return next(error);
    }

    logger.info(`✅ Compromiso eliminado: ${commitment.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Compromiso eliminado exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando compromiso: ${error.message}`);
    next(error);
  }
};

// Actualizar progreso
exports.updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { current } = req.body;

    if (current === undefined) {
      const error = new AppError('El progreso actual (current) es requerido', 400);
      return next(error);
    }

    const commitment = await DailyCommitment.findOne({ _id: id, user: userId });

    if (!commitment) {
      const error = new AppError('Compromiso no encontrado', 404);
      return next(error);
    }

    commitment.progress.current = Math.min(current, commitment.goal.value);
    
    // El pre-save hook calculará el porcentaje automáticamente
    await commitment.save();

    // Si alcanzó la meta, cambiar estado a completed
    if (commitment.progress.percentage === 100 && commitment.status !== 'completed') {
      commitment.status = 'completed';
      commitment.completedAt = new Date();
      await commitment.save();
    }

    logger.info(`✅ Progreso actualizado: ${commitment.title} (${commitment.progress.percentage}%) por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Progreso actualizado exitosamente',
      commitment
    });
  } catch (error) {
    logger.error(`❌ Error actualizando progreso: ${error.message}`);
    next(error);
  }
};

// Cambiar estado
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    if (!status) {
      const error = new AppError('El estado es requerido', 400);
      return next(error);
    }

    const validStatus = ['pending', 'in-progress', 'completed'];
    if (!validStatus.includes(status)) {
      const error = new AppError('Estado inválido', 400);
      return next(error);
    }

    const commitment = await DailyCommitment.findOne({ _id: id, user: userId });

    if (!commitment) {
      const error = new AppError('Compromiso no encontrado', 404);
      return next(error);
    }

    commitment.status = status;

    if (status === 'completed' && !commitment.completedAt) {
      commitment.completedAt = new Date();
    }

    await commitment.save();

    logger.info(`✅ Estado actualizado: ${commitment.title} (${status}) por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      commitment
    });
  } catch (error) {
    logger.error(`❌ Error actualizando estado: ${error.message}`);
    next(error);
  }
};

// Obtener compromisos de hoy
exports.getTodayCommitments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const commitments = await DailyCommitment.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ 'reminder.time': 1 });

    res.status(200).json({
      success: true,
      count: commitments.length,
      commitments
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo compromisos de hoy: ${error.message}`);
    next(error);
  }
};

// Obtener compromisos por estado
exports.getByStatus = async (req, res, next) => {
  try {
    const { statusType } = req.params;
    const userId = req.user.id;

    const validStatus = ['pending', 'in-progress', 'completed'];
    if (!validStatus.includes(statusType)) {
      const error = new AppError('Estado inválido', 400);
      return next(error);
    }

    const commitments = await DailyCommitment.find({ user: userId, status: statusType }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      status: statusType,
      count: commitments.length,
      commitments
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo compromisos por estado: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de compromisos
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalCommitments = await DailyCommitment.countDocuments({ user: userId });
    const completed = await DailyCommitment.countDocuments({ user: userId, status: 'completed' });
    const inProgress = await DailyCommitment.countDocuments({ user: userId, status: 'in-progress' });
    const pending = await DailyCommitment.countDocuments({ user: userId, status: 'pending' });

    // Promedio de progreso
    const avgProgress = await DailyCommitment.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, average: { $avg: '$progress.percentage' } } }
    ]);

    // Contar por tipo
    const byType = await DailyCommitment.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Tasa de finalización
    const completionRate = totalCommitments > 0 ? ((completed / totalCommitments) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCommitments,
        completed,
        inProgress,
        pending,
        completionRate: `${completionRate}%`,
        averageProgress: avgProgress[0]?.average?.toFixed(2) || 0,
        byType
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};
