const mongoose = require("mongoose");

// Define the ContactForm schema
const contactFormSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
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
    status: {
      type: Number,
      default: 1, // Default status
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically add creation timestamp
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Create the ContactForm model
const ContactFormModel = mongoose.model("ContactForm", contactFormSchema);

module.exports = ContactFormModel;
