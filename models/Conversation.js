const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
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
      required: [true, 'El título de la conversación es requerido'],
      trim: true,
      maxlength: [200, 'El título no debe exceder 200 caracteres']
    },
    description: {
      type: String,
      maxlength: [1000, 'La descripción no debe exceder 1000 caracteres'],
      default: ''
    },

    // Tema de la conversación
    topic: {
      type: String,
      enum: ['casual', 'formal', 'business', 'travel', 'daily-life', 'interview', 'other'],
      default: 'casual'
    },

    // Mensajes (referencias)
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      }
    ],

    // Estadísticas
    messageCount: {
      type: Number,
      default: 0
    },
    lastMessageDate: {
      type: Date,
      default: null
    },

    // Métadata
    isArchived: {
      type: Boolean,
      default: false
    },
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
conversationSchema.index({ user: 1 });
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ isFavorite: 1 });

// Middleware para actualizar updatedAt
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
