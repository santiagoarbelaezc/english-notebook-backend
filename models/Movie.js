const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Información básica
    title: {
      type: String,
      required: [true, 'El título de la película es requerido'],
      trim: true
    },

    // Opinión del usuario
    opinion: {
      type: String,
      required: [true, 'La opinión es requerida'],
      trim: true
    },

    // Imagen de la película (URL de Cloudinary)
    posterImage: {
      type: String,
      default: null
    },

    // Frases de la película
    quotes: [
      {
        text: {
          type: String,
          required: true
        },
        translation: {
          type: String,
          default: ''
        },
        character: {
          type: String,
          default: ''
        },
        timestamp: String, // Ej: "01:23:45"
        _id: false
      }
    ],

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
movieSchema.index({ user: 1 });
movieSchema.index({ title: 1 });
movieSchema.index({ isFavorite: 1 });

module.exports = mongoose.model('Movie', movieSchema);
