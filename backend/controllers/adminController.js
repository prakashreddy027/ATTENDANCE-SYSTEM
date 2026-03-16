const User = require("../models/user");

// List all users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Admin = require("../models/admin");

// Create Admin
exports.setAdminPassword = async (req, res) => {

  try {

    const { email, password } = req.body;

    const admin = new Admin({
      email,
      password
    });

    await admin.save();
    console.log("Admin created:", admin);
    res.json({
      success: true,
      message: "Admin created successfully"
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }

};

// Admin Login
exports.loginAdmin = async (req, res) => {

  try {

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.json({
        success: false,
        message: "Invalid credentials"
      });
    }

    res.json({
      success: true,
      message: "Login successful"
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }

};