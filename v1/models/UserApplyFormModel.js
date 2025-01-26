const mongoose = require("mongoose");

const UserApplyFormSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
  },
  panCard: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN card number"],
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  fullAddress: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  subCategory: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
const UserApplyFormModel = mongoose.model("UserApplyForm", UserApplyFormSchema);

module.exports = UserApplyFormModel;
