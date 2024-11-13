// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Import the User model

// Middleware to authenticate and authorize users based on their roles
module.exports = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');  // Extract token from the header
      if (!token) {
        return res.status(401).json({ error: 'Authentication token is required' });
      }

      // Verify the token and decode the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      
      const user = await User.findById(decoded.userId);  // Find user by ID from the decoded token
      
      if (!user) {
        console.log(`User with ID ${user} not found in the database`);
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the user has the required role
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Attach the user to the request for further use
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};
