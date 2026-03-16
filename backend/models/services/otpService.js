const crypto = require("crypto");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// In-memory store for OTPs (use a database in production)
const otpStore = new Map();

// Generate OTP
exports.generateOTP = (userId) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(userId, { otp, expiry });
  return otp;
};

// Verify OTP with expiration check
exports.verifyOTP = (userId, otp) => {
  const record = otpStore.get(userId);

  if (!record) return false;
  if (record.otp !== otp) return false;
  if (Date.now() > record.expiry) {
    otpStore.delete(userId); // Remove expired OTP
    return false;
  }

  otpStore.delete(userId); // Remove OTP after successful verification
  return true;
};

// Send OTP via email
exports.sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// Send OTP via SMS
exports.sendOTPSMS = async (phone, otp) => {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const message = `Your OTP code is ${otp}. It is valid for 5 minutes.`;

  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
    to: phone, // Recipient's phone number
  });
};