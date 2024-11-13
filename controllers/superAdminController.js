// controllers/superAdminController.js
const User = require('../models/User');
const Business = require('../models/Business');
const bcrypt = require('bcryptjs');

exports.createBusinessAdmin = async (req, res) => {
  const { name, email, password, business } = req.body;

  try {
    // Check if business with this GST number already exists
    const existingBusiness = await Business.findOne({ gstNumber: business.gstNumber });
    if (existingBusiness) {
      return res.status(400).json({ message: 'A business with this GST number already exists' });
    }

    // Create a new business
    const newBusiness = new Business({
      name: business.name,
      address: business.address,
      contactNumber: business.contactNumber,
      gstNumber: business.gstNumber,
    });
    const savedBusiness = await newBusiness.save();

    // Create a new business admin user linked to the business
    const businessAdmin = new User({
      name,
      email,
      password,
      role: 'business_admin',
      businessId: savedBusiness._id,
    });

    await businessAdmin.save();
    res.status(201).json({ message: 'Business and business admin created successfully' });
  } catch (error) {
    console.error('Error creating business and admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
  };

exports.createSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if a super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) return res.status(400).json({ message: 'Super admin already exists' });

    // Create super admin
    const superAdmin = new User({ name, email, password, role: 'super_admin' });
    await superAdmin.save();
    res.status(201).json({ message: 'Super admin created successfully' });
  } catch (error) {
    console.error('Error creating super admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
  };
