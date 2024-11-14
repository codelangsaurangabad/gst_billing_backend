const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  businessName: {
    type: String,
    required: false,
  },
  gstNumber: {
    type: String,
    required: false,
  },
  businessAddress: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Customer', customerSchema);
