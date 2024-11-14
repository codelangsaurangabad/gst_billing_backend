// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'business_admin', 'salesperson', 'customer'], required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }, // Reference to the associated business
  createdAt: { type: Date, default: Date.now },
  isBlocked: { type: Boolean, default: false }, // Add the isBlocked field
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
