import React, { useState } from "react";

function SendOtp() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Failed to send OTP");
    }
  };

  return (
    <div>
      <h1>Send OTP</h1>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={handleSendOtp}>Send OTP</button>
      <p>{message}</p>
    </div>
  );
}

export default SendOtp;