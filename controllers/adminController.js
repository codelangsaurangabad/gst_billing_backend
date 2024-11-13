// controllers/adminController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.CreateSalesPerson = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];  // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode the JWT token to get userId (adminId) and businessId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Replace with your JWT secret key
    const { userId, role, businessId } = decoded;

    // Ensure the logged-in user is a business admin
    if (role !== 'business_admin') {
      return res.status(403).json({ message: 'Only business admins can create salespersons' });
    }

    // Check if the business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if the email is already taken by another user
    const existingSalesperson = await User.findOne({ email });
    if (existingSalesperson) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create the new salesperson
    const salesperson = new User({
      name,
      email,
      password,
      role: 'salesperson',
      businessId,  // The business this salesperson is associated with
      createdBy: userId,  // The admin who created this salesperson
    });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    salesperson.password = hashedPassword;

    await salesperson.save();
    res.status(201).json({ message: 'Salesperson created successfully' });
  } catch (error) {
    console.error('Error creating salesperson:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.CreateCustomer = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];  // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode the JWT token to get userId (adminId) and businessId
    const decoded = jwt.verify(token, JWT_SECRET);  // Replace with your JWT secret key
    const { userId, role, businessId } = decoded;

    // Ensure the logged-in user is a business admin
    if (role !== 'business_admin') {
      return res.status(403).json({ message: 'Only business admins can create customers' });
    }

    // Check if the business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if the email is already taken by another user
    const existingCustomer = await User.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create the new customer
    const customer = new User({
      name,
      email,
      password,
      role: 'customer',
      businessId,  // Link the customer to the business
      createdBy: userId,  // The admin who created this customer
    });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    customer.password = hashedPassword;

    await customer.save();
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};