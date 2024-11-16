const jwt = require('jsonwebtoken');
const Enquiry = require('../models/Enquiry');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.AddEnquiry = async (req, res) => {
    const { name, email, phone, package, message } = req.body;
  
    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required.' });
    }
  
    try {
      // Save the enquiry in the database
      const newEnquiry = new Enquiry({
        name,
        email,
        phone,
        package,
        message
      });
  
      const savedEnquiry = await newEnquiry.save();
  
      res.status(201).json({
        message: 'Enquiry submitted successfully.',
        enquiry: savedEnquiry
      });
    } catch (error) {
      console.error('Error saving enquiry:', error);
      res.status(500).json({ message: 'Failed to submit enquiry. Please try again.' });
    }
  };