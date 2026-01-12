const express = require('express');
const router = express.Router();

// Profile routes
router.get('/', (req, res) => {
  res.json({ message: 'Get profile' });
});

module.exports = router;
