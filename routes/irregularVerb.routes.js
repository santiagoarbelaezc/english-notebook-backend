const express = require('express');
const irregularVerbController = require('../controllers/irregularVerb.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', irregularVerbController.getAllVerbs);
router.post('/', irregularVerbController.createVerb);
router.get('/conjugations', irregularVerbController.getConjugations);
router.get('/:id', irregularVerbController.getVerb);
router.put('/:id', irregularVerbController.updateVerb);
router.delete('/:id', irregularVerbController.deleteVerb);

// Acciones especiales
router.put('/:id/favorite', irregularVerbController.toggleFavorite);

// Ejemplos
router.post('/:id/examples', irregularVerbController.addExample);
router.delete('/:id/examples/:exampleIndex', irregularVerbController.removeExample);

// Filtros
router.get('/difficulty/:level', irregularVerbController.getByDifficulty);

// Estadísticas
router.get('/stats/overview', irregularVerbController.getStats);

module.exports = router;
