const express = require('express');
const achievementController = require('../controllers/achievement.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', achievementController.getAllAchievements);
router.post('/', achievementController.createAchievement);
router.get('/:id', achievementController.getAchievement);
router.put('/:id', achievementController.updateAchievement);
router.delete('/:id', achievementController.deleteAchievement);

// Acciones especiales
router.put('/:id/progress', achievementController.updateProgress);

// Filtros
router.get('/type/:achievementType', achievementController.getByType);
router.get('/status/in-progress', achievementController.getInProgress);

// Estadísticas
router.get('/stats/overview', achievementController.getStats);

module.exports = router;
