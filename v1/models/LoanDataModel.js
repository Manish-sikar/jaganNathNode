const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  icon_pic: {
    type: String, // The path to the resized image (logo)
  },
  category_name: {
    type: String,
    required: true, // Name of the loan category
  },
  sub_category_name: {
    type: String,
    required: true, // Sub-category of the loan
  },
  category: {
    type: String,
    required: true, // Loan type category
  },
  amount: {
    type: String,
    required: true, // amount for the loan product
  },
  link: {
    type: String,
    required: true, // URL link for the loan product
  },
  status: {
    type: Number,
    default: 1, // 1 for Active, 0 for Inactive
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the created date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically updates on modification
  },
});

// Pre-save middleware to update the 'updatedAt' field whenever a document is modified
loanSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model using the schema
const LoanModel = mongoose.model("Loan", loanSchema);

module.exports = LoanModel;
