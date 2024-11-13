// routes/superAdmin.js
const express = require('express');
const { createBusinessAdmin,createSuperAdmin } = require('../controllers/superAdminController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assume this middleware checks JWT and user role

const router = express.Router();

router.post('/create-business-admin', authMiddleware(['super_admin']), createBusinessAdmin);
router.post('/create-super-admin',  createSuperAdmin);

module.exports = router;
