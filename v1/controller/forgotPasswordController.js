const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { randomNumber } = require("../services/authServices");
const OTPModel = require("../models/otpModel");
const Partner = require("../models/userRegModel");

const storeOTP = async (email, otp) => {
    try {
      // Store or update OTP in the database
      await OTPModel.findOneAndUpdate(
        { email }, // Find by email
        { otp, createdAt: Date.now() }, // Update fields
        { upsert: true, new: true, setDefaultsOnInsert: true } // Insert if not found
      );
    } catch (err) {
      console.error("Error storing OTP:", err);
      throw new Error("Failed to store OTP");
    }
  };
  
  // Send OTP
  const forgotPasswordSendOtp = async (req, res) => {
    const { email } = req.body;
    console.log(email, "email");
  
    if (!email) return res.status(400).json({ message: "Email is required" });
  
    try {
      // Check if the user exists
      const user = await Partner.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // **Fix: Ensure OTP is a valid number**
      const otp = await randomNumber(); // Await OTP generation
  
      // Configure nodemailer transport
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });
  
      // Email options
      const mailOptions = {
        from: '"DIGITAL PAY MONEY" <no-reply@digitalpay.com>',
        to: email,
        subject: "DIGITAL PAY MONEY OTP USER VERIFICATION",
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
      };
  
      console.log(mailOptions);
  
      // Send email
      await transporter.sendMail(mailOptions);
  
      // Store OTP in database
      await storeOTP(email, otp);
  
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Failed to send OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  };
  

// Verify OTP
const UserRegisterverifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OTPModel.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    await OTPModel.deleteOne({ email });
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// Change Password
const forgotChangePasswordUser = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await Partner.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  forgotPasswordSendOtp,
  forgotChangePasswordUser,
  UserRegisterverifyOtp,
};
