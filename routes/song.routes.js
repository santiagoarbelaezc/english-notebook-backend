const express = require('express');
const router = express.Router();

// Song routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all songs' });
});

module.exports = router;
