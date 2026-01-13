const express = require('express');
const grammarController = require('../controllers/grammar.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', grammarController.getAllGrammar);
router.post('/', grammarController.createGrammar);
router.get('/:id', grammarController.getGrammar);
router.put('/:id', grammarController.updateGrammar);
router.delete('/:id', grammarController.deleteGrammar);

// Acciones especiales
router.put('/:id/favorite', grammarController.toggleFavorite);
router.post('/:id/vocabulary', grammarController.addRelatedVocabulary);

// Palabras subrayadas (highlights)
router.get('/:id/highlights', grammarController.getHighlightedWords);
router.post('/:id/highlights', grammarController.addHighlightedWord);
router.put('/:id/highlights/:word', grammarController.updateHighlightedWordColor);
router.delete('/:id/highlights/:word', grammarController.removeHighlightedWord);

// Filtros
router.get('/category/:categoryName', grammarController.getByCategory);
router.get('/difficulty/:level', grammarController.getByDifficulty);

// Estadísticas
router.get('/stats/overview', grammarController.getStats);

module.exports = router;
