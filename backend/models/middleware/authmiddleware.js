// =================================
// Import required packages
// =================================
const jwt = require("jsonwebtoken");
const otpService = require("../services/otpService");

// =================================
// Verify JWT Token
// =================================
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// =================================
// Admin Authorization Middleware
// =================================
exports.isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// =================================
// Employee Authorization Middleware
// =================================
exports.isEmployee = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Employees only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

// =================================
// OTP Verification Middleware
// =================================
exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp, userId } = req.body;

    if (!otp || !userId) {
      return res.status(400).json({
        success: false,
        message: "OTP and userId are required",
      });
    }

    // Verify OTP using service
    const isValid = await otpService.verifyOTP(userId, otp);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    next();
  } catch (error) {
    console.error("OTP Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};