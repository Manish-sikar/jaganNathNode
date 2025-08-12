const Razorpay = require("razorpay");
const crypto = require("crypto");
const TransactionHistory = require("../models/TransactionHistory");
const Partner = require("../models/userRegModel"); // Wallet belongs to Partner

console.log(process.env.KEY_ID)
// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// Create Razorpay order & store transaction
const getpayments = async (req, res) => {
  try {
    const { amount, JN_Id } = req.body; // JN_Id is the partner's ID

    if (!amount || !JN_Id) {
      return res.status(400).json({ error: "Amount and JN_Id are required" });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `wallet_txn_${JN_Id}_${Date.now()}`,
      payment_capture: 1,
    };
    const razorpayOrder = await razorpay.orders.create(options);
console.log(razorpayOrder , "razorpayOrder")
    // Save transaction as pending
    const transaction = new TransactionHistory({
      JN_Id,
      requestingAmount: Number(amount),
      purpose: "Wallet Top-up via Razorpay",
      amountType: "credit",
      status: "pending",
      razorpay_order_id: razorpayOrder.order.id,
    });
    await transaction.save();

    res.status(201).json({
      message: "Order created successfully",
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Error creating Razorpay order" });
  }
};

// Verify Razorpay payment & update wallet
const handlePaymentWebhook = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required Razorpay fields" });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Find transaction
    const transaction = await TransactionHistory.findOne({ razorpay_order_id });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    console.log(transaction , "transaction")

    // Prevent double processing
    if (transaction.status !== "pending") {
      return res.status(400).json({ error: "Transaction already processed" });
    }

    // Update partner balance
    const partner = await Partner.findOne({ JN_Id: transaction.JN_Id });
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }
    console.log(partner , "partner")

    const updatedBalance = (Number(partner.balance) || 0) + Number(transaction.requestingAmount);
    partner.balance = updatedBalance;
    await partner.save();

    // Update transaction record
    transaction.status = "success";
    transaction.purpose = `${transaction.requestingAmount} added to wallet successfully via Razorpay`;
    transaction.availableBalanceAfter = updatedBalance;
    transaction.razorpay_payment_id = razorpay_payment_id;
    await transaction.save();

    res.status(200).json({
      message: "Payment verified & wallet updated",
      updatedBalance,
    });
  } catch (error) {
    console.error("Error handling Razorpay webhook:", error);
    res.status(500).json({ error: "Error processing payment" });
  }
};

module.exports = { getpayments, handlePaymentWebhook };
