const express = require('express');
const achievementController = require('../controllers/achievement.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// Solo lectura - los logros se desbloquean automáticamente
router.get('/', achievementController.getAllAchievements);
router.get('/stats', achievementController.getStats);
router.get('/category/:category', achievementController.getByCategory);

module.exports = router;
