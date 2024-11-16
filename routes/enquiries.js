const express = require('express');
const Enquiry = require('../models/Enquiry');
const { AddEnquiry } = require('../controllers/enquiriesController');
const router = express.Router();

// Create a new enquiry
router.post('/add-enquiry',  AddEnquiry);

module.exports = router;
