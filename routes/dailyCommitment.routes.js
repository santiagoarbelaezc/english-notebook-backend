const express = require('express');
const dailyCommitmentController = require('../controllers/dailyCommitment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', dailyCommitmentController.getAllCommitments);
router.post('/', dailyCommitmentController.createCommitment);
router.get('/:id', dailyCommitmentController.getCommitment);
router.put('/:id', dailyCommitmentController.updateCommitment);
router.delete('/:id', dailyCommitmentController.deleteCommitment);

// Acciones especiales
router.put('/:id/progress', dailyCommitmentController.updateProgress);
router.put('/:id/status', dailyCommitmentController.updateStatus);
router.get('/today/commitments', dailyCommitmentController.getTodayCommitments);

// Filtros
router.get('/status/:statusType', dailyCommitmentController.getByStatus);

// Estadísticas
router.get('/stats/overview', dailyCommitmentController.getStats);

module.exports = router;
