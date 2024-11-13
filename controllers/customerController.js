// controllers/customerController.js
const Order = require('../models/Order');

exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id }).sort({ date: -1 }).limit(10);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch recent orders" });
  }
};
