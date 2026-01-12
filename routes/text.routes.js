const express = require('express');
const router = express.Router();

// Text routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all texts' });
});

module.exports = router;
