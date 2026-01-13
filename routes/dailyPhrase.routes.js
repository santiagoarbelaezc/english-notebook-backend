const express = require('express');
const dailyPhraseController = require('../controllers/dailyPhrase.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', dailyPhraseController.getAllPhrases);
router.post('/', dailyPhraseController.createPhrase);
router.get('/:id', dailyPhraseController.getPhrase);
router.put('/:id', dailyPhraseController.updatePhrase);
router.delete('/:id', dailyPhraseController.deletePhrase);

// Acciones especiales
router.put('/:id/favorite', dailyPhraseController.toggleFavorite);
router.get('/random/daily', dailyPhraseController.getRandomPhrase);

// Filtros
router.get('/type/:phraseType', dailyPhraseController.getByType);
router.get('/keyword/:keyword', dailyPhraseController.getByKeyword);

// Estadísticas
router.get('/stats/overview', dailyPhraseController.getStats);

module.exports = router;
