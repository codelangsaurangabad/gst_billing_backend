// controllers/adminController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Business = require('../models/Business');
const Customer = require('../models/Customer');
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
  const { name, email, password, businessName, gstNumber, businessAddress } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, role, businessId } = decoded;

    if (role !== 'business_admin') {
      return res.status(403).json({ message: 'Only business admins can create customers' });
    }

    // Check if the email is already taken in the User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Step 1: Create a User entry
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
    });
    await user.save();

    // Step 2: Create a Customer entry referencing the User ID
    const customer = new Customer({
      userId: user._id,
      businessId,
      createdBy: userId,
      businessName: businessName || '',
      gstNumber: gstNumber || '',
      businessAddress: businessAddress || ''
    });
    await customer.save();

    res.status(201).json({ message: 'Customer created successfully' });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.GetCustomers =async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode JWT to get businessId and role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, businessId } = decoded;

    // Ensure that only business admins can view the customer list
    if (role !== 'business_admin') {
      return res.status(403).json({ message: 'Only business admins can view customers' });
    }

    // Find customers associated with the businessId
    const customers = await Customer.find({ businessId }).populate('userId', 'email');

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customer list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.GetSingleCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode JWT to get businessId and role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, businessId } = decoded;

    // Ensure that only business admins can view customers
    if (role !== 'business_admin') {
      return res.status(403).json({ message: 'Only business admins can view customers' });
    }

    // Find customer by ID and ensure they belong to the correct business
    const customer = await Customer.findOne({ _id: customerId, businessId })
      .populate('userId', 'email role'); // Populate userId field with user details like email and role

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Include both customer data and populated user data
    const responseData = {
      customer: {
        _id: customer._id,
        businessId: customer.businessId,
        businessName: customer.businessName,
        gstNumber: customer.gstNumber,
        businessAddress: customer.businessAddress,
        createdBy: customer.createdBy,
      },
      user: {
        email: customer.userId.email,
        role: customer.userId.role,
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.CreateProduct = async (req, res) => {
  const { productName, productCode, description, price, gstRate } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode JWT to get businessId and role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, businessId } = decoded;


    // Check if the product code already exists
    const existingProduct = await Product.findOne({ productCode });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product code already exists' });
    }

    // Create new product
    const newProduct = new Product({
      productName,
      productCode,
      description,
      price,
      gstRate,
      priceHistory: [{ price, effectiveDate: Date.now() }],
      businessId, // Link the product to a business
      createdBy: req.user._id, // Assuming the user is authenticated and user data is added in req.user
    });

    // Save product to database
    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.GetProducts = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Decode JWT to get businessId and role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, businessId } = decoded;

  try {
    // Find all products that belong to the given businessId
    const products = await Product.find({ businessId }).populate('businessId', 'businessName gstNumber');

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this business' });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};