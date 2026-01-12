const express = require('express');
const router = express.Router();

// Vocabulary routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all vocabulary' });
});

module.exports = router;
