const IrregularVerb = require('../models/IrregularVerb');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Obtener todos los verbos irregulares del usuario
exports.getAllVerbs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { difficulty, isFavorite, search } = req.query;

    const filter = { user: userId };

    if (difficulty) {
      const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
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
        { infinitive: { $regex: search, $options: 'i' } },
        { pastSimple: { $regex: search, $options: 'i' } },
        { pastParticiple: { $regex: search, $options: 'i' } }
      ];
    }

    const verbs = await IrregularVerb.find(filter).sort({ infinitive: 1 });

    res.status(200).json({
      success: true,
      count: verbs.length,
      verbs
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo verbos irregulares: ${error.message}`);
    next(error);
  }
};

// Crear nuevo verbo irregular
exports.createVerb = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { infinitive, pastSimple, pastParticiple, pronunciation, examples, difficulty, notes } = req.body;

    // Validaciones
    if (!infinitive) {
      const error = new AppError('El infinitivo es requerido', 400);
      return next(error);
    }

    if (!pastSimple) {
      const error = new AppError('El pasado simple es requerido', 400);
      return next(error);
    }

    if (!pastParticiple) {
      const error = new AppError('El participio pasado es requerido', 400);
      return next(error);
    }

    // Validar dificultad
    if (difficulty) {
      const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    // Verificar que no esté duplicado
    const exists = await IrregularVerb.findOne({
      user: userId,
      infinitive: infinitive.toLowerCase().trim()
    });

    if (exists) {
      const error = new AppError('Este verbo ya existe en tu lista', 400);
      return next(error);
    }

    // Crear verbo
    const verb = await IrregularVerb.create({
      user: userId,
      infinitive: infinitive.toLowerCase().trim(),
      pastSimple: pastSimple.toLowerCase().trim(),
      pastParticiple: pastParticiple.toLowerCase().trim(),
      pronunciation: pronunciation || {},
      examples: examples || [],
      difficulty: difficulty || 'A1',
      notes: notes || ''
    });

    logger.info(`✅ Verbo irregular agregado: ${infinitive} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Verbo irregular agregado exitosamente',
      verb
    });
  } catch (error) {
    logger.error(`❌ Error creando verbo irregular: ${error.message}`);
    next(error);
  }
};

// Obtener un verbo específico
exports.getVerb = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const verb = await IrregularVerb.findOne({ _id: id, user: userId });

    if (!verb) {
      const error = new AppError('Verbo irregular no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      verb
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo verbo irregular: ${error.message}`);
    next(error);
  }
};

// Actualizar verbo irregular
exports.updateVerb = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { infinitive, pastSimple, pastParticiple, pronunciation, examples, difficulty, notes, isFavorite } = req.body;

    const verb = await IrregularVerb.findOne({ _id: id, user: userId });

    if (!verb) {
      const error = new AppError('Verbo irregular no encontrado', 404);
      return next(error);
    }

    // Validar dificultad si se proporciona
    if (difficulty) {
      const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      if (!validDifficulties.includes(difficulty)) {
        const error = new AppError('Dificultad inválida', 400);
        return next(error);
      }
    }

    // Verificar duplicados si cambia el infinitivo
    if (infinitive && infinitive.toLowerCase().trim() !== verb.infinitive) {
      const exists = await IrregularVerb.findOne({
        user: userId,
        infinitive: infinitive.toLowerCase().trim(),
        _id: { $ne: id }
      });

      if (exists) {
        const error = new AppError('Este verbo ya existe en tu lista', 400);
        return next(error);
      }
    }

    const updateData = {};

    if (infinitive) updateData.infinitive = infinitive.toLowerCase().trim();
    if (pastSimple) updateData.pastSimple = pastSimple.toLowerCase().trim();
    if (pastParticiple) updateData.pastParticiple = pastParticiple.toLowerCase().trim();
    if (pronunciation) updateData.pronunciation = pronunciation;
    if (examples) updateData.examples = examples;
    if (difficulty) updateData.difficulty = difficulty;
    if (notes !== undefined) updateData.notes = notes;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedVerb = await IrregularVerb.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Verbo irregular actualizado: ${updatedVerb.infinitive} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Verbo irregular actualizado exitosamente',
      verb: updatedVerb
    });
  } catch (error) {
    logger.error(`❌ Error actualizando verbo irregular: ${error.message}`);
    next(error);
  }
};

// Eliminar verbo irregular
exports.deleteVerb = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const verb = await IrregularVerb.findOneAndDelete({ _id: id, user: userId });

    if (!verb) {
      const error = new AppError('Verbo irregular no encontrado', 404);
      return next(error);
    }

    logger.info(`✅ Verbo irregular eliminado: ${verb.infinitive} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Verbo irregular eliminado exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando verbo irregular: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const verb = await IrregularVerb.findOne({ _id: id, user: userId });

    if (!verb) {
      const error = new AppError('Verbo irregular no encontrado', 404);
      return next(error);
    }

    verb.isFavorite = !verb.isFavorite;
    await verb.save();

    logger.info(`✅ Favorito actualizado: ${verb.infinitive} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Verbo ${verb.isFavorite ? 'agregado a' : 'eliminado de'} favoritos`,
      verb
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Obtener verbos por dificultad
exports.getByDifficulty = async (req, res, next) => {
  try {
    const { level } = req.params;
    const userId = req.user.id;

    const validDifficulties = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validDifficulties.includes(level)) {
      const error = new AppError('Nivel de dificultad inválido', 400);
      return next(error);
    }

    const verbs = await IrregularVerb.find({ user: userId, difficulty: level }).sort({ infinitive: 1 });

    res.status(200).json({
      success: true,
      level,
      count: verbs.length,
      verbs
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo verbos por dificultad: ${error.message}`);
    next(error);
  }
};

// Agregar ejemplo
exports.addExample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { infinitive, pastSimple, pastParticiple } = req.body;

    if (!infinitive || !pastSimple || !pastParticiple) {
      const error = new AppError('Los tres tiempos verbales son requeridos para el ejemplo', 400);
      return next(error);
    }

    const verb = await IrregularVerb.findOne({ _id: id, user: userId });

    if (!verb) {
      const error = new AppError('Verbo irregular no encontrado', 404);
      return next(error);
    }

    verb.examples.push({
      infinitive: infinitive.trim(),
      pastSimple: pastSimple.trim(),
      pastParticiple: pastParticiple.trim()
    });

    await verb.save();

    logger.info(`✅ Ejemplo agregado al verbo ${verb.infinitive} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Ejemplo agregado exitosamente',
      verb
    });
  } catch (error) {
    logger.error(`❌ Error agregando ejemplo: ${error.message}`);
    next(error);
  }
};

// Eliminar ejemplo
exports.removeExample = async (req, res, next) => {
  try {
    const { id, exampleIndex } = req.params;
    const userId = req.user.id;

    const verb = await IrregularVerb.findOne({ _id: id, user: userId });

    if (!verb) {
      const error = new AppError('Verbo irregular no encontrado', 404);
      return next(error);
    }

    const index = parseInt(exampleIndex);

    if (isNaN(index) || index < 0 || index >= verb.examples.length) {
      const error = new AppError('Índice de ejemplo inválido', 400);
      return next(error);
    }

    verb.examples.splice(index, 1);
    await verb.save();

    logger.info(`✅ Ejemplo eliminado del verbo ${verb.infinitive} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Ejemplo eliminado exitosamente',
      verb
    });
  } catch (error) {
    logger.error(`❌ Error eliminando ejemplo: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de verbos irregulares
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalVerbs = await IrregularVerb.countDocuments({ user: userId });
    const favoriteVerbs = await IrregularVerb.countDocuments({ user: userId, isFavorite: true });
    const withExamples = await IrregularVerb.countDocuments({ user: userId, examples: { $exists: true, $ne: [] } });

    // Contar por dificultad
    const byDifficulty = await IrregularVerb.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalVerbs,
        favoriteVerbs,
        verbsWithExamples: withExamples,
        byDifficulty
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Obtener conjugaciones rápidas (todas las formas)
exports.getConjugations = async (req, res, next) => {
  try {
    const { infinitive } = req.query;
    const userId = req.user.id;

    if (!infinitive) {
      const error = new AppError('El infinitivo es requerido', 400);
      return next(error);
    }

    const verb = await IrregularVerb.findOne({
      user: userId,
      infinitive: infinitive.toLowerCase().trim()
    });

    if (!verb) {
      const error = new AppError('Verbo no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      conjugations: {
        infinitive: verb.infinitive,
        pastSimple: verb.pastSimple,
        pastParticiple: verb.pastParticiple,
        pronunciation: verb.pronunciation
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo conjugaciones: ${error.message}`);
    next(error);
  }
};
