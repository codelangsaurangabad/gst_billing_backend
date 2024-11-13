// models/Business.js
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  gstNumber: { type: String, unique: true }, // Optional: GST or tax number
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Business', businessSchema);
