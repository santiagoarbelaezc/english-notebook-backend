const express = require('express');
const conversationController = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// ============================================
// CONVERSACIONES
// ============================================

// CRUD de conversaciones
router.get('/', conversationController.getAllConversations);
router.post('/', conversationController.createConversation);
router.get('/:id', conversationController.getConversation);
router.put('/:id', conversationController.updateConversation);
router.delete('/:id', conversationController.deleteConversation);

// Acciones especiales
router.put('/:id/favorite', conversationController.toggleFavorite);
router.put('/:id/archived', conversationController.toggleArchived);

// Estadísticas
router.get('/stats/overview', conversationController.getStats);

// ============================================
// MENSAJES
// ============================================

// CRUD de mensajes (dentro de una conversación)
router.post('/:conversationId/messages', conversationController.createMessage);
router.get('/:conversationId/messages', conversationController.getMessages);
router.get('/:conversationId/messages/:messageId', conversationController.getMessage);
router.put('/:conversationId/messages/:messageId', conversationController.updateMessage);
router.delete('/:conversationId/messages/:messageId', conversationController.deleteMessage);

module.exports = router;
