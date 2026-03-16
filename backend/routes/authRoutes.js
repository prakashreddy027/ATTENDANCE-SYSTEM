const express = require("express");
const cors = require("cors");
const OTP = require("../models/OTP");
const User = require("../models/user");
const otpService = require("../services/otpService");
const router = express.Router();

// Enable CORS
router.use(cors());

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ================================
   CREATE EMPLOYEE
================================ */

router.post("/create", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Employee already exists"
      });
    }

    const newUser = new User({
      name,
      email,
      password
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Employee created successfully",
      user: newUser
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
});

/* ================================
   EMPLOYEE LOGIN
================================ */

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Employee not found"
      });
    }

    if (user.password !== password) {
      return res.json({
        success: false,
        message: "Invalid password"
      });
    }

    user.loginTime = new Date().toLocaleTimeString();
    await user.save();

    // Generate JWT token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id, role: "employee" }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

/* ================================
   GET ALL EMPLOYEES
================================ */

router.get("/all", async (req, res) => {

  try {

    const users = await users.find();

    res.json({
      success: true,
      totalEmployees: users.length,
      users: users
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});

/* ================================
   SEND OTP
================================ */

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({ phone, otp });

    // Send OTP via SMS
    await otpService.sendOTPSMS(phone, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Failed to send OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

module.exports = router;