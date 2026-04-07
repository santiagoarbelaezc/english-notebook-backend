const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { chatWithTutor } = require('../utils/groqClient');

// ============================================
// CONVERSACIONES
// ============================================

// Obtener todas las conversaciones del usuario
exports.getAllConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { topic, isFavorite, isArchived, search } = req.query;

    const filter = { user: userId };

    if (topic) {
      const validTopics = ['casual', 'formal', 'business', 'travel', 'daily-life', 'interview', 'other'];
      if (!validTopics.includes(topic)) {
        const error = new AppError('Tema inválido', 400);
        return next(error);
      }
      filter.topic = topic;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    if (isArchived === 'true') {
      filter.isArchived = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await Conversation.find(filter)
      .populate({
        path: 'messages',
        options: { limit: 1, sort: { createdAt: -1 } }
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo conversaciones: ${error.message}`);
    next(error);
  }
};

// Crear nueva conversación
exports.createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, topic } = req.body;

    // Validaciones
    if (!title) {
      const error = new AppError('El título es requerido', 400);
      return next(error);
    }

    if (title.length < 3) {
      const error = new AppError('El título debe tener al menos 3 caracteres', 400);
      return next(error);
    }

    // Crear conversación
    const conversation = await Conversation.create({
      user: userId,
      title: title.trim(),
      description: description || '',
      topic: topic || 'casual'
    });

    logger.info(`✅ Conversación creada: ${title} por usuario ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Conversación creada exitosamente',
      conversation
    });
  } catch (error) {
    logger.error(`❌ Error creando conversación: ${error.message}`);
    next(error);
  }
};

// Obtener una conversación específica con sus mensajes
exports.getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({ _id: id, user: userId })
      .populate({
        path: 'messages',
        options: { sort: { createdAt: 1 } }
      });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo conversación: ${error.message}`);
    next(error);
  }
};

// Actualizar conversación
exports.updateConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, topic } = req.body;

    const conversation = await Conversation.findOne({ _id: id, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    const updateData = {};

    if (title) {
      if (title.length < 3) {
        const error = new AppError('El título debe tener al menos 3 caracteres', 400);
        return next(error);
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (topic) {
      const validTopics = ['casual', 'formal', 'business', 'travel', 'daily-life', 'interview', 'other'];
      if (!validTopics.includes(topic)) {
        const error = new AppError('Tema inválido', 400);
        return next(error);
      }
      updateData.topic = topic;
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(id, updateData, { new: true });

    logger.info(`✅ Conversación actualizada: ${updatedConversation.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Conversación actualizada exitosamente',
      conversation: updatedConversation
    });
  } catch (error) {
    logger.error(`❌ Error actualizando conversación: ${error.message}`);
    next(error);
  }
};

// Eliminar conversación
exports.deleteConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({ _id: id, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    // Eliminar todos los mensajes
    await Message.deleteMany({ conversation: id });

    // Eliminar conversación
    await Conversation.findByIdAndDelete(id);

    logger.info(`✅ Conversación eliminada: ${conversation.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Conversación eliminada exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando conversación: ${error.message}`);
    next(error);
  }
};

// Toggle favorito
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({ _id: id, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    conversation.isFavorite = !conversation.isFavorite;
    await conversation.save();

    logger.info(`✅ Favorito actualizado: ${conversation.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Conversación ${conversation.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`,
      conversation
    });
  } catch (error) {
    logger.error(`❌ Error toggleando favorito: ${error.message}`);
    next(error);
  }
};

// Toggle archivo
exports.toggleArchived = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({ _id: id, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    conversation.isArchived = !conversation.isArchived;
    await conversation.save();

    logger.info(`✅ Archivo actualizado: ${conversation.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Conversación ${conversation.isArchived ? 'archivada' : 'desarchivada'}`,
      conversation
    });
  } catch (error) {
    logger.error(`❌ Error toggleando archivo: ${error.message}`);
    next(error);
  }
};

// ============================================
// MENSAJES
// ============================================

// Crear mensaje en una conversación
exports.createMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { content } = req.body; // El rol ya no es necesario, siempre es 'you' desde el cliente

    // 1. Validaciones
    if (!content) {
      const error = new AppError('El contenido del mensaje es requerido', 400);
      return next(error);
    }

    // 2. Verificar que la conversación exista y pertenezca al usuario
    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    // 3. Crear y guardar mensaje del USUARIO
    const userMessage = await Message.create({
      conversation: conversationId,
      user: userId,
      content: content.trim(),
      role: 'you'
    });

    // Actualizar historial en la conversación (puntero)
    conversation.messages.push(userMessage._id);
    conversation.messageCount += 1;
    conversation.lastMessageDate = new Date();
    await conversation.save();

    logger.info(`👤 Mensaje del usuario guardado en conversación ${conversationId}`);

    // 4. Obtener historial reciente para Groq (últimos 20 mensajes)
    const historyMessages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .limit(21); // Incluimos el que acabamos de crear

    // Revertir para que estén en orden cronológico
    const historyForGroq = historyMessages
      .map(m => ({ role: m.role, content: m.content }))
      .reverse();
    
    // Quitar el último (que es el mensaje actual del usuario) porque se pasa por separado en chatWithTutor
    const currentMessage = historyForGroq.pop();

    // 5. Llamar a Alex (Groq)
    let aiResponseContent;
    try {
      aiResponseContent = await chatWithTutor({
        userMessage: currentMessage.content,
        conversationHistory: historyForGroq,
        userProfile: {
          name: req.user.name,
          englishLevel: req.user.englishLevel,
          goals: req.user.learningGoals || 'General English improvement'
        }
      });
    } catch (groqError) {
      logger.error(`❌ Error llamando a Groq: ${groqError.message}`);
      aiResponseContent = "I'm sorry, I'm having some trouble connecting right now. Could you please try again in a moment?";
    }

    // 6. Crear y guardar respuesta del TUTOR
    const tutorMessage = await Message.create({
      conversation: conversationId,
      user: userId,
      content: aiResponseContent,
      role: 'other'
    });

    // Actualizar historial en la conversación con la respuesta del tutor
    conversation.messages.push(tutorMessage._id);
    conversation.messageCount += 1;
    conversation.lastMessageDate = new Date();
    await conversation.save();

    logger.info(`🤖 Respuesta de Alex guardada en conversación ${conversationId}`);

    // 7. Retornar ambos mensajes
    res.status(201).json({
      success: true,
      data: {
        userMessage: await userMessage.populate('user', 'name username'),
        tutorMessage: await tutorMessage.populate('user', 'name username')
      }
    });
  } catch (error) {
    logger.error(`❌ Error en el flujo de chat: ${error.message}`);
    next(error);
  }
};

// Obtener mensajes de una conversación
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verificar que la conversación exista y pertenezca al usuario
    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('user', 'name username')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo mensajes: ${error.message}`);
    next(error);
  }
};

// Obtener un mensaje específico
exports.getMessage = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user.id;

    // Verificar que la conversación exista y pertenezca al usuario
    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    const message = await Message.findOne({ _id: messageId, conversation: conversationId })
      .populate('user', 'name username');

    if (!message) {
      const error = new AppError('Mensaje no encontrado', 404);
      return next(error);
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo mensaje: ${error.message}`);
    next(error);
  }
};

// Actualizar mensaje
exports.updateMessage = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user.id;
    const { content, role, correction } = req.body;

    // Verificar que la conversación exista y pertenezca al usuario
    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    const message = await Message.findOne({ _id: messageId, conversation: conversationId });

    if (!message) {
      const error = new AppError('Mensaje no encontrado', 404);
      return next(error);
    }

    const updateData = {};

    if (content) {
      updateData.content = content.trim();
    }

    if (role && ['you', 'other'].includes(role)) {
      updateData.role = role;
    }

    if (correction) {
      updateData.correction = correction;
    }

    const updatedMessage = await Message.findByIdAndUpdate(messageId, updateData, { new: true })
      .populate('user', 'name username');

    logger.info(`✅ Mensaje actualizado en conversación ${conversation.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Mensaje actualizado exitosamente',
      data: updatedMessage
    });
  } catch (error) {
    logger.error(`❌ Error actualizando mensaje: ${error.message}`);
    next(error);
  }
};

// Eliminar mensaje
exports.deleteMessage = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const userId = req.user.id;

    // Verificar que la conversación exista y pertenezca al usuario
    const conversation = await Conversation.findOne({ _id: conversationId, user: userId });

    if (!conversation) {
      const error = new AppError('Conversación no encontrada', 404);
      return next(error);
    }

    const message = await Message.findOne({ _id: messageId, conversation: conversationId });

    if (!message) {
      const error = new AppError('Mensaje no encontrado', 404);
      return next(error);
    }

    // Eliminar mensaje
    await Message.findByIdAndDelete(messageId);

    // Actualizar contador en conversación
    conversation.messageCount -= 1;
    conversation.messages = conversation.messages.filter(msg => msg.toString() !== messageId);
    await conversation.save();

    logger.info(`✅ Mensaje eliminado de conversación ${conversation.title} por usuario ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });
  } catch (error) {
    logger.error(`❌ Error eliminando mensaje: ${error.message}`);
    next(error);
  }
};

// Obtener estadísticas de conversaciones
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalConversations = await Conversation.countDocuments({ user: userId });
    const favoriteConversations = await Conversation.countDocuments({ user: userId, isFavorite: true });
    const archivedConversations = await Conversation.countDocuments({ user: userId, isArchived: true });
    const totalMessages = await Message.countDocuments({ user: userId });

    // Contar por tema
    const byTopic = await Conversation.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$topic', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalConversations,
        favoriteConversations,
        archivedConversations,
        totalMessages,
        byTopic
      }
    });
  } catch (error) {
    logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
    next(error);
  }
};
