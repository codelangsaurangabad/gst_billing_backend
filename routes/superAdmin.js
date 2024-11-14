// routes/superAdmin.js
const express = require('express');
const { createBusinessAdmin,createSuperAdmin, blockBusiness, getBusinessAdmins } = require('../controllers/superAdminController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assume this middleware checks JWT and user role

const router = express.Router();

router.post('/create-super-admin',  createSuperAdmin);
router.post('/create-business-admin', authMiddleware(['super_admin']), createBusinessAdmin);
router.get('/get-business-admin', authMiddleware(['super_admin']),  getBusinessAdmins);
router.post('/block-business/:businessId', authMiddleware(['super_admin']),  blockBusiness);
module.exports = router;
