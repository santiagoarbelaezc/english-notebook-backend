const Profile = require('../models/Profile');
const User = require('../models/User');
const Vocabulary = require('../models/Vocabulary');
const Grammar = require('../models/Grammar');
const Conversation = require('../models/Conversation');
const Song = require('../models/Song');
const mongoose = require('mongoose');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } = require('../utils/cloudinaryHelper');

// Obtener mi perfil
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ user: userId }).populate({
      path: 'user',
      select: 'name username email englishLevel createdAt'
    });

    if (!profile) {
      const error = new AppError('Perfil no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo perfil: ${error.message}`);
    next(error);
  }
};

// Obtener perfil público de otro usuario
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Buscar usuario por username
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      const error = new AppError('Usuario no encontrado', 404);
      return next(error);
    }

    const profile = await Profile.findOne({ user: user._id }).populate({
      path: 'user',
      select: 'name username englishLevel createdAt'
    });

    if (!profile) {
      const error = new AppError('Perfil no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo perfil público: ${error.message}`);
    next(error);
  }
};

// Actualizar mi perfil
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bio, nativeLanguage } = req.body;

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const error = new AppError('Perfil no encontrado', 404);
      return next(error);
    }

    // Validaciones
    if (bio !== undefined) {
      if (bio.length > 500) {
        const error = new AppError('La biografía no debe exceder 500 caracteres', 400);
        return next(error);
      }
      profile.bio = bio;
    }

    if (nativeLanguage !== undefined) {
      profile.nativeLanguage = nativeLanguage;
    }

    profile.updatedAt = Date.now();
    await profile.save();

    // Populate user data for response
    await profile.populate('user', 'name username email englishLevel createdAt');

    logger.info(`✅ Perfil actualizado para usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      profile
    });
  } catch (error) {
    logger.error(`❌ Error actualizando perfil: ${error.message}`);
    next(error);
  }
};

// Subir imagen de perfil
exports.uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Verificar que se subió un archivo
    if (!req.file) {
      const error = new AppError('No se proporcionó ningún archivo', 400);
      return next(error);
    }

    logger.info(`📤 Subiendo imagen de perfil para usuario ${req.user.username}...`);

    // Subir a Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, {
      public_id: `profile_${userId}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    if (!uploadResult.success) {
      const error = new AppError(`Error subiendo imagen: ${uploadResult.error}`, 500);
      return next(error);
    }

    // Obtener perfil actual
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const error = new AppError('Perfil no encontrado', 404);
      return next(error);
    }

    // Si había una imagen anterior, eliminarla de Cloudinary
    if (profile.profileImage) {
      const oldPublicId = extractPublicIdFromUrl(profile.profileImage);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Actualizar perfil con nueva imagen
    profile.profileImage = uploadResult.data.url;
    profile.updatedAt = Date.now();
    await profile.save();

    logger.info(`✅ Imagen de perfil actualizada para usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Imagen de perfil actualizada exitosamente',
      profileImage: {
        url: uploadResult.data.url,
        publicId: uploadResult.data.public_id,
        width: uploadResult.data.width,
        height: uploadResult.data.height
      }
    });
  } catch (error) {
    logger.error(`❌ Error subiendo imagen de perfil: ${error.message}`);
    next(error);
  }
};

// Actualizar última fecha activa
exports.updateLastActiveDate = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Profile.findOneAndUpdate(
      { user: userId },
      { 'statistics.lastActiveDate': new Date() },
      { new: true }
    );

    logger.info(`✅ Última fecha activa actualizada para ${req.user.username}`);
    next();
  } catch (error) {
    logger.error(`❌ Error actualizando fecha activa: ${error.message}`);
    next(error);
  }
};

// Recalcular estadísticas (actualizar contadores desde las colecciones)
exports.recalculateStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Contar documentos
    const totalVocabulary = await Vocabulary.countDocuments({ user: userId });
    const totalGrammarRules = await Grammar.countDocuments({ user: userId });
    const totalConversations = await Conversation.countDocuments({ user: userId });
    const totalSongs = await Song.countDocuments({ user: userId });

    // Actualizar perfil
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        'statistics.totalVocabulary': totalVocabulary,
        'statistics.totalGrammarRules': totalGrammarRules,
        'statistics.totalConversations': totalConversations,
        'statistics.totalSongs': totalSongs,
        updatedAt: new Date()
      },
      { new: true }
    );

    logger.info(`✅ Estadísticas recalculadas para usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Estadísticas actualizadas exitosamente',
      statistics: profile.statistics
    });
  } catch (error) {
    logger.error(`❌ Error recalculando estadísticas: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas detalladas
exports.getDetailedStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const error = new AppError('Perfil no encontrado', 404);
      return next(error);
    }

    // Obtener datos adicionales
    const vocabularyByDifficulty = await Vocabulary.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const vocabularyByCategory = await Vocabulary.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const conversationsByTopic = await Conversation.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$topic', count: { $sum: 1 } } }
    ]);

    const songsByTopic = await Song.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$topic', count: { $sum: 1 } } }
    ]);

    const totalMessages = await Conversation.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalMessages: { $sum: '$messageCount' } } }
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        vocabulary: {
          learned: profile.statistics.totalVocabulary,
          total: profile.statistics.totalVocabulary,
          mastered: profile.statistics.totalVocabulary // Assuming all are mastered for now
        },
        grammar: {
          completed: profile.statistics.totalGrammarRules,
          total: profile.statistics.totalGrammarRules
        },
        conversations: {
          completed: profile.statistics.totalConversations,
          total: profile.statistics.totalConversations
        },
        streak: {
          current: profile.statistics.streakDays,
          longest: profile.statistics.streakDays, // Assuming current is longest for now
          lastUpdated: profile.statistics.lastActiveDate
        }
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas detalladas: ${error.message}`);
    next(error);
  }
};

// Obtener progreso de aprendizaje
exports.getLearningProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const error = new AppError('Perfil no encontrado', 404);
      return next(error);
    }

    const user = await User.findById(userId);

    // Calcular progreso basado en actividades
    const totalActivities = 
      profile.statistics.totalVocabulary +
      profile.statistics.totalGrammarRules +
      profile.statistics.totalConversations +
      profile.statistics.totalSongs;

    // Estimación simple del progreso (0-100%)
    // Basado en cantidad de actividades completadas
    const progressPercentage = Math.min(100, Math.round((totalActivities / 100) * 100));

    res.status(200).json({
      success: true,
      progress: {
        currentLevel: user.englishLevel,
        progressPercentage,
        totalActivities,
        breakdown: {
          vocabulary: profile.statistics.totalVocabulary,
          grammar: profile.statistics.totalGrammarRules,
          conversations: profile.statistics.totalConversations,
          songs: profile.statistics.totalSongs
        },
        streakDays: profile.statistics.streakDays,
        lastActiveDate: profile.statistics.lastActiveDate
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo progreso: ${error.message}`);
    next(error);
  }
};

// Actualizar nivel de racha (streak)
exports.updateStreak = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { streakDays } = req.body;

    if (streakDays === undefined || streakDays < 0) {
      const error = new AppError('El valor de racha debe ser un número no negativo', 400);
      return next(error);
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { 'statistics.streakDays': streakDays },
      { new: true }
    );

    logger.info(`✅ Racha actualizada a ${streakDays} días para usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Racha actualizada exitosamente',
      streakDays: profile.statistics.streakDays
    });
  } catch (error) {
    logger.error(`❌ Error actualizando racha: ${error.message}`);
    next(error);
  }
};

// Obtener resumen del perfil (para dashboard)
exports.getProfileSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ user: userId }).populate({
      path: 'user',
      select: 'name username email englishLevel'
    });

    if (!profile) {
      const error = new AppError('Perfil no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      summary: {
        user: {
          name: profile.user.name,
          username: profile.user.username,
          email: profile.user.email,
          englishLevel: profile.user.englishLevel,
          profileImage: profile.profileImage,
          bio: profile.bio
        },
        statistics: profile.statistics,
        memberSince: profile.createdAt
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo resumen del perfil: ${error.message}`);
    next(error);
  }
};
