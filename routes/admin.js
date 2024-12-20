// routes/admin.js
const express = require('express');
const { CreateSalesPerson, CreateCustomer, GetCustomers, GetSingleCustomer, CreateProduct, GetProducts } = require('../controllers/adminController');

const authMiddleware = require('../middlewares/authMiddleware'); // Check for business admin role
const { createPurchase, getPurchase, updatePurchase, getAllPurchases } = require('../controllers/purchaseController');

const router = express.Router();

// Route to update business admin details
router.post('/create-sales-person', authMiddleware(['business_admin']), CreateSalesPerson);
router.post('/create-customer', authMiddleware(['business_admin']), CreateCustomer);
router.get('/get-customer', authMiddleware(['business_admin']), GetCustomers);
router.get('/get-customer/:customerId', authMiddleware(['business_admin']), GetSingleCustomer);
router.post('/create-product', authMiddleware(['business_admin','salesperson']), CreateProduct);
router.get('/get-products', authMiddleware(['business_admin','salesperson']), GetProducts);
router.post('/purchase', authMiddleware(['business_admin','salesperson']), createPurchase);
router.get('/purchase', authMiddleware(['business_admin','salesperson']), getAllPurchases);
router.get('/purchase/:id', authMiddleware(['business_admin','salesperson']), getPurchase);
router.put('/purchase/:id', authMiddleware(['business_admin','salesperson']), updatePurchase);
module.exports = router;
