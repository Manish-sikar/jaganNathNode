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
      amountDeducted: Number(amount),
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


module.exports = { AdminLogin , AdminLoginpost , AddAmountByAdmin};
