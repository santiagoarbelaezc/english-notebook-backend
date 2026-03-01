const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Categoría del componente
    category: {
      type: String,
      enum: [
        'vocabulary', 'grammar', 'conversation', 'text',
        'song', 'movie', 'flashcard', 'irregularVerb', 'streak'
      ],
      required: true
    },

    // Hito requerido
    milestone: {
      type: Number,
      required: true
    },

    // Información del logro
    title: {
      type: String,
      required: [true, 'El título del logro es requerido'],
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    // Icono/Badge
    icon: {
      type: String,
      default: '🏆'
    },

    // Estado de desbloqueo
    unlocked: {
      type: Boolean,
      default: false
    },

    // Fecha de desbloqueo
    unlockedDate: {
      type: Date,
      default: null
    },

    // Experiencia otorgada
    xpReward: {
      type: Number,
      required: true,
      default: 0
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
achievementSchema.index({ user: 1, category: 1, milestone: 1 }, { unique: true });
achievementSchema.index({ user: 1, unlocked: 1 });
achievementSchema.index({ unlockedDate: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
