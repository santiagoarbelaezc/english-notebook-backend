const Flashcard = require('../models/Flashcard');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Obtener todas las tarjetas del usuario
exports.getAllFlashcards = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deck, difficulty, isFavorite, search } = req.query;

    const filter = { user: userId };

    if (deck) {
      filter.deck = deck;
    }

    if (difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
      filter.difficulty = difficulty;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (search) {
      filter.$or = [
        { front: { $regex: search, $options: 'i' } },
        { back: { $regex: search, $options: 'i' } }
      ];
    }

    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo flashcards: ${error.message}`);
    next(error);
  }
};

// Crear nueva tarjeta
exports.createFlashcard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { front, back, deck, difficulty } = req.body;

    // Validaciones
    if (!front) {
      const error = new AppError('El frente de la tarjeta es requerido', 400);
      return next(error);
    }

    if (!back) {
      const error = new AppError('El reverso de la tarjeta es requerido', 400);
      return next(error);
    }

    if (difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    // Crear tarjeta
    const flashcard = await Flashcard.create({
      user: userId,
      front: front.trim(),
      back: back.trim(),
      deck: deck || 'General',
      difficulty: difficulty || 'medium'
    });

    logger.info(`✅ Flashcard creada: ${front} en mazo ${flashcard.deck} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Tarjeta creada exitosamente',
      flashcard
    });
  } catch (error) {
    logger.error(`❌ Error creando flashcard: ${error.message}`);
    next(error);
  }
};

// Obtener una tarjeta específica
exports.getFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const flashcard = await Flashcard.findOne({ _id: id, user: userId });

    if (!flashcard) {
      const error = new AppError('Tarjeta no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      flashcard
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo flashcard: ${error.message}`);
    next(error);
  }
};

// Actualizar tarjeta
exports.updateFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { front, back, deck, difficulty, isFavorite } = req.body;

    const flashcard = await Flashcard.findOne({ _id: id, user: userId });

    if (!flashcard) {
      const error = new AppError('Tarjeta no encontrada', 404);
      return next(error);
    }

    // Validaciones
    if (difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    const updateData = {};

    if (front) updateData.front = front.trim();
    if (back) updateData.back = back.trim();
    if (deck) updateData.deck = deck;
    if (difficulty) updateData.difficulty = difficulty;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedFlashcard = await Flashcard.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Flashcard actualizada: ${updatedFlashcard.front} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Tarjeta actualizada exitosamente',
      flashcard: updatedFlashcard
    });
  } catch (error) {
    logger.error(`❌ Error actualizando flashcard: ${error.message}`);
    next(error);
  }
};

// Eliminar tarjeta
exports.deleteFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const flashcard = await Flashcard.findOneAndDelete({ _id: id, user: userId });

    if (!flashcard) {
      const error = new AppError('Tarjeta no encontrada', 404);
      return next(error);
    }

    logger.info(`✅ Flashcard eliminada: ${flashcard.front} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Tarjeta eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando flashcard: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const flashcard = await Flashcard.findOne({ _id: id, user: userId });

    if (!flashcard) {
      const error = new AppError('Tarjeta no encontrada', 404);
      return next(error);
    }

    flashcard.isFavorite = !flashcard.isFavorite;
    await flashcard.save();

    logger.info(`✅ Favorito actualizado: ${flashcard.front} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Tarjeta ${flashcard.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`,
      flashcard
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Obtener tarjetas por mazo
exports.getByDeck = async (req, res, next) => {
  try {
    const { deckName } = req.params;
    const userId = req.user.id;

    const flashcards = await Flashcard.find({ user: userId, deck: deckName }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      deck: deckName,
      count: flashcards.length,
      flashcards
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo flashcards por mazo: ${error.message}`);
    next(error);
  }
};

// Obtener tarjetas por dificultad
exports.getByDifficulty = async (req, res, next) => {
  try {
    const { difficultyLevel } = req.params;
    const userId = req.user.id;

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficultyLevel)) {
      const error = new AppError('Dificultad inválida', 400);
      return next(error);
    }

    const flashcards = await Flashcard.find({ user: userId, difficulty: difficultyLevel }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      difficulty: difficultyLevel,
      count: flashcards.length,
      flashcards
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo flashcards por dificultad: ${error.message}`);
    next(error);
  }
};

// Marcar como correcto - Sistema de Repetición Espaciada (SRS)
exports.markCorrect = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const flashcard = await Flashcard.findOne({ _id: id, user: userId });

    if (!flashcard) {
      const error = new AppError('Tarjeta no encontrada', 404);
      return next(error);
    }

    // Incrementar estadísticas
    flashcard.statistics.timesReviewed += 1;
    flashcard.statistics.timesCorrect += 1;
    flashcard.statistics.lastReviewDate = new Date();

    // Aplicar algoritmo SRS: aumentar intervalo
    // Fórmula simple: intervalo aumenta exponencialmente
    if (flashcard.statistics.interval === 1) {
      flashcard.statistics.interval = 3;
    } else if (flashcard.statistics.interval === 3) {
      flashcard.statistics.interval = 7;
    } else if (flashcard.statistics.interval === 7) {
      flashcard.statistics.interval = 14;
    } else if (flashcard.statistics.interval === 14) {
      flashcard.statistics.interval = 30;
    } else if (flashcard.statistics.interval < 30) {
      flashcard.statistics.interval = 30;
    }

    // Calcular próxima fecha de revisión
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + flashcard.statistics.interval);
    flashcard.statistics.nextReviewDate = nextDate;

    await flashcard.save();

    logger.info(`✅ Respuesta correcta: ${flashcard.front} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Respuesta registrada como correcta',
      flashcard
    });
  } catch (error) {
    logger.error(`❌ Error marcando como correcto: ${error.message}`);
    next(error);
  }
};

// Marcar como incorrecto - Sistema de Repetición Espaciada (SRS)
exports.markIncorrect = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const flashcard = await Flashcard.findOne({ _id: id, user: userId });

    if (!flashcard) {
      const error = new AppError('Tarjeta no encontrada', 404);
      return next(error);
    }

    // Incrementar estadísticas
    flashcard.statistics.timesReviewed += 1;
    flashcard.statistics.timesIncorrect += 1;
    flashcard.statistics.lastReviewDate = new Date();

    // Reiniciar intervalo para respuestas incorrectas
    flashcard.statistics.interval = 1;

    // Próxima revisión mañana
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    flashcard.statistics.nextReviewDate = nextDate;

    await flashcard.save();

    logger.info(`❌ Respuesta incorrecta: ${flashcard.front} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Respuesta registrada como incorrecta',
      flashcard
    });
  } catch (error) {
    logger.error(`❌ Error marcando como incorrecto: ${error.message}`);
    next(error);
  }
};

// Obtener tarjetas para revisar hoy (SRS)
exports.getNextReviewCards = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deck, limit = 20 } = req.query;

    const filter = {
      user: userId,
      $or: [
        { 'statistics.nextReviewDate': { $lte: new Date() } },
        { 'statistics.nextReviewDate': { $exists: false } }
      ]
    };

    if (deck) {
      filter.deck = deck;
    }

    const flashcards = await Flashcard.find(filter)
      .limit(parseInt(limit))
      .sort({ 'statistics.lastReviewDate': 1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo tarjetas para revisar: ${error.message}`);
    next(error);
  }
};

// Obtener todos los mazos del usuario
exports.getAllDecks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const decks = await Flashcard.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$deck', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: decks.length,
      decks
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo mazos: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de flashcards
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalCards = await Flashcard.countDocuments({ user: userId });
    const favoriteCards = await Flashcard.countDocuments({ user: userId, isFavorite: true });

    // Contar por dificultad
    const byDifficulty = await Flashcard.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Total de revisiones
    const totalReviews = await Flashcard.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$statistics.timesReviewed' } } }
    ]);

    // Total de aciertos y errores
    const correctAnswers = await Flashcard.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$statistics.timesCorrect' } } }
    ]);

    const incorrectAnswers = await Flashcard.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$statistics.timesIncorrect' } } }
    ]);

    // Tasa de precisión
    const totalReviewsCount = totalReviews[0]?.total || 0;
    const correctCount = correctAnswers[0]?.total || 0;
    const accuracyRate = totalReviewsCount > 0 ? ((correctCount / totalReviewsCount) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCards,
        favoriteCards,
        totalReviews: totalReviewsCount,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectAnswers[0]?.total || 0,
        accuracyRate: `${accuracyRate}%`,
        byDifficulty
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de un mazo específico
exports.getDeckStats = async (req, res, next) => {
  try {
    const { deckName } = req.params;
    const userId = req.user.id;

    const cardsInDeck = await Flashcard.find({ user: userId, deck: deckName });

    if (cardsInDeck.length === 0) {
      const error = new AppError('Mazo no encontrado o sin tarjetas', 404);
      return next(error);
    }

    const totalCards = cardsInDeck.length;
    const favoriteCards = cardsInDeck.filter(card => card.isFavorite).length;
    const totalReviews = cardsInDeck.reduce((acc, card) => acc + card.statistics.timesReviewed, 0);
    const correctAnswers = cardsInDeck.reduce((acc, card) => acc + card.statistics.timesCorrect, 0);
    const incorrectAnswers = cardsInDeck.reduce((acc, card) => acc + card.statistics.timesIncorrect, 0);
    const accuracyRate = totalReviews > 0 ? ((correctAnswers / totalReviews) * 100).toFixed(2) : 0;

    const byDifficulty = cardsInDeck.reduce((acc, card) => {
      const existing = acc.find(d => d.difficulty === card.difficulty);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ difficulty: card.difficulty, count: 1 });
      }
      return acc;
    }, []);

    res.status(200).json({
      success: true,
      deck: deckName,
      stats: {
        totalCards,
        favoriteCards,
        totalReviews,
        correctAnswers,
        incorrectAnswers,
        accuracyRate: `${accuracyRate}%`,
        byDifficulty
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas del mazo: ${error.message}`);
    next(error);
  }
};
