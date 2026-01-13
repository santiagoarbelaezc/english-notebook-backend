const mongoose = require('mongoose');

const dailyPhraseSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Frase/Expresión
    phrase: {
      type: String,
      required: [true, 'La frase es requerida'],
      trim: true
    },

    // Traducción
    translation: {
      type: String,
      required: [true, 'La traducción es requerida'],
      trim: true
    },

    // Tipo de frase
    type: {
      type: String,
      enum: ['idiom', 'expression', 'slang', 'proverb', 'quote', 'phrase', 'saying'],
      default: 'phrase'
    },

    // Palabras clave
    keywords: [String],

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
dailyPhraseSchema.index({ user: 1 });
dailyPhraseSchema.index({ phrase: 1 });
dailyPhraseSchema.index({ type: 1 });
dailyPhraseSchema.index({ isFavorite: 1 });

module.exports = mongoose.model('DailyPhrase', dailyPhraseSchema);
