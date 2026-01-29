const Grammar = require('../models/Grammar');
const Vocabulary = require('../models/Vocabulary');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Obtener todas las reglas gramaticales del usuario
exports.getAllGrammar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, difficulty, isFavorite, search } = req.query;

    const filter = { user: userId };

    if (category) {
      const validCategories = ['tenses', 'verbs', 'nouns', 'adjectives', 'adverbs', 'pronouns', 'prepositions', 'conditionals', 'passive-voice', 'word-order', 'articles', 'other'];
      if (!validCategories.includes(category)) {
        const error = new AppError('Categoría inválida', 400);
        return next(error);
      }
      filter.category = category;
    }

    if (difficulty) {
      const validDifficulties = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } }
      ];
    }

    const grammar = await Grammar.find(filter)
      .populate('relatedVocabulary', 'word meanings')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grammar.length,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo reglas gramaticales: ${error.message}`);
    next(error);
  }
};

// Crear nueva regla gramatical
exports.createGrammar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, explanation, structure, examples, difficulty, category, relatedVocabulary, notes } = req.body;

    // Validaciones
    if (!title) {
      const error = new AppError('El título es requerido', 400);
      return next(error);
    }

    if (!description) {
      const error = new AppError('La descripción es requerida', 400);
      return next(error);
    }

    if (!explanation) {
      const error = new AppError('La explicación es requerida', 400);
      return next(error);
    }

    if (!category) {
      const error = new AppError('La categoría es requerida', 400);
      return next(error);
    }

    const validCategories = ['tenses', 'verbs', 'nouns', 'adjectives', 'adverbs', 'pronouns', 'prepositions', 'conditionals', 'passive-voice', 'word-order', 'articles', 'other'];
    if (!validCategories.includes(category)) {
      const error = new AppError('Categoría inválida', 400);
      return next(error);
    }

    if (difficulty) {
      const validDifficulties = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    // Validar ejemplos
    if (examples) {
      examples.forEach((ex, index) => {
        if (!ex.correct) {
          const error = new AppError(`El ejemplo ${index + 1} debe tener al menos el campo "correct"`, 400);
          throw error;
        }
      });
    }

    // Crear regla
    const grammarRule = await Grammar.create({
      user: userId,
      title: title.trim(),
      description: description.trim(),
      explanation: explanation.trim(),
      structure: structure || '',
      examples: examples || [],
      difficulty: difficulty || 'beginner',
      category,
      relatedVocabulary: relatedVocabulary || [],
      notes: notes || ''
    });

    await grammarRule.populate('relatedVocabulary', 'word meanings');

    logger.info(`✅ Regla gramatical creada: ${title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Regla gramatical creada exitosamente',
      grammar: grammarRule
    });
  } catch (error) {
    logger.error(`❌ Error creando regla gramatical: ${error.message}`);
    next(error);
  }
};

// Obtener una regla específica
exports.getGrammar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const grammar = await Grammar.findOne({ _id: id, user: userId })
      .populate('relatedVocabulary', 'word meanings difficulty category');

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo regla gramatical: ${error.message}`);
    next(error);
  }
};

// Actualizar regla gramatical
exports.updateGrammar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, explanation, structure, examples, difficulty, category, relatedVocabulary, notes, isFavorite } = req.body;

    const grammar = await Grammar.findOne({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    // Validaciones
    if (category) {
      const validCategories = ['tenses', 'verbs', 'nouns', 'adjectives', 'adverbs', 'pronouns', 'prepositions', 'conditionals', 'passive-voice', 'word-order', 'articles', 'other'];
      if (!validCategories.includes(category)) {
        const error = new AppError('Categoría inválida', 400);
        return next(error);
      }
    }

    if (difficulty) {
      const validDifficulties = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    // Validar ejemplos si se proporcionan
    if (examples) {
      examples.forEach((ex, index) => {
        if (!ex.correct) {
          const error = new AppError(`El ejemplo ${index + 1} debe tener al menos el campo "correct"`, 400);
          throw error;
        }
      });
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (explanation) updateData.explanation = explanation.trim();
    if (structure !== undefined) updateData.structure = structure;
    if (examples) updateData.examples = examples;
    if (difficulty) updateData.difficulty = difficulty;
    if (category) updateData.category = category;
    if (relatedVocabulary) updateData.relatedVocabulary = relatedVocabulary;
    if (notes !== undefined) updateData.notes = notes;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedGrammar = await Grammar.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('relatedVocabulary', 'word meanings');

    logger.info(`✅ Regla gramatical actualizada: ${updatedGrammar.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Regla gramatical actualizada exitosamente',
      grammar: updatedGrammar
    });
  } catch (error) {
    logger.error(`❌ Error actualizando regla gramatical: ${error.message}`);
    next(error);
  }
};

// Eliminar regla gramatical
exports.deleteGrammar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const grammar = await Grammar.findOneAndDelete({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    logger.info(`✅ Regla gramatical eliminada: ${grammar.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Regla gramatical eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando regla gramatical: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const grammar = await Grammar.findOne({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    grammar.isFavorite = !grammar.isFavorite;
    await grammar.save();

    logger.info(`✅ Favorito actualizado: ${grammar.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Regla ${grammar.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Obtener reglas por categoría
exports.getByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const userId = req.user.id;

    const validCategories = ['tenses', 'verbs', 'nouns', 'adjectives', 'adverbs', 'pronouns', 'prepositions', 'conditionals', 'passive-voice', 'word-order', 'articles', 'other'];
    if (!validCategories.includes(categoryName)) {
      const error = new AppError('Categoría inválida', 400);
      return next(error);
    }

    const grammar = await Grammar.find({ user: userId, category: categoryName })
      .populate('relatedVocabulary', 'word meanings')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      category: categoryName,
      count: grammar.length,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo reglas por categoría: ${error.message}`);
    next(error);
  }
};

// Obtener reglas por dificultad
exports.getByDifficulty = async (req, res, next) => {
  try {
    const { level } = req.params;
    const userId = req.user.id;

    const validDifficulties = ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];
    if (!validDifficulties.includes(level)) {
      const error = new AppError('Nivel de dificultad inválido', 400);
      return next(error);
    }

    const grammar = await Grammar.find({ user: userId, difficulty: level })
      .populate('relatedVocabulary', 'word meanings')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      level,
      count: grammar.length,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo reglas por dificultad: ${error.message}`);
    next(error);
  }
};

// Agregar vocabulario relacionado
exports.addRelatedVocabulary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { vocabularyId } = req.body;

    if (!vocabularyId) {
      const error = new AppError('El ID del vocabulario es requerido', 400);
      return next(error);
    }

    const grammar = await Grammar.findOne({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    // Verificar que el vocabulario exista y pertenezca al usuario
    const vocabulary = await Vocabulary.findOne({ _id: vocabularyId, user: userId });

    if (!vocabulary) {
      const error = new AppError('Vocabulario no encontrado', 404);
      return next(error);
    }

    // Verificar que no esté duplicado
    if (grammar.relatedVocabulary.includes(vocabularyId)) {
      const error = new AppError('Este vocabulario ya está relacionado', 400);
      return next(error);
    }

    grammar.relatedVocabulary.push(vocabularyId);
    await grammar.save();
    await grammar.populate('relatedVocabulary', 'word meanings');

    logger.info(`✅ Vocabulario relacionado agregado a regla ${grammar.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Vocabulario relacionado agregado exitosamente',
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error agregando vocabulario relacionado: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de gramática
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose'); // Importar mongoose

    const totalRules = await Grammar.countDocuments({ user: userId });
    const favoriteRules = await Grammar.countDocuments({ user: userId, isFavorite: true });

    // Contar por categoría - CORREGIDO
    const byCategory = await Grammar.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } }, // Usar new
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Contar por dificultad - CORREGIDO
    const byDifficulty = await Grammar.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } }, // Usar new
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRules,
        favoriteRules,
        byCategory,
        byDifficulty
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Agregar palabra subrayada
exports.addHighlightedWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { word, color } = req.body;

    if (!word || !color) {
      const error = new AppError('La palabra y el color son requeridos', 400);
      return next(error);
    }

    const validColors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33'];
    
    // Validar que sea un color válido (nombre o hex)
    const isValidColor = validColors.includes(color) || /^#[0-9A-F]{6}$/i.test(color);
    if (!isValidColor) {
      const error = new AppError('Color inválido. Usa nombres (red, blue, yellow, green, purple, orange, pink) o código hex (#RRGGBB)', 400);
      return next(error);
    }

    const grammar = await Grammar.findOne({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    // Verificar que la palabra no esté duplicada
    const exists = grammar.highlightedWords.some(hw => hw.word.toLowerCase() === word.toLowerCase());
    if (exists) {
      const error = new AppError('Esta palabra ya está subrayada', 400);
      return next(error);
    }

    grammar.highlightedWords.push({
      word: word.trim(),
      color
    });

    await grammar.save();

    logger.info(`✅ Palabra subrayada agregada a regla ${grammar.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Palabra "${word}" subrayada con color "${color}"`,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error agregando palabra subrayada: ${error.message}`);
    next(error);
  }
};

// Actualizar color de palabra subrayada
exports.updateHighlightedWordColor = async (req, res, next) => {
  try {
    const { id, word } = req.params;
    const userId = req.user.id;
    const { color } = req.body;

    if (!color) {
      const error = new AppError('El color es requerido', 400);
      return next(error);
    }

    const validColors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33'];
    
    // Validar que sea un color válido
    const isValidColor = validColors.includes(color) || /^#[0-9A-F]{6}$/i.test(color);
    if (!isValidColor) {
      const error = new AppError('Color inválido. Usa nombres (red, blue, yellow, green, purple, orange, pink) o código hex (#RRGGBB)', 400);
      return next(error);
    }

    const grammar = await Grammar.findOne({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    // Buscar y actualizar la palabra
    const highlightedWord = grammar.highlightedWords.find(hw => hw.word.toLowerCase() === word.toLowerCase());

    if (!highlightedWord) {
      const error = new AppError(`Palabra "${word}" no encontrada en las palabras subrayadas`, 404);
      return next(error);
    }

    highlightedWord.color = color;
    await grammar.save();

    logger.info(`✅ Color de palabra subrayada actualizado en regla ${grammar.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Color de "${word}" actualizado a "${color}"`,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error actualizando color de palabra: ${error.message}`);
    next(error);
  }
};

// Eliminar palabra subrayada
exports.removeHighlightedWord = async (req, res, next) => {
  try {
    const { id, word } = req.params;
    const userId = req.user.id;

    const grammar = await Grammar.findOne({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    const initialLength = grammar.highlightedWords.length;
    grammar.highlightedWords = grammar.highlightedWords.filter(hw => hw.word.toLowerCase() !== word.toLowerCase());

    if (grammar.highlightedWords.length === initialLength) {
      const error = new AppError(`Palabra "${word}" no encontrada en las palabras subrayadas`, 404);
      return next(error);
    }

    await grammar.save();

    logger.info(`✅ Palabra subrayada eliminada de regla ${grammar.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Palabra "${word}" removida del subrayado`,
      grammar
    });
  } catch (error) {
    logger.error(`❌ Error removiendo palabra subrayada: ${error.message}`);
    next(error);
  }
};

// Obtener palabras subrayadas de una regla
exports.getHighlightedWords = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const grammar = await Grammar.findOne({ _id: id, user: userId });

    if (!grammar) {
      const error = new AppError('Regla gramatical no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      rule: grammar.title,
      structure: grammar.structure,
      highlightedWords: grammar.highlightedWords
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo palabras subrayadas: ${error.message}`);
    next(error);
  }
};
