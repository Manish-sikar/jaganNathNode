const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const ServicesModel = require("../models/serviceModel");

const postServicesData = async (req, res) => {
  try {
    const { card_title,   btn_link } = req.body;
    const status = 1;
    // Check if the card logo file exists
    if (!req.file) {
      return res.status(400).json({ err: "Card Logo is required." });
    }

    const imagePath = req.file.path; // Original image path

    // Resize the image to 1920x1080 using Sharp
    const resizedImagePath = path.join(
      "uploads",
      `resized_${req.file.filename}`
    ); // Define a new path for resized image

    await sharp(imagePath)
      .resize(150, 150) // Set width and height
      .toFile(resizedImagePath); // Save resized image to a new file

    // Validate required fields
    if (!card_title ||  !btn_link || !status) {
      return res.status(400).json({
        err: "All fields are required, including card title, description, button text, and status.",
      });
    }

    // Create a new instance of ServicesModel (assuming ServicesModel is your schema/model for this)
    let servicesData = new ServicesModel({
      card_logo: resizedImagePath, // Use the resized image path for the logo
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
    return res
      .status(500)
      .json({ err: "An error occurred while saving service data." });
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

const updateServicesData = async (req, res) => {
  try {
    const { card_title,   btn_link, _id } = req.body;
    if (!_id) {
      return res.status(400).json({ err: "ID is required to update the data." });
    }

    const servicesData = await ServicesModel.findById(_id);
    if (!servicesData) {
      return res.status(404).json({ err: "ID not found." });
    }

    let resizedImagePath = servicesData.card_logo; // Default to existing image path

    if (req.file) {
      const imagePath = req.file.path;
      resizedImagePath = path.join("uploads", `resized_${req.file.filename}`);
      await sharp(imagePath)
        .resize(150, 150)
        .toFile(resizedImagePath);
    }

    if (!card_title || !btn_link ) {
      return res.status(400).json({
        err: "All fields are required.",
      });
    }

    const updateData = {
      card_title,
      btn_link,
      card_logo: resizedImagePath, // Use resized image path
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
    console.error("Error updating Service data:", error);
    return res.status(500).json({ err: "An error occurred." });
  }
};


const deleteServicesData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const _id = req.params.id;
    // Validate required fields
    if (!_id) {
      return res.status(400).json({ err: "Service ID is required!" });
    }

    // Find the existing service data by ID and delete it
    const servicesData = await ServicesModel.findByIdAndDelete(_id);

    // Check if the service data exists
    if (!servicesData) {
      return res.status(404).json({ error: "Service data not found!" });
    }

    // Construct the full path to the image file
    const fullImagePath = path.join(__dirname, "..", servicesData.card_logo); // Adjust the path as needed

    // Delete the associated image file
    fs.unlink(fullImagePath, (err) => {
      if (err) {
        console.error(`Error deleting image file: ${fullImagePath}`, err);
        // Optionally log this error but still return the success response
      }
    });

    // Send a success response
    return res.status(200).json({
      message: "Service data and associated image deleted successfully!",
      data: servicesData, // Return the deleted service data
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
