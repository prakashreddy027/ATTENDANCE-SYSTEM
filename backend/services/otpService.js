const twilio = require("twilio");

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
    to: phone,
  });
};