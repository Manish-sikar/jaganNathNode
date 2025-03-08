const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema({
  JN_Id: {
    type: String,
    required: true,
  },
  amountDeducted: {
    type: Number,
    required: true,
  },
  availableBalanceAfter: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const TransactionHistory = mongoose.model("TransactionHistory", transactionHistorySchema);
module.exports = TransactionHistory;
