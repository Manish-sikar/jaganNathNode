const bcrypt = require("bcrypt");
const LoginModel = require("../models/authModel");
const { comparePassword, JwtCreate } = require("../services/authServices");
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

module.exports = { AdminLogin , AdminLoginpost};
