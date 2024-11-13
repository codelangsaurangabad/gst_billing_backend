const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found"); // Debugging line
      return res.status(404).json({ error: "User not found" });
    }

    // Test comparison
    
    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("Password mismatch"); // Debugging line
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const payload = {
      userId: user._id,
      role: user.role,
      businessId: user.businessId,
    };

    const token = jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: '1h' });

    res.json({ message: "Login successful", token,role:user.role });
  } catch (error) {
    console.error(error); // Log any errors for debugging
    res.status(500).json({ error: "Server error" });
  }
};
