const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Información de la tarjeta
    front: {
      type: String,
      required: [true, 'El frente de la tarjeta es requerido'],
      trim: true
    },

    back: {
      type: String,
      required: [true, 'El reverso de la tarjeta es requerido'],
      trim: true
    },

    // Categoría/Mazo
    deck: {
      type: String,
      required: true,
      default: 'General'
    },

    // Dificultad
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },

    // Estadísticas de aprendizaje
    statistics: {
      timesReviewed: {
        type: Number,
        default: 0
      },
      timesCorrect: {
        type: Number,
        default: 0
      },
      timesIncorrect: {
        type: Number,
        default: 0
      },
      lastReviewDate: Date,
      nextReviewDate: Date,
      interval: {
        type: Number,
        default: 1 // Días hasta próxima revisión
      }
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
flashcardSchema.index({ user: 1 });
flashcardSchema.index({ deck: 1 });
flashcardSchema.index({ 'statistics.nextReviewDate': 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
