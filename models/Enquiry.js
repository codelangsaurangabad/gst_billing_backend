const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },          // Name of the person enquiring
  email: { type: String, required: true },         // Email address
  phone: { type: String, required: true },         // Phone number
  package: { type: String, required: false },      // Package interested in
  message: { type: String, required: false },      // Additional message or enquiry details
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' }, // Enquiry status
  createdAt: { type: Date, default: Date.now }     // Enquiry creation time
});

module.exports = mongoose.model('Enquiry', enquirySchema);
