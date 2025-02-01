const sharp = require("sharp");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const LoanModel = require("../models/LoanDataModel");

// AWS S3 Config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload image to S3
const uploadToS3 = async (fileBuffer, fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `loans/${fileName}`,
    Body: fileBuffer,
    ContentType: "image/jpeg",
    ACL: "public-read",
  };

  const { Location } = await s3.upload(params).promise();
  return Location; // Returns uploaded image URL
};

// Create Loan Data
const postLoanData = async (req, res) => {
  try {
    const { category_name, sub_category_name, category, link } = req.body;
    const status = 1; // Default status to active

    if (!category_name || !sub_category_name || !category || !link) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let imageUrl = null;
    if (req.file) {
      const resizedBuffer = req.file.buffer ;
      const fileName = `${uuidv4()}.jpg`;
      imageUrl = await uploadToS3(resizedBuffer, fileName);
    }
    


    const loanData = new LoanModel({
      icon_pic: imageUrl,
      category_name,
      sub_category_name,
      category,
      link,
      status,
    });

    await loanData.save();
    res.status(201).json({ message: "Loan data saved successfully!", data: loanData });
  } catch (error) {
    console.error("Error in postLoanData:", error);
    res.status(500).json({ error: "An error occurred while saving loan data." });
  }
};

// Fetch All Loan Data
const getLoanData = async (req, res) => {
  try {
    const loans = await LoanModel.find();
    res.status(200).json({ message: "Loan data fetched successfully!", loan_Data: loans });
  } catch (error) {
    console.error("Error fetching loan data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Update Loan Data
const updateLoanData = async (req, res) => {
  try {
    const { _id, category_name, sub_category_name, category, link } = req.body;

    if (!_id) return res.status(400).json({ error: "Loan ID is required." });

    const loan = await LoanModel.findById(_id);
    if (!loan) return res.status(404).json({ error: "Loan data not found." });

    let imageUrl = loan.icon_pic; // Keep existing image
    if (req.file) {
      const fileName = `${uuidv4()}.jpg`;
      imageUrl = await uploadToS3(req.file.buffer, fileName);
    }

    const updatedLoan = await LoanModel.findByIdAndUpdate(
      _id,
      { category_name, sub_category_name, category, link, icon_pic: imageUrl, updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json({ message: "Loan data updated successfully!", data: updatedLoan });
  } catch (error) {
    console.error("Error updating loan data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Delete Loan Data
const deleteLoanData = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!_id) return res.status(400).json({ error: "Loan ID is required." });

    const loan = await LoanModel.findByIdAndDelete(_id);
    if (!loan) return res.status(404).json({ error: "Loan data not found." });

    res.status(200).json({ message: "Loan data deleted successfully!", data: loan });
  } catch (error) {
    console.error("Error deleting loan data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Change Loan Status
const changeStatusLoanData = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ error: "Loan ID is required." });

    const loan = await LoanModel.findById(_id);
    if (!loan) return res.status(404).json({ error: "Loan data not found." });

    const updatedStatus = loan.status === 1 ? 0 : 1;

    const updatedLoan = await LoanModel.findByIdAndUpdate(_id, { status: updatedStatus }, { new: true });

    res.status(200).json({ message: "Loan status updated successfully!", data: updatedLoan });
  } catch (error) {
    console.error("Error updating loan status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  postLoanData,
  getLoanData,
  updateLoanData,
  deleteLoanData,
  changeStatusLoanData,
};
