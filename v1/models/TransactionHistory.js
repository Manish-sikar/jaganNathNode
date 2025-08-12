const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema({
  JN_Id: {
    type: String,
    required: true,
  },
  amountDeducted: {
    type: Number,
  },
  availableBalanceAfter: {
    type: Number,
  },
  requestingAmount: {
    type: Number,
  },
  purpose: {
    type: String,
    required: true,
  },
  amountType: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success"],
  },
  Utr_No: {
    type: Number,
  },
  razorpay_order_id: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const TransactionHistory = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema
);
module.exports = TransactionHistory;
