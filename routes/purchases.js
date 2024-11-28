const express = require('express');
const jwt = require('jsonwebtoken');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware to extract businessId and userId from token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.businessId = decoded.businessId;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Create a new purchase
router.post('/', authenticateToken, async (req, res) => {
  const { supplierName, supplierGST, products, notes } = req.body;

  if (!supplierName || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Supplier name and products are required' });
  }

  try {
    // Calculate total amount
    let totalAmount = 0;
    for (const product of products) {
      if (!product.productId || !product.quantity || !product.pricePerUnit) {
        return res.status(400).json({ message: 'Product details are incomplete' });
      }
      totalAmount += product.quantity * product.pricePerUnit;
    }

    // Create a new purchase entry
    const newPurchase = new Purchase({
      businessId: req.businessId,
      supplierName,
      supplierGST,
      products: products.map(product => ({
        ...product,
        total: product.quantity * product.pricePerUnit
      })),
      createdBy: req.userId,
      totalAmount,
      notes
    });

    const savedPurchase = await newPurchase.save();

    res.status(201).json({
      message: 'Purchase recorded successfully',
      purchase: savedPurchase
    });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ message: 'Failed to record purchase. Please try again.' });
  }
});

// Get all purchases for a business
router.get('/', authenticateToken, async (req, res) => {
  try {
    const purchases = await Purchase.find({ businessId: req.businessId })
      .populate('products.productId', 'name price') // Populate product details
      .populate('createdBy', 'name email');        // Populate user details

    if (!purchases.length) {
      return res.status(404).json({ message: 'No purchases found' });
    }

    res.status(200).json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Failed to fetch purchases' });
  }
});

module.exports = router;
