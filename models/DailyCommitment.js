const mongoose = require('mongoose');

const dailyCommitmentSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Meta diaria
    title: {
      type: String,
      required: [true, 'El título del compromiso es requerido'],
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    // Tipo de compromiso
    type: {
      type: String,
      enum: ['learn-words', 'study-grammar', 'practice-conversation', 'read-text', 'listen-song', 'custom'],
      required: true
    },

    // Objetivo
    goal: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['palabras', 'minutos', 'reglas', 'oraciones', 'líneas', 'custom'],
        required: true
      }
    },

    // Progreso actual
    progress: {
      current: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },

    // Recordatorio
    reminder: {
      enabled: {
        type: Boolean,
        default: true
      },
      time: String // Ej: "08:00"
    },

    // Frecuencia
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },

    // Fechas
    date: {
      type: Date,
      default: Date.now
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,

    // Estado
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    completedAt: Date,

    // Notas
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
dailyCommitmentSchema.index({ user: 1 });
dailyCommitmentSchema.index({ date: 1 });
dailyCommitmentSchema.index({ status: 1 });

// Middleware para calcular porcentaje
dailyCommitmentSchema.pre('save', function(next) {
  if (this.goal.value > 0) {
    this.progress.percentage = Math.min(
      Math.round((this.progress.current / this.goal.value) * 100),
      100
    );
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DailyCommitment', dailyCommitmentSchema);
