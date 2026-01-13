const express = require('express');
const vocabularyController = require('../controllers/vocabulary.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', vocabularyController.getAllVocabulary);
router.post('/', vocabularyController.createWord);
router.get('/:id', vocabularyController.getWord);
router.put('/:id', vocabularyController.updateWord);
router.delete('/:id', vocabularyController.deleteWord);

// Acciones especiales
router.put('/:id/favorite', vocabularyController.toggleFavorite);

// Filtros
router.get('/difficulty/:level', vocabularyController.getByDifficulty);
router.get('/category/:categoryName', vocabularyController.getByCategory);

// Estadísticas
router.get('/stats/overview', vocabularyController.getStats);

module.exports = router;
