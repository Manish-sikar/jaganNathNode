const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const AboutModel = require("../models/aboutModel");

const postAboutData = async (req, res) => {
  try {
    const { title, about_heading, desc_about } = req.body;
    const status = 1;
    // Ensure that at least one image is uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ err: "About images are required." });
    }

    const about_images = req.files; // Array of uploaded files

    // Array to store resized image paths
    const resizedImagePaths = [];

    // Resize each uploaded image and store the new path
    for (let i = 0; i < about_images.length; i++) {
      const originalImagePath = about_images[i].path;
      const resizedImagePath = path.join(
        "uploads",
        `resized_${about_images[i].filename}`
      );

      // Resize image using sharp
      await sharp(originalImagePath)
        .resize(500, 450) // Resize to 500x450 pixels
        .toFile(resizedImagePath);

      // Add resized image path to the array
      resizedImagePaths.push(resizedImagePath);
    }
    // Validate required fields
    if (!title || !about_heading || !desc_about) {
      return res.status(401).json({
        err: "All fields are required, including title, about heading, and description.",
      });
    }

    // Create a new instance of your model (e.g., AboutModel) with the provided data
    let aboutData = new AboutModel({
      title,
      about_heading,
      desc_about,
      about_images: resizedImagePaths,
      status, // Store array of resized image paths
    });

    // Save the about data to the database
    await aboutData.save();

    // Send a success response
    return res.status(201).json({
      message: "About details saved successfully in the database!",
    });
  } catch (error) {
    console.error("Error in postAboutData: ", error);
    return res
      .status(500)
      .json({ err: "An error occurred while saving about data." });
  }
};

const getAboutData = async (req, res) => {
  try {
    // Check if the user exists in the database
    const aboutDetails = await AboutModel.find();
    if (!aboutDetails) {
      return res.status(404).json({ error: "About details are not found " });
    }
    res.status(200).json({
      about_Data: aboutDetails,
      message: "about Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateAboutData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { title, about_heading, desc_about, _id } = req.body;

    // Validate the presence of _id
    if (!_id) {
      return res.status(400).json({
        err: "ID is required to update the data.",
      });
    }

    // Check if the document with the given ID exists
    const aboutData = await AboutModel.findById(_id);
    if (!aboutData) {
      return res.status(404).json({
        err: "ID not found. Please provide a valid ID.",
      });
    }

    // Ensure that at least one image is uploaded if there are files
    let resizedImagePaths = [];
    if (req.files && req.files.length > 0) {
      const about_images = req.files; // Array of uploaded files

      // Resize each uploaded image and store the new path
      for (let i = 0; i < about_images.length; i++) {
        const originalImagePath = about_images[i].path;
        const resizedImagePath = path.join(
          "uploads",
          `resized_${about_images[i].filename}`
        );

        // Resize image using sharp
        await sharp(originalImagePath)
          .resize(500, 450) // Resize to 500x450 pixels
          .toFile(resizedImagePath);

        // Add resized image path to the array
        resizedImagePaths.push(resizedImagePath);
      }
    }

    // Validate other required fields
    if (!title || !about_heading || !desc_about) {
      return res.status(400).json({
        err: "All fields are required, including title, about heading, and description.",
      });
    }

    // Create an object to hold the updates
    const updateData = {
      title,
      about_heading,
      desc_about,
      updatedAt: Date.now(), // Update the timestamp
    };

    // Only update the images if new ones were uploaded
    if (resizedImagePaths.length > 0) {
      updateData.about_images = resizedImagePaths; // Array of new image paths
    }

    // Update the About data
    const updatedAboutData = await AboutModel.findOneAndUpdate(
      { _id }, // Filter by ID
      updateData,
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "About details updated successfully!",
      data: updatedAboutData,
    });
  } catch (error) {
    console.error("Error updating About data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update About details." });
  }
};



const deleteAboutData = async (req, res) => {
  try {


    // Destructure data from req.body (form fields)
    const  _id  = req.params.id;
    // Validate required fields
    if (!_id) {
      return res.status(401).json({ err: "About ID is required!" });
    }

    // Find the existing about data by ID and delete it
    const aboutData = await AboutModel.findOneAndDelete({ _id });

    // Check if the about data exists
    if (!aboutData) {
      return res.status(404).json({ error: "About data not found!" });
    }

    // Loop through the about_images array and delete each image
    if (aboutData.about_images && aboutData.about_images.length > 0) {
      aboutData.about_images.forEach((imagePath) => {
        const fullImagePath = path.join(__dirname, "..", imagePath); // Adjust the path as per your folder structure

        // Delete the associated image file
        fs.unlink(fullImagePath, (err) => {
          if (err) {
            console.error(`Error deleting image file: ${imagePath}`, err);
          }
        });
      });
    }

    // Send a success response
    return res.status(200).json({
      message: "About data and associated images deleted successfully!",
      data: aboutData, // Return the deleted about data
    });
  } catch (error) {
    console.error("Error deleting about data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to delete about data." });
  }
};

const changeStatusAboutData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id } = req.body;

    // Check if the required ID is missing
    if (!_id) {
      return res.status(401).json({ err: "About ID is required!" });
    }

    // Find the existing About data by ID
    const aboutData = await AboutModel.findById(_id);
    if (!aboutData) {
      return res.status(404).json({ error: "About data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    const updatedStatus =
      aboutData.status === "1" || aboutData.status === 1 ? "0" : "1";

    // Update the status of the About data
    const updatedAboutData = await AboutModel.findByIdAndUpdate(
      _id, // Find the document by ID
      { status: updatedStatus }, // Set the new status
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "About status updated successfully!",
      data: updatedAboutData,
    });
  } catch (error) {
    console.error("Error updating About status:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update About status." });
  }
};

module.exports = {
  postAboutData,
  getAboutData,
  updateAboutData,
  deleteAboutData,
  changeStatusAboutData,
};
