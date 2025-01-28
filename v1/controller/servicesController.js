const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const ServicesModel = require("../models/serviceModel");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Set up AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
/// Function to upload image to S3
const uploadToS3 = async (fileBuffer, fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `services/${fileName}`, // File path in S3 bucket
    Body: fileBuffer, // Use the buffer of the file
    ContentType: "image/jpeg", // Assuming the image is in JPEG format
    ACL: "public-read", // Allow public access to the image
  };

  const { Location } = await s3.upload(params).promise();
  return Location; // Return the URL of the uploaded image
};

// Save service data and upload logo to S3
const postServicesData = async (req, res) => {
  try {
    const { card_title, btn_link } = req.body;
    const status = 1;

    // Check if the card logo file exists
    if (!req.file) {
      return res.status(400).json({ err: "Card Logo is required." });
    }

    const fileBuffer = req.file.buffer; // Access the file buffer since it's stored in memory

    // Validate required fields
    if (!card_title || !btn_link || !status) {
      return res.status(400).json({
        err: "All fields are required, including card title, button link, and status.",
      });
    }

    // Generate a unique file name
    const fileName = `${uuidv4()}.jpg`;

    // Resize the image buffer before uploading it to S3
    const resizedBuffer = await sharp(fileBuffer)
      .resize(150, 150) // Resize before uploading
      .toBuffer(); // Convert image to buffer

    // Upload the resized image to S3 and get the image URL
    const imageUrl = await uploadToS3(resizedBuffer, fileName);

    // Create a new instance of ServicesModel (assuming ServicesModel is your schema/model for this)
    const servicesData = new ServicesModel({
      card_logo: imageUrl, // Use the URL of the uploaded image
      card_title,
      btn_link,
      status,
    });

    // Save the service data to the database
    await servicesData.save();

    // Send a success response
    return res.status(201).json({
      message: "Service details saved successfully in the database!",
    });
  } catch (error) {
    console.error("Error in postServicesData: ", error);
    return res.status(500).json({
      err: "An error occurred while saving service data.",
    });
  }
};

const getServicesData = async (req, res) => {
  try {
    // Check if the user exists in the database
    const serviceDetails = await ServicesModel.find();
    if (!serviceDetails) {
      return res.status(404).json({ error: "service details are not found " });
    }
    res.status(200).json({
      services_Data: serviceDetails,
      message: "Services Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to delete file from S3
const deleteFileFromS3 = async (fileUrl) => {
  const key = fileUrl.split("/").pop(); // Extract file name from the URL

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `services/${key}`,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log("File deleted successfully from S3");
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
};

// Update service data
const updateServicesData = async (req, res) => {
  try {
    const { card_title, btn_link, _id } = req.body;
    if (!_id) {
      return res
        .status(400)
        .json({ err: "ID is required to update the data." });
    }

    const servicesData = await ServicesModel.findById(_id);
    if (!servicesData) {
      return res.status(404).json({ err: "ID not found." });
    }

    let resizedImagePath = servicesData.card_logo; // Default to existing image URL

    if (req.file) {
      const fileBuffer = req.file.buffer; // Use the buffer directly from memory

      // Resize the image buffer before uploading it to S3
      const resizedBuffer = await sharp(fileBuffer).resize(150, 150).toBuffer();

      // Generate a unique file name for the image
      const fileName = `${uuidv4()}.jpg`;

      // Upload the resized image to S3 and get the URL
      const imageUrl = await uploadToS3(resizedBuffer, fileName);

      resizedImagePath = imageUrl; // Update image URL
    }

    if (!card_title || !btn_link) {
      return res.status(400).json({
        err: "All fields are required.",
      });
    }

    const updateData = {
      card_title,
      btn_link,
      card_logo: resizedImagePath,
      updatedAt: Date.now(),
    };

    const updatedServicesData = await ServicesModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      message: "Service details updated successfully!",
      data: updatedServicesData,
    });
  } catch (error) {
    console.error("Error updating service data:", error);
    return res.status(500).json({ err: "An error occurred." });
  }
};

// Delete service data
const deleteServicesData = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!_id) {
      return res.status(400).json({ err: "Service ID is required!" });
    }

    // Find and delete the service data
    const servicesData = await ServicesModel.findByIdAndDelete(_id);

    if (!servicesData) {
      return res.status(404).json({ error: "Service data not found!" });
    }

    // If using AWS S3, delete the associated image from the S3 bucket
    if (servicesData.card_logo) {
      await deleteFileFromS3(servicesData.card_logo);
    }

    return res.status(200).json({
      message: "Service data and associated image deleted successfully!",
      data: servicesData,
    });
  } catch (error) {
    console.error("Error deleting services data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to delete services data." });
  }
};

const changeStatusServicesData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id } = req.body;

    // Check if the required ID is missing
    if (!_id) {
      return res.status(400).json({ err: "Service ID is required!" }); // Changed to 400 for bad request
    }

    // Find the existing service data by ID
    const servicesData = await ServicesModel.findById(_id);
    if (!servicesData) {
      return res.status(404).json({ error: "Service data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    const updatedStatus =
      servicesData.status === "1" || servicesData.status === 1 ? "0" : "1";

    // Update the status of the service data
    const updatedServiceData = await ServicesModel.findByIdAndUpdate(
      _id, // Find the document by ID
      { status: updatedStatus }, // Set the new status
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Service status updated successfully!",
      data: updatedServiceData,
    });
  } catch (error) {
    console.error("Error updating service status:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update service status." });
  }
};

module.exports = {
  postServicesData,
  getServicesData,
  updateServicesData,
  deleteServicesData,
  changeStatusServicesData,
};
