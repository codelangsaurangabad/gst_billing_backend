const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');
const salespersonRoutes = require('./routes/salesperson');
const customerRoutes = require('./routes/customer');
const authRoutes = require('./routes/auth');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use('/super-admin', superAdminRoutes);
app.use('/admin', adminRoutes);
app.use('/salesperson', salespersonRoutes);
app.use('/customer', customerRoutes);
app.use('/auth', authRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
