const UserApplyFormModel = require("../models/UserApplyFormModel");

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const LoanModel = require("../models/LoanDataModel");
const Partner = require("../models/userRegModel");
const TransactionHistory = require("../models/TransactionHistory");
const { emitEvent } = require("../socket/socketServer");

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const postUserApplyForm = async (req, res) => {
  try {
    const {
      partnerEmail,
      fullName,
      email,
      phone,
      panCard,
      state,
      district,
      fullAddress,
      category,
      subCategory,
      amount,
    } = req.body;
    // Validate required fields
    if (
      !partnerEmail ||
      !fullName ||
      !email ||
      !phone ||
      !panCard ||
      !state ||
      !district ||
      !fullAddress ||
      !category ||
      !subCategory ||
      !amount
    ) {
      return res.status(400).json({ err: "All fields are required." });
    }
    const partnerData = await Partner.findOne({ JN_Id: partnerEmail });
    if (!partnerData) {
      return res.status(404).json({ err: "Partner not found." });
    }

    let AvailableBalance = Number(partnerData?.balance) || 0;
    // Validate available balance
    if (AvailableBalance < amount) {
      return res
        .status(400)
        .json({ err: "Insufficient balance. Try again later." });
    }

    // Deduct balance before processing further
    const updatedBalance = AvailableBalance - amount;
   const ducductdata =  await Partner.findOneAndUpdate(
      { JN_Id: partnerEmail },
      { balance: updatedBalance },
      { new: true }
    );
    const uploadFileToS3 = async (file, folder) => {
      if (!file) return null; // If no file is provided, return null

      const uniqueFilename = `${folder}/${Date.now()}_${uuidv4()}_${
        file.originalname
      }`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      return uploadResult.Location; // Return the public URL of the uploaded file
    };

    // Upload files to S3
    const document1Url = req.files["document1"]
      ? await uploadFileToS3(req.files["document1"][0], "documents")
      : null;
    const document2Url = req.files["document2"]
      ? await uploadFileToS3(req.files["document2"][0], "documents")
      : null;
    const document3Url = req.files["document3"]
      ? await uploadFileToS3(req.files["document3"][0], "documents")
      : null;
 
    // Create a new instance of UserApplyFormModel
    const userForm = new UserApplyFormModel({
      partnerEmail,
      fullName,
      email,
      phone,
      panCard,
      state,
      district,
      fullAddress,
      category,
      subCategory,
      document1: document1Url,
      document2: document2Url,
      document3: document3Url,
      status:1
    });

    // Save the data to the database
    await userForm.save();

    if (AvailableBalance < amount) {
      const deductBalance = AvailableBalance - amount;

      await Partner.findByIdAndUpdate(
        { JN_Id: partnerEmail },
        {
          balance: deductBalance,
        },
        { new: true }
      );
    }


     // Save transaction history
     const transaction = new TransactionHistory({
      JN_Id: partnerEmail,
      amountDeducted: amount,
      availableBalanceAfter: updatedBalance,
      purpose: `Request for ${category}`,
    });

    await transaction.save(); // Save to DB    
    emitEvent("fetchWalletBalance", { message: "Wallet balance updated." });
    return res.status(201).json({
      message: "User application form data saved successfully!",
      user_balance :updatedBalance 
    });
  } catch (error) {
    console.error("Error in postUserApplyForm:", error);
    return res
      .status(500)
      .json({ err: "An error occurred while processing the request." });
  }
};

const getUserApplyForm = async (req, res) => {
  try {
    // Retrieve all contact form details
    const userFormDetails = await UserApplyFormModel.find();

    // Check if there are no records in the database
    if (userFormDetails.length === 0) {
      return res.status(404).json({
        error: "No contact form details found.",
      });
    }

    // Return the retrieved data with a success message
    return res.status(200).json({
      userForm_Data: userFormDetails,
      message: "User Apply form details retrieved successfully!",
    });
  } catch (error) {
    console.error("Error retrieving User Apply form details:", error);
    return res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
};

const deleteUserApplyForm = async (req, res) => {
  try {
    const { id: _id } = req.params; // Extract user form ID from request parameters

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ err: "User form ID is required!" });
    }

    // Find the existing user application form by ID
    const userForm = await UserApplyFormModel.findOneAndDelete({ _id });

    // Check if the form data exists
    if (!userForm) {
      return res
        .status(404)
        .json({ error: "User application form not found!" });
    }

    // Extract S3 keys from document URLs and delete them if they exist
    const deleteFileFromS3 = async (fileUrl) => {
      if (fileUrl) {
        const s3Key = fileUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
        if (s3Key) {
          try {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
              })
              .promise();
          } catch (err) {
            console.error("Error deleting file from S3:", err);
          }
        }
      }
    };

    // Delete associated documents from S3
    await Promise.all([
      deleteFileFromS3(userForm.document1),
      deleteFileFromS3(userForm.document2),
      deleteFileFromS3(userForm.document3),
    ]);

    // Send a success response
    return res.status(200).json({
      message:
        "User application form and associated documents deleted successfully!",
      data: userForm, // Return the deleted data
    });
  } catch (error) {
    console.error("Error deleting user application form:", error);
    return res.status(500).json({
      err: "An error occurred, unable to delete user application form.",
    });
  }
};

// const updateUserApplyForm = async (req, res) => {
//   try {
//     console.log(req.body)
//     const { id: _id } = req.params; // Extract user form ID from request parameters

//     // Validate required fields
//     if (!_id) {
//       return res.status(400).json({ err: "User form ID is required!" });
//     }

//     // Find the existing user application form by ID
//     const userForm = await UserApplyFormModel.findById(_id);
//     if (!userForm) {
//       return res.status(404).json({ error: "User application form not found!" });
//     }

//     // Extract fields from request body
//     const {
//       fullName,
//       email,
//       phone,
//       panCard,
//       state,
//       district,
//       fullAddress,
//     } = req.body;

//     // Function to delete old file from S3
//     const deleteFileFromS3 = async (fileUrl) => {
//       if (fileUrl) {
//         const s3Key = fileUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
//         if (s3Key) {
//           try {
//             await s3.deleteObject({
//               Bucket: process.env.AWS_BUCKET_NAME,
//               Key: s3Key,
//             }).promise();
//           } catch (err) {
//             console.error("Error deleting file from S3:", err);
//           }
//         }
//       }
//     };

//     // Function to upload file to S3
//     const uploadFileToS3 = async (file, folder) => {
//       if (!file) return null;

//       const uniqueFilename = `${folder}/${Date.now()}_${uuidv4()}_${file.originalname}`;
//       const uploadParams = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: uniqueFilename,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         ACL: "public-read",
//       };

//       const uploadResult = await s3.upload(uploadParams).promise();
//       return uploadResult.Location; // Return public URL
//     };

//     // Handle document updates
//     let document1Url = userForm.document1;
//     let document2Url = userForm.document2;
//     let document3Url = userForm.document3;

//     if (req.files) {
//       if (req.files["document1"]) {
//         await deleteFileFromS3(userForm.document1);
//         document1Url = await uploadFileToS3(req.files["document1"][0], "documents");
//       }
//       if (req.files["document2"]) {
//         await deleteFileFromS3(userForm.document2);
//         document2Url = await uploadFileToS3(req.files["document2"][0], "documents");
//       }
//       if (req.files["document3"]) {
//         await deleteFileFromS3(userForm.document3);
//         document3Url = await uploadFileToS3(req.files["document3"][0], "documents");
//       }
//     }

//     // Update the user application form in the database
//     const updatedUserForm = await UserApplyFormModel.findByIdAndUpdate(
//       _id,
//       {
//         fullName,
//         email,
//         phone,
//         panCard,
//         state,
//         district,
//         fullAddress,
//         document1: document1Url,
//         document2: document2Url,
//         document3: document3Url,
//       },
//       { new: true }
//     );

//     return res.status(200).json({
//       message: "User application form updated successfully!",
//       data: updatedUserForm,
//     });
//   } catch (error) {
//     console.error("Error updating user application form:", error);
//     return res.status(500).json({ err: "An error occurred while updating the form." });
//   }
// };

const updateUserApplyForm = async (req, res) => {
  try {
    const { id: _id } = req.params;

    if (!_id) {
      return res.status(400).json({ err: "User form ID is required!" });
    }

    const userForm = await UserApplyFormModel.findById(_id);
    if (!userForm) {
      return res
        .status(404)
        .json({ error: "User application form not found!" });
    }

    const {
      fullName,
      email,
      phone,
      panCard,
      state,
      district,
      fullAddress,
      document1,
      document2,
      document3,
    } = req.body;

    // Function to delete old file from S3
    const deleteFileFromS3 = async (fileUrl) => {
      if (fileUrl && !fileUrl.startsWith("http")) {
        const s3Key = fileUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
        if (s3Key) {
          try {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: s3Key,
              })
              .promise();
          } catch (err) {
            console.error("Error deleting file from S3:", err);
          }
        }
      }
    };

    // Function to upload file to S3
    const uploadFileToS3 = async (file, folder) => {
      if (!file) return null;

      const uniqueFilename = `${folder}/${Date.now()}_${uuidv4()}_${
        file.originalname
      }`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      return uploadResult.Location; // Return public URL
    };

    // Preserve existing document URLs if req.body contains them
    let document1Url = document1 ? document1 : userForm.document1;
    let document2Url = document2 ? document2 : userForm.document2;
    let document3Url = document3 ? document3 : userForm.document3;

    if (req.files) {
      if (req.files["document1"]) {
        await deleteFileFromS3(userForm.document1);
        document1Url = await uploadFileToS3(
          req.files["document1"][0],
          "documents"
        );
      }
      if (req.files["document2"]) {
        await deleteFileFromS3(userForm.document2);
        document2Url = await uploadFileToS3(
          req.files["document2"][0],
          "documents"
        );
      }
      if (req.files["document3"]) {
        await deleteFileFromS3(userForm.document3);
        document3Url = await uploadFileToS3(
          req.files["document3"][0],
          "documents"
        );
      }
    }

    // Update the user application form in the database
    const updatedUserForm = await UserApplyFormModel.findByIdAndUpdate(
      _id,
      {
        fullName,
        email,
        phone,
        panCard,
        state,
        district,
        fullAddress,
        document1: document1Url,
        document2: document2Url,
        document3: document3Url,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "User application form updated successfully!",
      data: updatedUserForm,
    });
  } catch (error) {
    console.error("Error updating user application form:", error);
    return res
      .status(500)
      .json({ err: "An error occurred while updating the form." });
  }
};

module.exports = {
  postUserApplyForm,
  getUserApplyForm,
  deleteUserApplyForm,
  updateUserApplyForm,
};
