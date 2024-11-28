const Purchase = require('../models/Purchase');
const Stock = require('../models/Stock');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create a new purchase and update stock
const createPurchase = async (req, res) => {
  const { supplierName, supplierGST, products, notes } = req.body;

  if (!supplierName || !products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Supplier name and products are required' });
  }

  try {
    // Calculate total amount
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId,role, businessId } = decoded;
    
    let totalAmount = 0;
    for (const product of products) {
      if (!product.productId || !product.quantity || !product.pricePerUnit) {
        return res.status(400).json({ message: 'Product details are incomplete' });
      }
      totalAmount += product.quantity * product.pricePerUnit;
    }

    // Create a new purchase entry
    const newPurchase = new Purchase({
      businessId:businessId,
      supplierName,
      supplierGST,
      products: products.map(product => ({
        ...product,
        total: product.quantity * product.pricePerUnit
      })),
      createdBy: userId,
      totalAmount,
      notes,
    });

    const savedPurchase = await newPurchase.save();

    // Update stock
    for (const product of products) {
      const { productId, quantity } = product;

      // Check if the product already exists in stock
      const stockItem = await Stock.findOne({ businessId: req.businessId, productId });

      if (stockItem) {
        // If product exists, update the quantity
        stockItem.quantity += quantity;
        stockItem.lastUpdated = Date.now();
        await stockItem.save();
      } else {
        // If product does not exist, create a new stock entry
        const newStock = new Stock({
          businessId: businessId,
          productId,
          quantity,
        });
        await newStock.save();
      }
    }

    res.status(201).json({
      message: 'Purchase recorded successfully and stock updated',
      purchase: savedPurchase,
    });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ message: 'Failed to record purchase and update stock. Please try again.' });
  }
};

const getPurchase = async (req, res) => {
    const { id } = req.params;
  
    try {
      const purchase = await Purchase.findById(id).populate('products.productId', 'name').populate('createdBy', 'name email');
  
      if (!purchase) {
        return res.status(404).json({ message: 'Purchase not found' });
      }
  
      res.status(200).json({ message: 'Purchase fetched successfully', purchase });
    } catch (error) {
      console.error('Error fetching purchase:', error);
      res.status(500).json({ message: 'Failed to fetch purchase. Please try again.' });
    }
  };

  const updatePurchase = async (req, res) => {
    const { id } = req.params;
    const { supplierName, supplierGST, products, notes } = req.body;
  
    try {
      // Find the purchase to update
      const purchase = await Purchase.findById(id);
  
      if (!purchase) {
        return res.status(404).json({ message: 'Purchase not found' });
      }
  
      // Update fields
      if (supplierName) purchase.supplierName = supplierName;
      if (supplierGST) purchase.supplierGST = supplierGST;
      if (notes) purchase.notes = notes;
  
      // Recalculate totalAmount if products are updated
      if (products && Array.isArray(products)) {
        let totalAmount = 0;
  
        for (const product of products) {
          if (!product.productId || !product.quantity || !product.pricePerUnit) {
            return res.status(400).json({ message: 'Product details are incomplete' });
          }
  
          totalAmount += product.quantity * product.pricePerUnit;
        }
  
        purchase.products = products.map(product => ({
          ...product,
          total: product.quantity * product.pricePerUnit,
        }));
        purchase.totalAmount = totalAmount;
      }
  
      const updatedPurchase = await purchase.save();
  
      res.status(200).json({ message: 'Purchase updated successfully', purchase: updatedPurchase });
    } catch (error) {
      console.error('Error updating purchase:', error);
      res.status(500).json({ message: 'Failed to update purchase. Please try again.' });
    }
  };

  const getAllPurchases = async (req, res) => {
    try {
      const purchases = await Purchase.find()
        .populate('products.productId', 'name price')
        .populate('createdBy', 'name email') // Populating createdBy with user details
        .sort({ createdAt: -1 }); // Optionally sort by creation date in descending order
      
      if (purchases.length === 0) {
        return res.status(404).json({ message: 'No purchases found' });
      }
  
      res.status(200).json({ message: 'Purchases fetched successfully', purchases });
    } catch (error) {
      console.error('Error fetching purchases:', error);
      res.status(500).json({ message: 'Failed to fetch purchases. Please try again.' });
    }
  };
  
module.exports = {
  createPurchase, getPurchase, updatePurchase,getAllPurchases
};
