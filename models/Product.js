const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the product schema
const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  gstRate: {
    type: Number,
    required: true,
    min: 0,
  },
  priceHistory: [
    {
      price: {
        type: Number,
        required: true,
      },
      effectiveDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Product model
module.exports = mongoose.model('Product', productSchema);
