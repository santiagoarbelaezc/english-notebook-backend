const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - Solo usuario autenticado
router.get('/me', protect, userController.getUserData);
router.put('/me', protect, userController.updateProfile);
router.put('/me/password', protect, userController.changePassword);
router.delete('/me', protect, userController.deleteAccount);

module.exports = router;
