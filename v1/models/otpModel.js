const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures one OTP per email at a time
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires in 5 minutes (300 seconds)
  },
});

const OTPModel = mongoose.model("OTP", otpSchema);

module.exports = OTPModel;
