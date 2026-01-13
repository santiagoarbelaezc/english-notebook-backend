const express = require('express');
const profileController = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Rutas protegidas - requieren autenticación
router.use(protect);

// Mi perfil
router.get('/me', profileController.getMyProfile);
router.put('/me', profileController.updateProfile);
router.post('/me/upload-image', upload.single('profileImage'), profileController.uploadProfileImage);
router.get('/me/summary', profileController.getProfileSummary);
router.get('/me/stats', profileController.getDetailedStats);
router.get('/me/progress', profileController.getLearningProgress);
router.put('/me/streak', profileController.updateStreak);
router.put('/me/recalculate-stats', profileController.recalculateStats);

// Perfil público de otros usuarios
router.get('/:username', profileController.getPublicProfile);

module.exports = router;
