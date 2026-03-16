const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP controller
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update or create user with OTP
    let user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { new: true, upsert: true }
    );

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Login",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP controller
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "OTP verified successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};