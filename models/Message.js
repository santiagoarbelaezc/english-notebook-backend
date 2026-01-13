const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Referencia a la conversación
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },

    // Usuario (siempre el propietario)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Contenido del mensaje
    content: {
      type: String,
      required: [true, 'El contenido del mensaje es requerido'],
      trim: true
    },

    // Tipo de rol
    role: {
      type: String,
      enum: ['you', 'other'],
      required: true,
      description: 'you = tu mensaje, other = respuesta del otro'
    },

    // Correcciones o notas (opcionales)
    correction: {
      text: String,
      explanation: String
    },

    // Auditoría
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Índices
messageSchema.index({ conversation: 1 });
messageSchema.index({ user: 1 });
messageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
