const Song = require('../models/Song');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } = require('../utils/cloudinaryHelper');

// Obtener todas las canciones del usuario
exports.getAllSongs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { topic, isFavorite, search } = req.query;

    const filter = { user: userId };

    if (topic) {
      const validTopics = ['love', 'motivation', 'adventure', 'daily-life', 'nature', 'friendship', 'other'];
      if (!validTopics.includes(topic)) {
        const error = new AppError('Tema inválido', 400);
        return next(error);
      }
      filter.topic = topic;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }

    const songs = await Song.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: songs.length,
      songs
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo canciones: ${error.message}`);
    next(error);
  }
};

// Crear nueva canción
exports.createSong = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, artist, lyrics, youtubeUrl, spotifyUrl, topic, notes, translation, coverImage, annotatedVocabulary, keyPhrases } = req.body;

    // Validaciones
    if (!title) {
      const error = new AppError('El título es requerido', 400);
      return next(error);
    }

    if (!artist) {
      const error = new AppError('El artista es requerido', 400);
      return next(error);
    }

    if (!lyrics) {
      const error = new AppError('La letra es requerida', 400);
      return next(error);
    }

    // Crear canción
    const song = await Song.create({
      user: userId,
      title: title.trim(),
      artist: artist.trim(),
      lyrics: lyrics.trim(),
      youtubeUrl: youtubeUrl || null,
      spotifyUrl: spotifyUrl || null,
      topic: topic || 'other',
      notes: notes || '',
      translation: translation || '',
      coverImage: coverImage || null,
      annotatedVocabulary: annotatedVocabulary || [],
      keyPhrases: keyPhrases || []
    });

    logger.info(`✅ Canción agregada: ${title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Canción agregada exitosamente',
      song
    });
  } catch (error) {
    logger.error(`❌ Error creando canción: ${error.message}`);
    next(error);
  }
};

// Obtener una canción específica
exports.getSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const song = await Song.findOne({ _id: id, user: userId });

    if (!song) {
      const error = new AppError('Canción no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      song
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo canción: ${error.message}`);
    next(error);
  }
};

// Actualizar canción
exports.updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, artist, lyrics, youtubeUrl, spotifyUrl, topic, notes, translation, coverImage, annotatedVocabulary, keyPhrases, isFavorite } = req.body;

    const song = await Song.findOne({ _id: id, user: userId });

    if (!song) {
      const error = new AppError('Canción no encontrada', 404);
      return next(error);
    }

    // Validar tema si se proporciona
    if (topic) {
      const validTopics = ['love', 'motivation', 'adventure', 'daily-life', 'nature', 'friendship', 'other'];
      if (!validTopics.includes(topic)) {
        const error = new AppError('Tema inválido', 400);
        return next(error);
      }
    }

    const updateData = {};

    if (title) updateData.title = title.trim();
    if (artist) updateData.artist = artist.trim();
    if (lyrics) updateData.lyrics = lyrics.trim();
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (spotifyUrl !== undefined) updateData.spotifyUrl = spotifyUrl;
    if (topic) updateData.topic = topic;
    if (notes !== undefined) updateData.notes = notes;
    if (translation !== undefined) updateData.translation = translation;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (annotatedVocabulary) updateData.annotatedVocabulary = annotatedVocabulary;
    if (keyPhrases) updateData.keyPhrases = keyPhrases;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedSong = await Song.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    logger.info(`✅ Canción actualizada: ${updatedSong.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Canción actualizada exitosamente',
      song: updatedSong
    });
  } catch (error) {
    logger.error(`❌ Error actualizando canción: ${error.message}`);
    next(error);
  }
};

// Eliminar canción
exports.deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const song = await Song.findOneAndDelete({ _id: id, user: userId });

    if (!song) {
      const error = new AppError('Canción no encontrada', 404);
      return next(error);
    }

    logger.info(`✅ Canción eliminada: ${song.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Canción eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando canción: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const song = await Song.findOne({ _id: id, user: userId });

    if (!song) {
      const error = new AppError('Canción no encontrada', 404);
      return next(error);
    }

    song.isFavorite = !song.isFavorite;
    await song.save();

    logger.info(`✅ Favorito actualizado: ${song.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Canción ${song.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`,
      song
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Obtener canciones por tema
exports.getByTopic = async (req, res, next) => {
  try {
    const { topicName } = req.params;
    const userId = req.user.id;

    const validTopics = ['love', 'motivation', 'adventure', 'daily-life', 'nature', 'friendship', 'other'];
    if (!validTopics.includes(topicName)) {
      const error = new AppError('Tema inválido', 400);
      return next(error);
    }

    const songs = await Song.find({ user: userId, topic: topicName }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      topic: topicName,
      count: songs.length,
      songs
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo canciones por tema: ${error.message}`);
    next(error);
  }
};

// Agregar vocabulario anotado
exports.addAnnotatedWord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { word, meaning, line } = req.body;

    if (!word || !meaning) {
      const error = new AppError('La palabra y el significado son requeridos', 400);
      return next(error);
    }

    const song = await Song.findOne({ _id: id, user: userId });

    if (!song) {
      const error = new AppError('Canción no encontrada', 404);
      return next(error);
    }

    song.annotatedVocabulary.push({
      word: word.trim(),
      meaning: meaning.trim(),
      line: line || null
    });

    await song.save();

    logger.info(`✅ Vocabulario anotado en canción ${song.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Palabra anotada exitosamente',
      song
    });
  } catch (error) {
    logger.error(`❌ Error anotando vocabulario: ${error.message}`);
    next(error);
  }
};

// Agregar frase clave
exports.addKeyPhrase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { phrase, meaning, explanation } = req.body;

    if (!phrase || !meaning) {
      const error = new AppError('La frase y el significado son requeridos', 400);
      return next(error);
    }

    const song = await Song.findOne({ _id: id, user: userId });

    if (!song) {
      const error = new AppError('Canción no encontrada', 404);
      return next(error);
    }

    song.keyPhrases.push({
      phrase: phrase.trim(),
      meaning: meaning.trim(),
      explanation: explanation || ''
    });

    await song.save();

    logger.info(`✅ Frase clave agregada en canción ${song.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Frase clave agregada exitosamente',
      song
    });
  } catch (error) {
    logger.error(`❌ Error agregando frase clave: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de canciones
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalSongs = await Song.countDocuments({ user: userId });
    const favoriteSongs = await Song.countDocuments({ user: userId, isFavorite: true });

    // Contar por tema
    const byTopic = await Song.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$topic', count: { $sum: 1 } } }
    ]);

    // Total de palabras anotadas
    const totalAnnotatedWords = await Song.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: { $size: '$annotatedVocabulary' } } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSongs,
        favoriteSongs,
        totalAnnotatedWords: totalAnnotatedWords[0]?.total || 0,
        byTopic
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};

// Subir portada de la canción
exports.uploadCoverImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que se subió un archivo
    if (!req.file) {
      const error = new AppError('No se proporcionó ningún archivo', 400);
      return next(error);
    }

    const song = await Song.findOne({ _id: id, user: userId });

    if (!song) {
      const error = new AppError('Canción no encontrada', 404);
      return next(error);
    }

    logger.info(`📤 Subiendo portada para canción "${song.title}" del usuario ${req.user.username}...`);

    // Subir a Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.path, {
      public_id: `song_cover_${id}_${Date.now()}`,
      transformation: [
        { width: 500, height: 500, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    if (!uploadResult.success) {
      const error = new AppError(`Error subiendo imagen: ${uploadResult.error}`, 500);
      return next(error);
    }

    // Si había una portada anterior, eliminarla de Cloudinary
    if (song.coverImage) {
      const oldPublicId = extractPublicIdFromUrl(song.coverImage);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Actualizar canción con nueva portada
    song.coverImage = uploadResult.data.url;
    song.updatedAt = Date.now();
    await song.save();

    logger.info(`✅ Portada de canción actualizada: "${song.title}" para usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Portada de canción actualizada exitosamente',
      coverImage: {
        url: uploadResult.data.url,
        publicId: uploadResult.data.public_id,
        width: uploadResult.data.width,
        height: uploadResult.data.height
      }
    });
  } catch (error) {
    logger.error(`❌ Error subiendo portada: ${error.message}`);
    next(error);
  }
};
