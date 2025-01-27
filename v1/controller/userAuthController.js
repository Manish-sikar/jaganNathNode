const { comparePassword, JwtCreate } = require("../services/authServices");
const bcrypt = require("bcrypt");
const Partner = require("../models/userRegModel");



const PartnerLogin = async (req, res) => {
  try {
    const { emailORphone, password } = req.body;

    // Validate input
    if (!emailORphone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find the user by either email or phone
    const user = await Partner.findOne({
      $or: [{ email: emailORphone }, { phone: emailORphone }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate a JWT token for the user
    const token = await JwtCreate(user);

    // Return a successful response with user details and token
    res.status(200).json({
      token,
      user_Id: user._id,
      user_name: user.fullName,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


 

const PartnerRegister = async (req, res) => {
  try {
    const { fullName, designation, email, mobile, institutionName, message, panNo, aadharNo, password } = req.body;

    // Validate input
    if (
      !fullName ||
      !designation ||
      !email ||
      !mobile ||
      !institutionName ||
      !message ||
      !panNo ||
      !aadharNo ||
      !password
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the phone or email is already registered
    const existingUser = await Partner.findOne({ $or: [{ mobile }, { email }, { panNo }, { aadharNo }] });
    if (existingUser) {
      return res.status(400).json({
        error: `User with ${
          existingUser.mobile === mobile
            ? 'mobile'
            : existingUser.email === email
            ? 'email'
            : existingUser.panNo === panNo
            ? 'pan number'
            : 'aadhar number'
        } already exists`,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new Partner({
      fullName,
      designation,
      email,
      mobile,
      institutionName,
      message,
      panNo,
      aadharNo,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Return success response
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]; // Get the field causing the error
      return res.status(400).json({
        error: `User with this ${field} already exists`,
      });
    }

    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const GetPartnerRegister = async (req, res) => {
  try {
    // Check if the user exists in the database
    const partnerDetails = await Partner.find();
    if (!partnerDetails) {
      return res.status(404).json({ error: "Partner details are not found " });
    }
    res.status(200).json({
      partner_Data: partnerDetails,
      message: "Partner Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { PartnerLogin, PartnerRegister , GetPartnerRegister};
