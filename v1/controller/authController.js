const bcrypt = require("bcrypt");
const LoginModel = require("../models/authModel");
const { comparePassword, JwtCreate } = require("../services/authServices");
const Partner = require("../models/userRegModel");
const TransactionHistory = require("../models/TransactionHistory");
const AdminLogin = async (req, res) => {
  try {
    // {
    //   "UserName":"manish@gmail.com",
    //   "password":"Manish@1#2"
    //  }

    const { UserName, password } = req.body;
    if (!UserName || !password) {
      return res.status(401).json({ err: "msg all field require" });
    }

    // Check if the user exists in the database
    const user = await LoginModel.findOne({ UserName });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    let token = await JwtCreate(user);
    res.status(200).json({
      token,
      user_Id: user._id,
      admin_name: user.UserName,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const AdminLoginpost = async (req, res) => {
  try {
    const { UserName, password } = req.body;
 
    // Validate input
    if (!UserName || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
 
    // Save the new user to the database
    let newUser = new LoginModel({
      UserName,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




const AddAmountByAdmin = async (req, res) => {
  try {
    const { amount, partnerEmail, remark } = req.body;

    // Validate amount
    if (!amount || !Number.isFinite(Number(amount)) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount value." });
    }

    // Check partner existence
    const partnerData = await Partner.findOne({ JN_Id: String(partnerEmail) });
    if (!partnerData) {
      return res.status(404).json({ error: "Partner not found." });
    }

    // Calculate and update balance
    const availableBalance = Number(partnerData.balance) || 0;
    const updatedBalance = availableBalance + Number(amount);

    await Partner.findOneAndUpdate(
      { JN_Id: String(partnerEmail) },
      { balance: updatedBalance },
      { new: true }
    );

    // Save transaction history
    const transaction = new TransactionHistory({
      JN_Id: String(partnerEmail),
      requestingAmount: Number(amount),
      availableBalanceAfter: updatedBalance,
      purpose: String(remark),
      amountType:"credit"
    });
    // amountType: {
    //   type: String,
    //   enum: ["credit", "debit"],
    //   required: true,
    // }
    

    await transaction.save();

    return res.status(200).json({ message: "Amount added successfully!", updatedBalance });
  } catch (error) {
    console.error("Error adding amount:", error);
    return res.status(500).json({ error: "An error occurred while adding the amount." });
  }
};

const SumbitPaymentDetails = async (req, res) => {
  try {
    const { JN_ID, amount, utr } = req.body;

    const transaction = new TransactionHistory({
      JN_Id: JN_ID,
      requestingAmount: amount,
      purpose: `Requesting for Add Amount Balance.`,
      amountType: "credit",
      Utr_No: utr,
      status: "pending",
    });

    await transaction.save(); // 🛠 Save the transaction to the database

    res.status(200).json({ message: "Payment details submitted successfully." });
  } catch (error) {
    console.error("Error submitting payment details:", error);
    res.status(500).json({ message: "Something went wrong while saving the transaction." });
  }
};

const getPaymentDetails = async (req, res) => {
  try {
    // Find transactions where Utr_No is not null or undefined
    const transactions = await TransactionHistory.find({
      Utr_No: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    res.status(200).json({ requests: transactions });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Something went wrong while fetching payment details." });
  }
};

// controllers/paymentController.js

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("Received request body:", req.body);

    // 1. Find the existing transaction
    const transaction = await TransactionHistory.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }


    // 2. Only allow status change from "pending"
    if (transaction.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending transactions can be updated." });
    }
 
    // 3. Try to find the partner using JN_Id first
    let partner = await Partner.findOne({ JN_Id: transaction.JN_Id });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }


    // 5. Credit the amount to partner's wallet
    const currentBalance = Number(partner.balance || 0);
    const creditAmount = Number(transaction.requestingAmount || 0);
    const updatedBalance = currentBalance + creditAmount;

    partner.balance = updatedBalance;
    await partner.save();

    // 6. Update the transaction record
    transaction.status = "success";
    transaction.purpose = `${creditAmount} Amount added to your Wallet successfully`;
    transaction.availableBalanceAfter = updatedBalance;
    await transaction.save();

    // 7. Respond with success
    return res.status(200).json({
      message: "Transaction approved.",
      status: transaction.status,
      availableBalance: updatedBalance,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      message: "Failed to update payment status.",
      error: error.message,
    });
  }
};





module.exports = { AdminLogin , AdminLoginpost , AddAmountByAdmin , 
  SumbitPaymentDetails , getPaymentDetails , updatePaymentStatus};
