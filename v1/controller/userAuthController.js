const { comparePassword, JwtCreate ,randomNumber} = require("../services/authServices");
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
      $or: [{ JN_Id: emailORphone }, { mobile: emailORphone }],
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



// const UserRegister = async (req, res) => {
//   try {
//     console.log(req.body)
//     const { UserName, password } = req.body;

//     // Validate input
//     if (!UserName || !password) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

//     // Save the new user to the database
//     let newUser = new LoginModel({
//       UserName,
//       password: hashedPassword,
//     });
// console.log(newUser)
//     await newUser.save();
//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// const UserRegister = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       birthday,
//       phone,
//       email,
//       gender,
//       state,
//       city,
//       address,
//       password,
//     } = req.body;

//     // Validate input
//     if (
//       !firstName ||
//       !lastName ||
//       !birthday ||
//       !phone ||
//       !email ||
//       !gender ||
//       !state ||
//       !city ||
//       !address ||
//       !password
//     ) {
//       return res.status(400).json({ error: "All fields are required" });
//     }
//  // {
//     //   "UserName":"manish@gmail.com",
//     //   "password":"Manish@1#2"
//     //  }
//     // Check if the Phone is already registered
//     //   const existingUser = await User.findOne({ phone });
//     //   if (existingUser) {
//     //     return res.status(400).json({ error: 'Phone No already exists' });
//     //   }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
//     // Parse birthday if it's a string
//     const parsedBirthday = new Date(birthday); // Ensure the birthday is a Date object
//     // Create new user
    
//     const newUser = new Customer({
//       firstName,
//       lastName,
//       birthday: parsedBirthday,
//       phone,
//       email,
//       gender,
//       state,
//       city,
//       address,
//       password: hashedPassword, // Store the hashed password
//     });

//     // Save the user to the database
//     await newUser.save();

//     // Return success response
//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


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
    const JN_Id = await randomNumber()

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
       JN_Id,
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



 

// Update Partner Details
const updatePartnerRegister = async (req, res) => {
  try {
    const updateData = req.body;
    const id =req.body?._id

    if (!id) {
      return res.status(400).json({ error: "Partner ID is required" });
    }

    const updatedPartner = await Partner.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPartner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    res.status(200).json({ message: "Partner updated successfully", data: updatedPartner });
  } catch (error) {
    console.error("Error updating partner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Partner
const deletePartnerRegister = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Partner ID is required" });
    }

    const deletedPartner = await Partner.findByIdAndDelete(id);

    if (!deletedPartner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Change Partner Password
const changePassPartnerRegister = async (req, res) => {
  try {
    const { id , newPassword } =  req.body;

    if (!id || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }


    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    partner.password = hashedNewPassword;
    await partner.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
 


module.exports = { PartnerLogin, PartnerRegister , GetPartnerRegister ,  updatePartnerRegister,
  deletePartnerRegister,
  changePassPartnerRegister,};
