const mongoose = require("mongoose");

// Define the schema
const linkWithHttpSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    panCard: {
      type: String,
      trim: true,
    },
    fullAddress: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },

    subcategory: {
      type: String,
      trim: true,
    },
    amount: {
      type: String,
      trim: true,
    },
    DelarAmount: {
      type: String,
      trim: true,
    },
    userDelar_id: {
      type: String,
      trim: true,
    },
    partnerEmail: {
      type: String,
      trim: true,
    },
    status: {
      type: Number,
      default: 1, // Default status
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Adds both createdAt and updatedAt fields automatically
);

// Create the model
const linkWithHttpModel = mongoose.model("linkWithHttp", linkWithHttpSchema);

module.exports = linkWithHttpModel;
