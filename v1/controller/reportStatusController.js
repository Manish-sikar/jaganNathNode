const UserApplyFormModel = require("../models/UserApplyFormModel");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const TransactionHistory = require("../models/TransactionHistory");

// AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
 
  
// Upload and auto-generate document fields
const uploadFileToS3 = async (file, folder) => {
  if (!file) return null;
  const uniqueFilename = `${folder}/${Date.now()}_${uuidv4()}_${file.originalname}`;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: uniqueFilename,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const uploadResult = await s3.upload(uploadParams).promise();
  return uploadResult.Location;
};

const postUserApplyFormStatus = async (req, res) => {
  try {
    const { status, orderId, message } = req.body;

    if (!orderId) {
      return res.status(400).json({ err: "Order ID is required!" });
    }

    const userForm = await UserApplyFormModel.findById(orderId);
    if (!userForm) {
      return res.status(404).json({ error: "User application form not found!" });
    }

    const uploadedDocuments = {};

    // Check and upload optional documents
    for (let i = 4; i <= 7; i++) {
      const docKey = `document${i}`;
      if (req.files?.[docKey]) {
        uploadedDocuments[docKey] = await uploadFileToS3(req.files[docKey][0], "documents");
      } else {
        uploadedDocuments[docKey] = null; // Set null if not present
      }
    }

    // Update Status and Documents
    const updatedData = {
      status,
      message,
      ...uploadedDocuments,
    };

    const updatedUserForm = await UserApplyFormModel.findByIdAndUpdate(
      orderId,
      { $set: updatedData },
      { new: true }
    );

    return res.status(200).json({
      message: "Status and documents updated successfully!",
      data: updatedUserForm,
    });
  } catch (error) {
    console.error("Error updating user application form status:", error);
    return res.status(500).json({ err: "An error occurred while updating status." });
  }
};








// Simple status update
const postUserApplyFormChangeStatus = async (req, res) => {
  try {
    const { status, orderId } = req.body;

    if (!orderId || !status) return res.status(400).json({ error: "Order ID and status are required!" });

    const updatedForm = await UserApplyFormModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!updatedForm) return res.status(404).json({ error: "User application form not found!" });

    return res.status(200).json({ message: "Status updated successfully!", data: updatedForm });

  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ error: "An error occurred while updating the status." });
  }
};



// Simple status update
const getTransitionHistory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received ID:", id);

    if (!id) {
      return res.status(400).json({ error: "Partner ID is required!" });
    }

    // Use find() to fetch all records with matching JN_Id
    const transactionData = await TransactionHistory.find({ JN_Id: String(id) });

    if (!transactionData || transactionData.length === 0) {
      return res.status(404).json({ error: "No transaction data found for this Partner ID!" });
    }

    return res.status(200).json({ message: "Data retrieved successfully!", data: transactionData });

  } catch (error) {
    console.error("Error fetching transaction data:", error);
    return res.status(500).json({ error: "An error occurred while fetching the data." });
  }
};




module.exports = {
  postUserApplyFormStatus,
  postUserApplyFormChangeStatus ,
  getTransitionHistory
};
