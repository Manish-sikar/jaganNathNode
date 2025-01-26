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
  mobile: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
  },
  designation: {
    type: String,
    required: true,
    trim: true,
  },
  institutionName: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
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
