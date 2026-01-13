const express = require('express');
const textController = require('../controllers/text.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', textController.getAllTexts);
router.post('/', textController.createText);
router.get('/:id', textController.getText);
router.put('/:id', textController.updateText);
router.delete('/:id', textController.deleteText);

// Acciones especiales
router.put('/:id/favorite', textController.toggleFavorite);
router.get('/:id/summary', textController.getReadingSummary);

// Anotaciones
router.post('/:id/vocabulary', textController.addAnnotatedVocabulary);
router.post('/:id/expressions', textController.addKeyExpression);

// Filtros
router.get('/type/:textType', textController.getByType);
router.get('/category/:categoryName', textController.getByCategory);

// Estadísticas
router.get('/stats/overview', textController.getStats);

module.exports = router;
