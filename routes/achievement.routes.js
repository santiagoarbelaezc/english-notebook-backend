const express = require('express');
const router = express.Router();

// Achievement routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all achievements' });
});

module.exports = router;
