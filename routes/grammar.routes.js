const express = require('express');
const router = express.Router();

// Grammar routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all grammar lessons' });
});

module.exports = router;
