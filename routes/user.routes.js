const express = require('express');
const router = express.Router();

// User routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all users' });
});

module.exports = router;
