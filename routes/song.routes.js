const express = require('express');
const songController = require('../controllers/song.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Rutas protegidas - todas requieren autenticación
router.use(protect);

// CRUD básico
router.get('/', songController.getAllSongs);
router.post('/', songController.createSong);
router.get('/:id', songController.getSong);
router.put('/:id', songController.updateSong);
router.delete('/:id', songController.deleteSong);

// Subida de imágenes
router.post('/:id/upload-cover', upload.single('coverImage'), songController.uploadCoverImage);

// Acciones especiales
router.put('/:id/favorite', songController.toggleFavorite);
router.post('/:id/vocabulary', songController.addAnnotatedWord);
router.post('/:id/phrases', songController.addKeyPhrase);

// Filtros
router.get('/topic/:topicName', songController.getByTopic);

// Estadísticas
router.get('/stats/overview', songController.getStats);

module.exports = router;
