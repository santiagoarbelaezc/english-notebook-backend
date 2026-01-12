const express = require('express');
const router = express.Router();

// Conversation routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all conversations' });
});

module.exports = router;
