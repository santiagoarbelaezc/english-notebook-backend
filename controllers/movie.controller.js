const Movie = require('../models/Movie');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

// Obtener todas las películas del usuario
exports.getAllMovies = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { isFavorite, search } = req.query;

    const filter = { user: userId };

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { opinion: { $regex: search, $options: 'i' } },
        { 'quotes.text': { $regex: search, $options: 'i' } }
      ];
    }

    const movies = await Movie.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo películas: ${error.message}`);
    next(error);
  }
};

// Crear nueva película
exports.createMovie = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, opinion, posterImage, quotes } = req.body;

    // Validaciones
    if (!title) {
      const error = new AppError('El título de la película es requerido', 400);
      return next(error);
    }

    if (!opinion) {
      const error = new AppError('La opinión es requerida', 400);
      return next(error);
    }

    // Crear película
    const movie = await Movie.create({
      user: userId,
      title: title.trim(),
      opinion: opinion.trim(),
      posterImage: posterImage || null,
      quotes: quotes || []
    });

    logger.info(`✅ Película creada: ${title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Película agregada exitosamente',
      movie
    });
  } catch (error) {
    logger.error(`❌ Error creando película: ${error.message}`);
    next(error);
  }
};

// Obtener una película específica
exports.getMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const movie = await Movie.findOne({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      movie
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo película: ${error.message}`);
    next(error);
  }
};

// Actualizar película
exports.updateMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, opinion, posterImage, isFavorite } = req.body;

    const movie = await Movie.findOne({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (opinion) updateData.opinion = opinion.trim();
    if (posterImage !== undefined) updateData.posterImage = posterImage;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Película actualizada: ${updatedMovie.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Película actualizada exitosamente',
      movie: updatedMovie
    });
  } catch (error) {
    logger.error(`❌ Error actualizando película: ${error.message}`);
    next(error);
  }
};

// Eliminar película
exports.deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const movie = await Movie.findOneAndDelete({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    logger.info(`✅ Película eliminada: ${movie.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Película eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando película: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const movie = await Movie.findOne({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    movie.isFavorite = !movie.isFavorite;
    await movie.save();

    logger.info(`✅ Favorito actualizado: ${movie.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Película ${movie.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`,
      movie
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Agregar frase/quote
exports.addQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { text, translation, character, timestamp } = req.body;

    if (!text) {
      const error = new AppError('El texto de la frase es requerido', 400);
      return next(error);
    }

    const movie = await Movie.findOne({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    movie.quotes.push({
      text: text.trim(),
      translation: translation || '',
      character: character || '',
      timestamp: timestamp || null
    });

    await movie.save();

    logger.info(`✅ Frase agregada a película ${movie.title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Frase agregada exitosamente',
      movie
    });
  } catch (error) {
    logger.error(`❌ Error agregando frase: ${error.message}`);
    next(error);
  }
};

// Obtener todas las frases de una película
exports.getQuotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const movie = await Movie.findOne({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      movie: movie.title,
      count: movie.quotes.length,
      quotes: movie.quotes
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo frases: ${error.message}`);
    next(error);
  }
};

// Actualizar una frase específica
exports.updateQuote = async (req, res, next) => {
  try {
    const { id, quoteIndex } = req.params;
    const userId = req.user.id;
    const { text, translation, character, timestamp } = req.body;

    const movie = await Movie.findOne({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    if (!movie.quotes[quoteIndex]) {
      const error = new AppError('Frase no encontrada', 404);
      return next(error);
    }

    if (text) movie.quotes[quoteIndex].text = text.trim();
    if (translation !== undefined) movie.quotes[quoteIndex].translation = translation;
    if (character !== undefined) movie.quotes[quoteIndex].character = character;
    if (timestamp !== undefined) movie.quotes[quoteIndex].timestamp = timestamp;

    await movie.save();

    logger.info(`✅ Frase actualizada en película ${movie.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Frase actualizada exitosamente',
      movie
    });
  } catch (error) {
    logger.error(`❌ Error actualizando frase: ${error.message}`);
    next(error);
  }
};

// Eliminar una frase específica
exports.deleteQuote = async (req, res, next) => {
  try {
    const { id, quoteIndex } = req.params;
    const userId = req.user.id;

    const movie = await Movie.findOne({ _id: id, user: userId });

    if (!movie) {
      const error = new AppError('Película no encontrada', 404);
      return next(error);
    }

    if (!movie.quotes[quoteIndex]) {
      const error = new AppError('Frase no encontrada', 404);
      return next(error);
    }

    const deletedQuote = movie.quotes[quoteIndex];
    movie.quotes.splice(quoteIndex, 1);

    await movie.save();

    logger.info(`✅ Frase eliminada de película ${movie.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Frase eliminada exitosamente',
      deletedQuote,
      movie
    });
  } catch (error) {
    logger.error(`❌ Error eliminando frase: ${error.message}`);
    next(error);
  }
};

// Obtener películas favoritas
exports.getFavoriteMovies = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const movies = await Movie.find({ user: userId, isFavorite: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo películas favoritas: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de películas
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalMovies = await Movie.countDocuments({ user: userId });
    const favoriteMovies = await Movie.countDocuments({ user: userId, isFavorite: true });

    // Total de frases
    const totalQuotes = await Movie.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: { $size: '$quotes' } } } }
    ]);

    // Películas con frases
    const moviesWithQuotes = await Movie.countDocuments({
      user: userId,
      quotes: { $exists: true, $ne: [] }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        favoriteMovies,
        moviesWithQuotes,
        totalQuotes: totalQuotes[0]?.total || 0,
        averageQuotesPerMovie: totalMovies > 0 ? ((totalQuotes[0]?.total || 0) / totalMovies).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Buscar películas por opinión
exports.searchByOpinion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { query } = req.query;

    if (!query) {
      const error = new AppError('El parámetro de búsqueda es requerido', 400);
      return next(error);
    }

    const movies = await Movie.find({
      user: userId,
      opinion: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    logger.error(`❌ Error buscando películas: ${error.message}`);
    next(error);
  }
};
