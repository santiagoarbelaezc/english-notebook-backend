const express = require('express');
const movieController = require('../controllers/movie.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', movieController.getAllMovies);
router.post('/', movieController.createMovie);
router.get('/:id', movieController.getMovie);
router.put('/:id', movieController.updateMovie);
router.delete('/:id', movieController.deleteMovie);

// Acciones especiales
router.put('/:id/favorite', movieController.toggleFavorite);

// Manejo de frases/quotes
router.get('/:id/quotes', movieController.getQuotes);
router.post('/:id/quotes', movieController.addQuote);
router.put('/:id/quotes/:quoteIndex', movieController.updateQuote);
router.delete('/:id/quotes/:quoteIndex', movieController.deleteQuote);

// Filtros
router.get('/favorites/list', movieController.getFavoriteMovies);
router.get('/search/opinion', movieController.searchByOpinion);

// Estadísticas
router.get('/stats/overview', movieController.getStats);

module.exports = router;
