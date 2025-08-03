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

    // jasnathfinance@gmail.com
    // haiw ekbi mpyp vprj


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
  
      const currentYear = new Date().getFullYear();
      // Email options
      const mailOptions = {
        from: '"Jasnath Finance" <no-reply@jasnathfinance.in>',
        to: email,
        subject: "Jasnath Finance Change Password Verification",
        html: `
        <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <tr style="background-color: #004aad;">
        <td style="padding: 20px; text-align: center; color: #fff;">
          <h2 style="margin: 0;">Jasnath Finance</h2>
          <p style="margin: 5px 0 0; font-size: 14px;">Your Trusted Loan Partner</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h3 style="color: #333; margin-top: 0;">Verify Your Password Change</h3>
          <p style="font-size: 15px; color: #555;">
            Dear Customer,<br><br>
            We received a request to change the password of your <strong>Jasnath Finance</strong> account.
          </p>
          <p style="font-size: 16px; text-align: center; margin: 20px 0;">
            <span style="display: inline-block; background-color: #004aad; color: #fff; padding: 10px 20px; border-radius: 4px; font-size: 20px; letter-spacing: 2px;">
              ${otp}
            </span>
          </p>
          <p style="font-size: 15px; color: #555;">
            Please use the above One-Time Password (OTP) to complete your password change. For your security, this OTP is valid only for the next <strong>5 minutes</strong>.
          </p>
          <p style="font-size: 15px; color: #555;">
            If you didn’t request this change, please ignore this email or contact our support immediately.
          </p>
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Thank you for choosing <strong>Jasnath Finance</strong>.<br>
            We’re always here to help you achieve your financial goals!
          </p>
        </td>
      </tr>
      <tr style="background-color: #f4f4f4;">
        <td style="padding: 15px; text-align: center; font-size: 12px; color: #888;">
          &copy; ${currentYear} Jasnath Finance. All rights reserved.
        </td>
      </tr>
    </table>
        `,
      };
  
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
