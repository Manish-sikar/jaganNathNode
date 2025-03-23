const UserApplyFormModel = require("../models/UserApplyFormModel");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  
  // Upload File to S3
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
    console.log( uploadResult.Location)
    return uploadResult.Location;
  };
  
  // Update Form with Auto-Generated Document Fields
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
  
      // Find the next document number
      const existingDocs = Object.keys(userForm.toObject()).filter((key) =>
        key.startsWith("document")
      );
      let nextDocNum = existingDocs.length + 1;
  
      const uploadedDocuments = {};
  
      // Upload and auto-generate document fields
      if (req.files) {
        for (const [key, file] of Object.entries(req.files)) {
            const docFieldName = `document${nextDocNum}`; // Fix the naming
            uploadedDocuments[docFieldName] = await uploadFileToS3(file[0], "documents");
            nextDocNum++;            
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

module.exports = {
  postUserApplyFormStatus,
  postUserApplyFormChangeStatus
};
