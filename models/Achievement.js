const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

    // Tipo de logro
    type: {
      type: String,
      enum: ['vocabulary', 'grammar', 'conversation', 'reading', 'milestone', 'streak', 'custom'],
      required: true
    },

    // Icono/Badge
    icon: {
      type: String,
      default: '🏆'
    },

    // Fecha de obtención
    unlockedDate: {
      type: Date,
      default: Date.now
    },

    // Detalles específicos
    details: {
      value: Number, // Ej: 50 palabras aprendidas
      target: Number, // Meta
      unit: String // Ej: "palabras", "días"
    },

    // Progreso
    progress: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    // Puntos o recompensa
    points: {
      type: Number,
      default: 0
    },

    // Notas personales
    notes: {
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
achievementSchema.index({ user: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ unlockedDate: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
