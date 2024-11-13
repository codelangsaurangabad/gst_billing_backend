// routes/admin.js
const express = require('express');
const { CreateSalesPerson, CreateCustomer } = require('../controllers/adminController');

const authMiddleware = require('../middlewares/authMiddleware'); // Check for business admin role

const router = express.Router();

// Route to update business admin details
router.post('/create-sales-person', authMiddleware(['business_admin']), CreateSalesPerson);
router.post('/create-customer', authMiddleware(['business_admin']), CreateCustomer);
module.exports = router;
