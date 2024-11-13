// routes/salesperson.js
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/sales', authMiddleware(['salesperson', 'admin']), (req, res) => {
  // Handle sales creation
});

router.post('/purchase', authMiddleware(['salesperson', 'admin']), (req, res) => {
  // Handle purchase creation
});

module.exports = router;
