// controllers/superAdminController.js
const User = require('../models/User');
const Business = require('../models/Business');
const Enquiry = require('../models/Enquiry')
const bcrypt = require('bcryptjs');

exports.createBusinessAdmin = async (req, res) => {
  const { name, email, password, business } = req.body;

  try {
    // Check if business with this GST number already exists
    const existingBusiness = await Business.findOne({ gstNumber: business.gstNumber });
    if (existingBusiness) {
      return res.status(400).json({ message: 'A business with this GST number already exists' });
    }

    // Create a new business
    const newBusiness = new Business({
      name: business.name,
      address: business.address,
      contactNumber: business.contactNumber,
      gstNumber: business.gstNumber,
    });
    const savedBusiness = await newBusiness.save();

    // Create a new business admin user linked to the business
    const businessAdmin = new User({
      name,
      email,
      password,
      role: 'business_admin',
      businessId: savedBusiness._id,
    });

    await businessAdmin.save();
    res.status(201).json({ message: 'Business and business admin created successfully' });
  } catch (error) {
    console.error('Error creating business and admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
  };

exports.createSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if a super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) return res.status(400).json({ message: 'Super admin already exists' });

    // Create super admin
    const superAdmin = new User({ name, email, password, role: 'super_admin' });
    await superAdmin.save();
    res.status(201).json({ message: 'Super admin created successfully' });
  } catch (error) {
    console.error('Error creating super admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
  };

  exports.blockBusiness = async (req, res) => {
    const { businessId } = req.params;
    const { isBlocked } = req.body;
  
    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for isBlocked. It should be a boolean.' });
    }
  
    try {
      // Find all users (Customers and Salespersons) related to the businessId
      const usersToBlock = await User.find({
        businessId,
        role: { $in: ['salesperson', 'customer','business_admin'] },
        isBlocked: { $ne: isBlocked }  // Only update users that are not already in the desired state
      });
  
      if (usersToBlock.length === 0) {
        return res.status(404).json({ message: 'No customers or salespersons found for this business' });
      }
  
      // Update the `isBlocked` status for all found users
      const updatedUsers = await User.updateMany(
        { _id: { $in: usersToBlock.map(user => user._id) } },
        { $set: { isBlocked } }
      );
  
      res.status(200).json({
        message: isBlocked ? 'All business admin, customers and salespersons have been blocked.' : 'All business admin, customers and salespersons have been unblocked.',
        affectedUsers: updatedUsers.nModified  // Number of users modified
      });
    } catch (error) {
      console.error('Error blocking/unblocking users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  exports.getBusinessAdmins = async (req, res) => {
 
    
    try {
      const businessAdmins = await User.find({ role: 'business_admin' }).select('-password'); // Exclude password
  
      if (!businessAdmins.length) {
        return res.status(404).json({ message: 'No business admins found.' });
      }
  
      res.status(200).json(businessAdmins);
    } catch (error) {
      console.error('Error fetching business admins:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Get all enquiries
exports.GetEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }); // Most recent enquiries first
    res.status(200).json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Failed to fetch enquiries.' });
  }
}

// Update enquiry status (e.g., mark as contacted or closed)
exports.UpdateEnquiry = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  if (!['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    res.status(200).json({
      message: 'Enquiry status updated successfully.',
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ message: 'Failed to update enquiry status.' });
  }
};

