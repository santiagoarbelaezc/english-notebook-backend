const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Información de la canción
    title: {
      type: String,
      required: [true, 'El título de la canción es requerido'],
      trim: true
    },

    artist: {
      type: String,
      required: [true, 'El artista es requerido'],
      trim: true
    },

    // Imagen/Portada (URL de Cloudinary)
    coverImage: {
      type: String,
      default: null
    },

    // Contenido de la canción
    lyrics: {
      type: String,
      required: [true, 'La letra es requerida']
    },

    // URL de la canción o video
    youtubeUrl: {
      type: String,
      default: null
    },
    spotifyUrl: {
      type: String,
      default: null
    },

    // Vocabulario relacionado (anotaciones del usuario)
    annotatedVocabulary: [
      {
        word: {
          type: String,
          required: true
        },
        meaning: {
          type: String,
          required: true
        },
        line: Number, // Número de línea donde aparece
        _id: false
      }
    ],

    // Expresiones o frases importantes
    keyPhrases: [
      {
        phrase: String,
        meaning: String,
        explanation: String,
        _id: false
      }
    ],

    // Tema/Categoría
    topic: {
      type: String,
      enum: ['love', 'motivation', 'adventure', 'daily-life', 'nature', 'friendship', 'other'],
      default: 'other'
    },

    // Notas del usuario
    notes: {
      type: String,
      maxlength: [2000, 'Las notas no deben exceder 2000 caracteres'],
      default: ''
    },

    // Traducción completa (opcional)
    translation: {
      type: String,
      default: ''
    },

    // Marcadores
    isFavorite: {
      type: Boolean,
      default: false
    },

    // Auditoría
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Índices
songSchema.index({ user: 1 });
songSchema.index({ title: 1 });
songSchema.index({ difficulty: 1 });
songSchema.index({ isFavorite: 1 });

module.exports = mongoose.model('Song', songSchema);
