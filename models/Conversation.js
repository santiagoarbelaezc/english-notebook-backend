const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Usuario propietario
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido']
    },

    // Información básica
    title: {
      type: String,
      required: [true, 'El título de la conversación es requerido'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [200, 'El título no debe exceder 200 caracteres']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La descripción no debe exceder 1000 caracteres'],
      default: ''
    },

    // Tema de la conversación
    topic: {
      type: String,
      enum: {
        values: ['casual', 'formal', 'business', 'travel', 'daily-life', 'interview', 'other'],
        message: 'Tema inválido'
      },
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
      default: 0,
      min: [0, 'El conteo de mensajes no puede ser negativo']
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
    }
  },
  {
    // Usar timestamps automáticos de Mongoose en lugar de hooks manuales
    timestamps: { 
      createdAt: 'createdAt',
      updatedAt: 'updatedAt' 
    },
    
    // Opciones adicionales
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices para optimización
conversationSchema.index({ user: 1, createdAt: -1 }); // Para obtener conversaciones del usuario más recientes primero
conversationSchema.index({ user: 1, isFavorite: 1 });
conversationSchema.index({ user: 1, isArchived: 1 });
conversationSchema.index({ user: 1, topic: 1 });

// Virtual para obtener el último mensaje
conversationSchema.virtual('lastMessage', {
  ref: 'Message',
  localField: 'messages',
  foreignField: '_id',
  justOne: true,
  options: { 
    sort: { createdAt: -1 },
    limit: 1 
  }
});

// Middleware PRE-SAVE corregido (versión segura)
conversationSchema.pre('save', function(next) {
  try {
    console.log('=== PRE-SAVE CONVERSATION ===');
    console.log('Documento a guardar:', this.title);
    console.log('User ID:', this.user);
    
    // Solo actualizar updatedAt si el documento ya existe
    if (!this.isNew) {
      this.updatedAt = new Date();
    }
    
    // Validar que haya un next() disponible
    if (next && typeof next === 'function') {
      next();
    } else {
      console.log('WARNING: next() no disponible, continuando sin él');
      // No hacer nada, Mongoose continuará
    }
  } catch (error) {
    console.error('Error en pre-save hook:', error);
    if (next && typeof next === 'function') {
      next(error);
    }
  }
});

// Middleware POST-SAVE (para logging)
conversationSchema.post('save', function(doc, next) {
  try {
    console.log(`✅ Conversación guardada: ${doc.title} (ID: ${doc._id})`);
    console.log(`📊 Mensajes: ${doc.messageCount}`);
    
    if (next && typeof next === 'function') {
      next();
    }
  } catch (error) {
    console.error('Error en post-save hook:', error);
  }
});

// Middleware PRE-FIND para debugging
conversationSchema.pre('find', function(next) {
  console.log('🔍 Buscando conversaciones...');
  console.log('Filtros:', this.getFilter());
  if (next && typeof next === 'function') {
    next();
  }
});

// Middleware para incrementar messageCount automáticamente cuando se agrega un mensaje
conversationSchema.methods.addMessage = async function(messageId) {
  this.messages.push(messageId);
  this.messageCount = this.messages.length;
  this.lastMessageDate = new Date();
  return this.save();
};

// Método para formatear la respuesta
conversationSchema.methods.toJSON = function() {
  const conversation = this.toObject();
  
  // Remover campos internos si es necesario
  delete conversation.__v;
  
  return conversation;
};

// Método estático para obtener estadísticas
conversationSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$user',
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: '$messageCount' },
        favoriteConversations: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        archivedConversations: { $sum: { $cond: ['$isArchived', 1, 0] } },
        byTopic: { $push: { topic: '$topic', count: 1 } }
      }
    }
  ]);
  
  return stats[0] || {
    totalConversations: 0,
    totalMessages: 0,
    favoriteConversations: 0,
    archivedConversations: 0,
    byTopic: []
  };
};

module.exports = mongoose.model('Conversation', conversationSchema);