const DailyPhrase = require('../models/DailyPhrase');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Obtener todas las frases del usuario
exports.getAllPhrases = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, isFavorite, search } = req.query;

    const filter = { user: userId };

    if (type) {
      const validTypes = ['idiom', 'expression', 'slang', 'proverb', 'quote', 'phrase', 'saying'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de frase inválido', 400);
        return next(error);
      }
      filter.type = type;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (search) {
      filter.$or = [
        { phrase: { $regex: search, $options: 'i' } },
        { translation: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }

    const phrases = await DailyPhrase.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: phrases.length,
      phrases
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo frases: ${error.message}`);
    next(error);
  }
};

// Crear nueva frase
exports.createPhrase = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { phrase, translation, type, keywords } = req.body;

    // Validaciones
    if (!phrase) {
      const error = new AppError('La frase es requerida', 400);
      return next(error);
    }

    if (!translation) {
      const error = new AppError('La traducción es requerida', 400);
      return next(error);
    }

    if (type) {
      const validTypes = ['idiom', 'expression', 'slang', 'proverb', 'quote', 'phrase', 'saying'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de frase inválido', 400);
        return next(error);
      }
    }

    // Crear frase
    const newPhrase = await DailyPhrase.create({
      user: userId,
      phrase: phrase.trim(),
      translation: translation.trim(),
      type: type || 'phrase',
      keywords: keywords || []
    });

    logger.info(`✅ Frase creada: ${phrase} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Frase agregada exitosamente',
      phrase: newPhrase
    });
  } catch (error) {
    logger.error(`❌ Error creando frase: ${error.message}`);
    next(error);
  }
};

// Obtener una frase específica
exports.getPhrase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const phrase = await DailyPhrase.findOne({ _id: id, user: userId });

    if (!phrase) {
      const error = new AppError('Frase no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      phrase
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo frase: ${error.message}`);
    next(error);
  }
};

// Actualizar frase
exports.updatePhrase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { phrase, translation, type, keywords, isFavorite } = req.body;

    const existingPhrase = await DailyPhrase.findOne({ _id: id, user: userId });

    if (!existingPhrase) {
      const error = new AppError('Frase no encontrada', 404);
      return next(error);
    }

    // Validaciones
    if (type) {
      const validTypes = ['idiom', 'expression', 'slang', 'proverb', 'quote', 'phrase', 'saying'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de frase inválido', 400);
        return next(error);
      }
    }

    const updateData = {};

    if (phrase) updateData.phrase = phrase.trim();
    if (translation) updateData.translation = translation.trim();
    if (type) updateData.type = type;
    if (keywords) updateData.keywords = keywords;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedPhrase = await DailyPhrase.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Frase actualizada: ${updatedPhrase.phrase} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Frase actualizada exitosamente',
      phrase: updatedPhrase
    });
  } catch (error) {
    logger.error(`❌ Error actualizando frase: ${error.message}`);
    next(error);
  }
};

// Eliminar frase
exports.deletePhrase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const phrase = await DailyPhrase.findOneAndDelete({ _id: id, user: userId });

    if (!phrase) {
      const error = new AppError('Frase no encontrada', 404);
      return next(error);
    }

    logger.info(`✅ Frase eliminada: ${phrase.phrase} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Frase eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando frase: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const phrase = await DailyPhrase.findOne({ _id: id, user: userId });

    if (!phrase) {
      const error = new AppError('Frase no encontrada', 404);
      return next(error);
    }

    phrase.isFavorite = !phrase.isFavorite;
    await phrase.save();

    logger.info(`✅ Favorito actualizado: ${phrase.phrase} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Frase ${phrase.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`,
      phrase
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Obtener frases por tipo
exports.getByType = async (req, res, next) => {
  try {
    const { phraseType } = req.params;
    const userId = req.user.id;

    const validTypes = ['idiom', 'expression', 'slang', 'proverb', 'quote', 'phrase', 'saying'];
    if (!validTypes.includes(phraseType)) {
      const error = new AppError('Tipo de frase inválido', 400);
      return next(error);
    }

    const phrases = await DailyPhrase.find({ user: userId, type: phraseType }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      type: phraseType,
      count: phrases.length,
      phrases
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo frases por tipo: ${error.message}`);
    next(error);
  }
};

// Obtener una frase aleatoria (Daily Phrase)
exports.getRandomPhrase = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const phrases = await DailyPhrase.find({ user: userId });

    if (phrases.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay frases disponibles aún. ¡Crea algunas frases primero!',
        phrase: null
      });
    }

    const randomIndex = Math.floor(Math.random() * phrases.length);
    const randomPhrase = phrases[randomIndex];

    res.status(200).json({
      success: true,
      phrase: randomPhrase
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo frase aleatoria: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de frases
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalPhrases = await DailyPhrase.countDocuments({ user: userId });
    const favoritePhrases = await DailyPhrase.countDocuments({ user: userId, isFavorite: true });

    // Contar por tipo
    const byType = await DailyPhrase.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Palabras clave más frecuentes
    const topKeywords = await DailyPhrase.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$keywords' },
      { $group: { _id: '$keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPhrases,
        favoritePhrases,
        byType,
        topKeywords
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Buscar frases por palabra clave
exports.getByKeyword = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    const userId = req.user.id;

    const phrases = await DailyPhrase.find({
      user: userId,
      keywords: { $regex: keyword, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      keyword,
      count: phrases.length,
      phrases
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo frases por palabra clave: ${error.message}`);
    next(error);
  }
};
