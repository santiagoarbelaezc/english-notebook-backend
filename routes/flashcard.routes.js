const express = require('express');
const flashcardController = require('../controllers/flashcard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', flashcardController.getAllFlashcards);
router.post('/', flashcardController.createFlashcard);
router.get('/:id', flashcardController.getFlashcard);
router.put('/:id', flashcardController.updateFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);

// Acciones especiales
router.put('/:id/favorite', flashcardController.toggleFavorite);

// Sistema de Repetición Espaciada (SRS)
router.put('/:id/review/correct', flashcardController.markCorrect);
router.put('/:id/review/incorrect', flashcardController.markIncorrect);
router.get('/review/next-cards', flashcardController.getNextReviewCards);

// Filtros
router.get('/deck/:deckName', flashcardController.getByDeck);
router.get('/difficulty/:difficultyLevel', flashcardController.getByDifficulty);

// Mazos
router.get('/decks/list/all', flashcardController.getAllDecks);

// Estadísticas
router.get('/stats/overview', flashcardController.getStats);
router.get('/stats/deck/:deckName', flashcardController.getDeckStats);

module.exports = router;
