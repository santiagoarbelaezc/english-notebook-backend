const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Palabra/término
    word: {
      type: String,
      required: [true, 'La palabra es requerida'],
      trim: true,
      lowercase: true
    },

    // Pronunciación
    pronunciation: {
      type: String,
      default: ''
    },

    // Significado(s)
    meanings: [
      {
        meaning: {
          type: String,
          required: true
        },
        partOfSpeech: {
          type: String,
          enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection', 'other'],
          required: true
        },
        _id: false
      }
    ],

    // Ejemplos de uso
    examples: [
      {
        english: {
          type: String,
          required: true
        },
        spanish: {
          type: String,
          default: ''
        },
        _id: false
      }
    ],

    // Sinónimos y antónimos
    synonyms: [String],
    antonyms: [String],

    // Nivel de dificultad
    difficulty: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      default: 'A1'
    },

    // Categoría/Tema
    category: {
      type: String,
      enum: ['daily-life', 'business', 'travel', 'food', 'nature', 'technology', 'emotions', 'sports', 'other'],
      default: 'other'
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
vocabularySchema.index({ user: 1 });
vocabularySchema.index({ word: 1 });
vocabularySchema.index({ difficulty: 1 });
vocabularySchema.index({ isFavorite: 1 });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
