const {
  comparePassword,
  JwtCreate,
  randomNumber,
} = require("../services/authServices");
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
      token: token,
      user_Id: user._id,
      user_name: user.fullName,
      email: user.JN_Id,
      user_balance: user.balance,
      phone: user.phone,
      Delar_Id: user.create_id,
      status:parseInt(user.status)
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

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const LoginModel = require("../models/authModel");

// AWS S3 Config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload image to S3
const uploadToS3 = async (buffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `partnerImage/${fileName}`,
    Body: buffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  const { Location } = await s3.upload(params).promise();
  return Location;
};

const PartnerRegister = async (req, res) => {
  try {
    const {
      fullName,
      designation,
      email,
      mobile,
      institutionName,
      message,
      panNo,
      aadharNo,
      password,
      acDetails,
      create_id,
      status,
    } = req.body;

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
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    console.log(req.body);

    const existingUser = await Partner.findOne({
      $or: [{ mobile }, { email }, { panNo }, { aadharNo }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: `User with ${
          existingUser.mobile === mobile
            ? "mobile"
            : existingUser.email === email
            ? "email"
            : existingUser.panNo === panNo
            ? "PAN number"
            : "Aadhar number"
        } already exists`,
      });
    }

    // Upload image to S3 if provided
    let imageUrl = null;
    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      imageUrl = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const JN_Id = await randomNumber();
    let fullJanId;
    let statusq
    if (status == 2) {
      fullJanId = `CSF${JN_Id}`;
      statusq = 2
    } else {
      fullJanId = `POS${JN_Id}`;
       statusq = 1
    }
 

    const newUser = new Partner({
      fullName,
      designation,
      email,
      mobile,
      balance: 0,
      institutionName,
      message,
      panNo,
      aadharNo,
      JN_Id: fullJanId,
      password: hashedPassword,
      create_id: create_id || "",
      status :statusq
    });

    // Add optional fields
    if (imageUrl) newUser.Avtar = imageUrl;
    if (acDetails) newUser.acDetails = acDetails;
    await newUser.save();



    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `User with this ${field} already exists`,
      });
    }

    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const GetPartnerRegister = async (req, res) => {
//   try {
//     // Check if the user exists in the database
//     console.log(req.query)
//     const user_id  = req?.query
//     let partnerDetails
//     if (user_id){
//      partnerDetails = await Partner.find({create_id:user_id});
//     if (!partnerDetails) {
//       return res.status(404).json({ error: "Partner details are not found " });
//     }
//     }
//       if (!user_id){
//      partnerDetails = await Partner.find();
//     if (!partnerDetails) {
//       return res.status(404).json({ error: "Partner details are not found " });
//     }
//     }
//     // console.log(req)

//     res.status(200).json({
//       partner_Data: partnerDetails,
//       message: "Partner Details found sucessfully !! ",
//     });
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// Update Partner Details

const GetPartnerRegister = async (req, res) => {
  try {
   const { status, delar_id } = req.query;
    console.log(req.query);
    let partnerDetails;

    if (status && delar_id) {
      // both present
      partnerDetails = await Partner.find({ status: 1, create_id: delar_id });
    } else if (status) {
      // only status
      partnerDetails = await Partner.find({ status: status });
    } else {
      // neither
      partnerDetails = await Partner.find();
    }


    
    // If there are partners, fetch UserName for each create_id
//     const partnerWithUserName = await Promise.all(
//       partnerDetails.map(async (partner) => {
//         let userName = null;
//         let JN_Id = partner.create_id
//         console.log(JN_Id ,"JN_Id")
//         if (partner.create_id) {
//  console.log(JN_Id ,"JN_Idmddd")

//           const loginDoc = await Partner.findById(String(JN_Id))
//           if (loginDoc) {
//             userName = loginDoc.fullName;
//           }
//         }
//         // return partner data + userName field
//         return {
//           ...partner.toObject(), // convert mongoose doc to plain object
//           createUserName: userName, // add new field
//         };
//       })
//     );

    res.status(200).json({
      partner_Data: partnerDetails || [],
      message: partnerDetails?.length
        ? "Partner Details found successfully!"
        : "No partner data found.",
    });
  } catch (error) {
    console.error("Error fetching partner data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePartnerRegister = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    if (!_id) {
      return res.status(400).json({ error: "Partner ID is required" });
    }

    const existingPartner = await Partner.findById(_id);
    if (!existingPartner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    // If new image is uploaded
    if (req.file) {
      // Delete old image from S3 if exists
      if (existingPartner.Avtar) {
        const oldImageKey = existingPartner?.Avtar.split(
          `${process.env.AWS_BUCKET_NAME}/`
        )[1];
        if (oldImageKey) {
          try {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `partnerImage/${oldImageKey}`,
              })
              .promise();
          } catch (err) {
            console.error("Error deleting old image from S3:", err);
          }
        }
      }

      // Upload new image
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const imageUrl = await uploadToS3(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );
      updateData.Avtar = imageUrl;
    }

    const updatedPartner = await Partner.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    res.status(200).json({
      message: "Partner updated successfully",
      data: updatedPartner,
    });
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
    const { id, newPassword } = req.body;

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

const GetSpecialpartnerData = async (req, res) => {
  try {
    const { JN_Id } = req.body;

    const partnerDetails = await Partner.findOne({ JN_Id: JN_Id });

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

module.exports = {
  PartnerLogin,
  PartnerRegister,
  GetPartnerRegister,
  updatePartnerRegister,
  deletePartnerRegister,
  changePassPartnerRegister,
  GetSpecialpartnerData,
};
