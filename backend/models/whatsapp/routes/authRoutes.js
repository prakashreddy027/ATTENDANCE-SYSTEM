const router = require("express").Router();
const { verifyOTP, verifyToken } = require("../../middleware/authmiddleware");
const User = require("../../user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpService = require("../../services/otpService");

// OTP Login
router.post("/otp-login", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Verify OTP
    const isValid = otpService.verifyOTP(userId, otp);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Email + Password Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Generate and send OTP via email
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate OTP
    const otp = otpService.generateOTP(email);

    // Send OTP via email
    await otpService.sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully to your email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

// Service Code Login
router.post("/service-login", async (req, res) => {
  try {
    const { serviceCode } = req.body;
    const user = await User.findOne({ serviceCode });

    if (!user) return res.status(404).json({ message: "Invalid service code" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, serviceCode, email, phone, password } = req.body;

    // Validate input
    if (!name || !serviceCode || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      serviceCode,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate OTP
    const otp = otpService.generateOTP(newUser._id);

    // Send OTP via email
    await otpService.sendOTPEmail(email, otp);

    res.status(201).json({ message: "User registered successfully. OTP sent to email." });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

module.exports = router;