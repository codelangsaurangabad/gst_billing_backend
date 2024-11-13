// routes/customer.js
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/order', authMiddleware(['customer', 'admin']), (req, res) => {
  // Create an order
});

router.get('/orders', authMiddleware(['customer', 'admin']), (req, res) => {
  // Fetch customer’s recent orders
});

router.get('/download-invoice/:id', authMiddleware(['customer', 'admin']), (req, res) => {
  // Download the invoice for a specific order
});

module.exports = router;
