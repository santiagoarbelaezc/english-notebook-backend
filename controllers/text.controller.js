const Text = require('../models/Text');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Obtener todos los textos del usuario
exports.getAllTexts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, category, isFavorite, search } = req.query;

    const filter = { user: userId };

    if (type) {
      const validTypes = ['article', 'story', 'news', 'blog', 'book-excerpt', 'email', 'letter', 'poem', 'other'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de texto inválido', 400);
        return next(error);
      }
      filter.type = type;
    }

    if (category) {
      const validCategories = ['daily-life', 'business', 'travel', 'culture', 'science', 'history', 'self-improvement', 'other'];
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
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const texts = await Text.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: texts.length,
      texts
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo textos: ${error.message}`);
    next(error);
  }
};

// Crear nuevo texto
exports.createText = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, content, type, source, category, annotatedVocabulary, keyExpressions, summary, notes, comprehensionNotes } = req.body;

    // Validaciones
    if (!title) {
      const error = new AppError('El título es requerido', 400);
      return next(error);
    }

    if (!content) {
      const error = new AppError('El contenido es requerido', 400);
      return next(error);
    }

    if (type) {
      const validTypes = ['article', 'story', 'news', 'blog', 'book-excerpt', 'email', 'letter', 'poem', 'other'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de texto inválido', 400);
        return next(error);
      }
    }

    if (category) {
      const validCategories = ['daily-life', 'business', 'travel', 'culture', 'science', 'history', 'self-improvement', 'other'];
      if (!validCategories.includes(category)) {
        const error = new AppError('Categoría inválida', 400);
        return next(error);
      }
    }

    // Crear texto
    const text = await Text.create({
      user: userId,
      title: title.trim(),
      content: content.trim(),
      type: type || 'article',
      source: source || '',
      category: category || 'other',
      annotatedVocabulary: annotatedVocabulary || [],
      keyExpressions: keyExpressions || [],
      summary: summary || '',
      notes: notes || '',
      comprehensionNotes: comprehensionNotes || ''
    });

    logger.info(`✅ Texto creado: ${title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Texto agregado exitosamente',
      text
    });
  } catch (error) {
    logger.error(`❌ Error creando texto: ${error.message}`);
    next(error);
  }
};

// Obtener un texto específico
exports.getText = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const text = await Text.findOne({ _id: id, user: userId });

    if (!text) {
      const error = new AppError('Texto no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      text
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo texto: ${error.message}`);
    next(error);
  }
};

// Actualizar texto
exports.updateText = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, type, source, category, annotatedVocabulary, keyExpressions, summary, notes, comprehensionNotes, isFavorite } = req.body;

    const text = await Text.findOne({ _id: id, user: userId });

    if (!text) {
      const error = new AppError('Texto no encontrado', 404);
      return next(error);
    }

    // Validaciones
    if (type) {
      const validTypes = ['article', 'story', 'news', 'blog', 'book-excerpt', 'email', 'letter', 'poem', 'other'];
      if (!validTypes.includes(type)) {
        const error = new AppError('Tipo de texto inválido', 400);
        return next(error);
      }
    }

    if (category) {
      const validCategories = ['daily-life', 'business', 'travel', 'culture', 'science', 'history', 'self-improvement', 'other'];
      if (!validCategories.includes(category)) {
        const error = new AppError('Categoría inválida', 400);
        return next(error);
      }
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (type) updateData.type = type;
    if (source !== undefined) updateData.source = source;
    if (category) updateData.category = category;
    if (annotatedVocabulary) updateData.annotatedVocabulary = annotatedVocabulary;
    if (keyExpressions) updateData.keyExpressions = keyExpressions;
    if (summary !== undefined) updateData.summary = summary;
    if (notes !== undefined) updateData.notes = notes;
    if (comprehensionNotes !== undefined) updateData.comprehensionNotes = comprehensionNotes;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedText = await Text.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Texto actualizado: ${updatedText.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Texto actualizado exitosamente',
      text: updatedText
    });
  } catch (error) {
    logger.error(`❌ Error actualizando texto: ${error.message}`);
    next(error);
  }
};

// Eliminar texto
exports.deleteText = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const text = await Text.findOneAndDelete({ _id: id, user: userId });

    if (!text) {
      const error = new AppError('Texto no encontrado', 404);
      return next(error);
    }

    logger.info(`✅ Texto eliminado: ${text.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Texto eliminado exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando texto: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const text = await Text.findOne({ _id: id, user: userId });

    if (!text) {
      const error = new AppError('Texto no encontrado', 404);
      return next(error);
    }

    text.isFavorite = !text.isFavorite;
    await text.save();

    logger.info(`✅ Favorito actualizado: ${text.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Texto ${text.isFavorite ? 'agregado a' : 'eliminado de'} favoritos`,
      text
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Agregar vocabulario anotado
exports.addAnnotatedVocabulary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { word, meaning, position } = req.body;

    if (!word || !meaning) {
      const error = new AppError('La palabra y el significado son requeridos', 400);
      return next(error);
    }

    const text = await Text.findOne({ _id: id, user: userId });

    if (!text) {
      const error = new AppError('Texto no encontrado', 404);
      return next(error);
    }

    text.annotatedVocabulary.push({
      word: word.trim(),
      meaning: meaning.trim(),
      position: position || null
    });

    await text.save();

    logger.info(`✅ Vocabulario anotado en texto ${text.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Palabra anotada exitosamente',
      text
    });
  } catch (error) {
    logger.error(`❌ Error anotando vocabulario: ${error.message}`);
    next(error);
  }
};

// Agregar expresión clave
exports.addKeyExpression = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { expression, meaning } = req.body;

    if (!expression || !meaning) {
      const error = new AppError('La expresión y su significado son requeridos', 400);
      return next(error);
    }

    const text = await Text.findOne({ _id: id, user: userId });

    if (!text) {
      const error = new AppError('Texto no encontrado', 404);
      return next(error);
    }

    text.keyExpressions.push({
      expression: expression.trim(),
      meaning: meaning.trim()
    });

    await text.save();

    logger.info(`✅ Expresión clave agregada en texto ${text.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Expresión agregada exitosamente',
      text
    });
  } catch (error) {
    logger.error(`❌ Error agregando expresión: ${error.message}`);
    next(error);
  }
};

// Obtener textos por tipo
exports.getByType = async (req, res, next) => {
  try {
    const { textType } = req.params;
    const userId = req.user.id;

    const validTypes = ['article', 'story', 'news', 'blog', 'book-excerpt', 'email', 'letter', 'poem', 'other'];
    if (!validTypes.includes(textType)) {
      const error = new AppError('Tipo de texto inválido', 400);
      return next(error);
    }

    const texts = await Text.find({ user: userId, type: textType }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      type: textType,
      count: texts.length,
      texts
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo textos por tipo: ${error.message}`);
    next(error);
  }
};

// Obtener textos por categoría
exports.getByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const userId = req.user.id;

    const validCategories = ['daily-life', 'business', 'travel', 'culture', 'science', 'history', 'self-improvement', 'other'];
    if (!validCategories.includes(categoryName)) {
      const error = new AppError('Categoría inválida', 400);
      return next(error);
    }

    const texts = await Text.find({ user: userId, category: categoryName }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      category: categoryName,
      count: texts.length,
      texts
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo textos por categoría: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de textos
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalTexts = await Text.countDocuments({ user: userId });
    const favoriteTexts = await Text.countDocuments({ user: userId, isFavorite: true });
    const withVocabulary = await Text.countDocuments({ user: userId, annotatedVocabulary: { $exists: true, $ne: [] } });
    const withExpressions = await Text.countDocuments({ user: userId, keyExpressions: { $exists: true, $ne: [] } });

    // Contar por tipo
    const byType = await Text.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Contar por categoría
    const byCategory = await Text.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Total de palabras anotadas
    const totalAnnotatedWords = await Text.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: { $size: '$annotatedVocabulary' } } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalTexts,
        favoriteTexts,
        textsWithVocabulary: withVocabulary,
        textsWithExpressions: withExpressions,
        totalAnnotatedWords: totalAnnotatedWords[0]?.total || 0,
        byType,
        byCategory
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Obtener resumen de lectura
exports.getReadingSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const text = await Text.findOne({ _id: id, user: userId });

    if (!text) {
      const error = new AppError('Texto no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      summary: {
        title: text.title,
        type: text.type,
        category: text.category,
        wordCount: text.content.split(/\s+/).length,
        summary: text.summary,
        comprehensionNotes: text.comprehensionNotes,
        annotatedVocabularyCount: text.annotatedVocabulary.length,
        keyExpressionsCount: text.keyExpressions.length,
        isFavorite: text.isFavorite,
        source: text.source
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo resumen: ${error.message}`);
    next(error);
  }
};
