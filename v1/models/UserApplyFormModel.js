const mongoose = require("mongoose");

const UserApplyFormSchema = new mongoose.Schema(
  {
     partnerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    panCard: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    document1: {
      type: String, // S3 URL
      default: null,
    },
    document2: {
      type: String, // S3 URL
      default: null,
    },
    document3: {
      type: String, // S3 URL
      default: null,
    },
     status: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UserApplyFormModel = mongoose.model("UserApplyForm", UserApplyFormSchema);
module.exports = UserApplyFormModel;
