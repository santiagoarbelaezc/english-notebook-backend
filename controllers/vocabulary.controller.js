const Vocabulary = require('../models/Vocabulary');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Obtener todas las palabras del usuario con filtros opcionales
exports.getAllVocabulary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { difficulty, category, isFavorite, search } = req.query;

    // Construir filtro base
    const filter = { user: userId };

    if (difficulty) {
      const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
      filter.difficulty = difficulty;
    }

    if (category) {
      const validCategories = ['daily-life', 'business', 'travel', 'food', 'nature', 'technology', 'emotions', 'sports', 'other'];
      if (!validCategories.includes(category)) {
        const error = new AppError('Categoría inválida', 400);
        return next(error);
      }
      filter.category = category;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (search) {
      filter.$or = [
        { word: { $regex: search, $options: 'i' } },
        { 'meanings.meaning': { $regex: search, $options: 'i' } }
      ];
    }

    // Consultar
    const vocabulary = await Vocabulary.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vocabulary.length,
      vocabulary
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo vocabulario: ${error.message}`);
    next(error);
  }
};

// Crear nueva palabra
exports.createWord = async (req, res, next) => {
  try {
    const { word, pronunciation, meanings, examples, synonyms, antonyms, difficulty, category, isFavorite } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!word) {
      const error = new AppError('La palabra es requerida', 400);
      return next(error);
    }

    if (!meanings || meanings.length === 0) {
      const error = new AppError('Debes proporcionar al menos un significado', 400);
      return next(error);
    }

    // Validar significados
    meanings.forEach((m, index) => {
      if (!m.meaning || !m.partOfSpeech) {
        const error = new AppError(`El significado ${index + 1} debe tener "meaning" y "partOfSpeech"`, 400);
        throw error;
      }
      const validPOS = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'other'];
      if (!validPOS.includes(m.partOfSpeech)) {
        const error = new AppError(`El partOfSpeech "${m.partOfSpeech}" no es válido`, 400);
        throw error;
      }
    });

    // Validar dificultad si se proporciona
    if (difficulty) {
      const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    // Verificar si la palabra ya existe
    const existingWord = await Vocabulary.findOne({ 
      user: userId, 
      word: word.toLowerCase().trim() 
    });

    if (existingWord) {
      const error = new AppError('Esta palabra ya existe en tu vocabulario', 400);
      return next(error);
    }

    // Crear palabra
    const newWord = await Vocabulary.create({
      user: userId,
      word: word.toLowerCase().trim(),
      pronunciation: pronunciation || '',
      meanings,
      examples: examples || [],
      synonyms: synonyms || [],
      antonyms: antonyms || [],
      difficulty: difficulty || 'A1',
      category: category || 'other',
      isFavorite: isFavorite || false
    });

    logger.info(`✅ Palabra agregada: ${word} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Palabra agregada exitosamente',
      vocabulary: newWord
    });
  } catch (error) {
    logger.error(`❌ Error creando palabra: ${error.message}`);
    next(error);
  }
};

// Obtener una palabra específica
exports.getWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const word = await Vocabulary.findOne({ _id: id, user: userId });

    if (!word) {
      const error = new AppError('Palabra no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      vocabulary: word
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo palabra: ${error.message}`);
    next(error);
  }
};

// Actualizar palabra
exports.updateWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { word, pronunciation, meanings, examples, synonyms, antonyms, difficulty, category, isFavorite } = req.body;

    // Verificar que la palabra exista y pertenezca al usuario
    const existingWord = await Vocabulary.findOne({ _id: id, user: userId });

    if (!existingWord) {
      const error = new AppError('Palabra no encontrada', 404);
      return next(error);
    }

    // Validaciones
    if (word && word.toLowerCase().trim() !== existingWord.word) {
      const duplicate = await Vocabulary.findOne({
        user: userId,
        word: word.toLowerCase().trim(),
        _id: { $ne: id }
      });

      if (duplicate) {
        const error = new AppError('Esta palabra ya existe en tu vocabulario', 400);
        return next(error);
      }
    }

    if (meanings) {
      meanings.forEach((m, index) => {
        if (!m.meaning || !m.partOfSpeech) {
          const error = new AppError(`El significado ${index + 1} debe tener "meaning" y "partOfSpeech"`, 400);
          throw error;
        }
        const validPOS = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'other'];
        if (!validPOS.includes(m.partOfSpeech)) {
          const error = new AppError(`El partOfSpeech "${m.partOfSpeech}" no es válido`, 400);
          throw error;
        }
      });
    }

    if (difficulty) {
      const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    // Actualizar
    const updateData = {};
    if (word) updateData.word = word.toLowerCase().trim();
    if (pronunciation !== undefined) updateData.pronunciation = pronunciation;
    if (meanings) updateData.meanings = meanings;
    if (examples) updateData.examples = examples;
    if (synonyms) updateData.synonyms = synonyms;
    if (antonyms) updateData.antonyms = antonyms;
    if (difficulty) updateData.difficulty = difficulty;
    if (category) updateData.category = category;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedWord = await Vocabulary.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Palabra actualizada: ${updatedWord.word} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Palabra actualizada exitosamente',
      vocabulary: updatedWord
    });
  } catch (error) {
    logger.error(`❌ Error actualizando palabra: ${error.message}`);
    next(error);
  }
};

// Eliminar palabra
exports.deleteWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const word = await Vocabulary.findOneAndDelete({ _id: id, user: userId });

    if (!word) {
      const error = new AppError('Palabra no encontrada', 404);
      return next(error);
    }

    logger.info(`✅ Palabra eliminada: ${word.word} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Palabra eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando palabra: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const word = await Vocabulary.findOne({ _id: id, user: userId });

    if (!word) {
      const error = new AppError('Palabra no encontrada', 404);
      return next(error);
    }

    word.isFavorite = !word.isFavorite;
    await word.save();

    logger.info(`✅ Favorito actualizado: ${word.word} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Palabra ${word.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`,
      vocabulary: word
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Obtener palabras por dificultad
exports.getByDifficulty = async (req, res, next) => {
  try {
    const { level } = req.params;
    const userId = req.user.id;

    const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validDifficulties.includes(level)) {
      const error = new AppError('Nivel de dificultad inválido', 400);
      return next(error);
    }

    const vocabulary = await Vocabulary.find({ user: userId, difficulty: level }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      level,
      count: vocabulary.length,
      vocabulary
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo palabras por dificultad: ${error.message}`);
    next(error);
  }
};

// Obtener palabras por categoría
exports.getByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const userId = req.user.id;

    const validCategories = ['daily-life', 'business', 'travel', 'food', 'nature', 'technology', 'emotions', 'sports', 'other'];
    if (!validCategories.includes(categoryName)) {
      const error = new AppError('Categoría inválida', 400);
      return next(error);
    }

    const vocabulary = await Vocabulary.find({ user: userId, category: categoryName }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      category: categoryName,
      count: vocabulary.length,
      vocabulary
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo palabras por categoría: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de vocabulario
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalWords = await Vocabulary.countDocuments({ user: userId });
    const favoriteWords = await Vocabulary.countDocuments({ user: userId, isFavorite: true });

    // Contar por dificultad
    const byDifficulty = await Vocabulary.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Contar por categoría
    const byCategory = await Vocabulary.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalWords,
        favoriteWords,
        byDifficulty,
        byCategory
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};
