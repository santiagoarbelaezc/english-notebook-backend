const mongoose = require('mongoose');

const textSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Información del texto
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true
    },

    content: {
      type: String,
      required: [true, 'El contenido es requerido']
    },

    // Tipo de texto
    type: {
      type: String,
      enum: ['article', 'story', 'news', 'blog', 'book-excerpt', 'email', 'letter', 'poem', 'other'],
      default: 'article'
    },

    // Fuente/URL original
    source: {
      type: String,
      default: ''
    },

    // Tema/Categoría
    category: {
      type: String,
      enum: ['daily-life', 'business', 'travel', 'culture', 'science', 'history', 'self-improvement', 'other'],
      default: 'other'
    },

    // Vocabulario anotado
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
        position: Number, // Posición en el texto
        _id: false
      }
    ],

    // Expresiones importantes
    keyExpressions: [
      {
        expression: String,
        meaning: String,
        _id: false
      }
    ],

    // Resumen/Análisis
    summary: {
      type: String,
      maxlength: [500, 'El resumen no debe exceder 500 caracteres'],
      default: ''
    },

    // Notas personales
    notes: {
      type: String,
      maxlength: [2000, 'Las notas no deben exceder 2000 caracteres'],
      default: ''
    },

    // Marcadores
    isFavorite: {
      type: Boolean,
      default: false
    },

    // Comprensión (opcional)
    comprehensionNotes: {
      type: String,
      default: ''
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
textSchema.index({ user: 1 });
textSchema.index({ title: 1 });
textSchema.index({ difficulty: 1 });
textSchema.index({ type: 1 });

module.exports = mongoose.model('Text', textSchema);
