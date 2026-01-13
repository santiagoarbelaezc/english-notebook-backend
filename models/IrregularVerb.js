const mongoose = require('mongoose');

const irregularVerbSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Formas del verbo irregular
    infinitive: {
      type: String,
      required: [true, 'El infinitivo es requerido'],
      trim: true,
      lowercase: true
    },

    pastSimple: {
      type: String,
      required: [true, 'El pasado simple es requerido'],
      trim: true,
      lowercase: true
    },

    pastParticiple: {
      type: String,
      required: [true, 'El participio pasado es requerido'],
      trim: true,
      lowercase: true
    },

    // Pronunciación (opcional)
    pronunciation: {
      infinitive: String,
      pastSimple: String,
      pastParticiple: String
    },

    // Ejemplos de uso
    examples: [
      {
        infinitive: String,
        pastSimple: String,
        pastParticiple: String,
        _id: false
      }
    ],

    // Nivel de dificultad
    difficulty: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      default: 'A1'
    },

    // Notas personales
    notes: {
      type: String,
      maxlength: [500, 'Las notas no deben exceder 500 caracteres'],
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
irregularVerbSchema.index({ user: 1 });
irregularVerbSchema.index({ infinitive: 1 });
irregularVerbSchema.index({ difficulty: 1 });
irregularVerbSchema.index({ isFavorite: 1 });

module.exports = mongoose.model('IrregularVerb', irregularVerbSchema);
