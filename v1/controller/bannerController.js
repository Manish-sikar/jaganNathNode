const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const BannerModel = require("../models/bannerModel");

const postBannerData = async (req, res) => {
  try {
    const { title, heading, desc_txt, btn_txt, btn_link } = req.body;
    const status = 1;

    // Check if the file exists and extract the banner image path
    if (!req.file) {
      return res.status(400).json({ err: "Banner image is required." });
    }

    const imagePath = req.file.path; // Original image path

    // Resize the image to 1920x1080 using Sharp
    const resizedImagePath = path.join(
      "uploads",
      `resized_${req.file.filename}`
    ); // Define a new path for resized image
    await sharp(imagePath)
      .resize(1450, 850) // Set width and height
      .toFile(resizedImagePath); // Save resized image to a new file

    // Update req.file.path to point to the resized image
    req.file.path = resizedImagePath;

    // Validate required fields
    if (!title || !heading || !desc_txt || !btn_txt || !btn_link || !status) {
      return res
        .status(401)
        .json({ err: "All fields are required, including banner image." });
    }

    // Create a new instance of BannerModel with the provided data
    let banner_data = new BannerModel({
      title,
      heading,
      desc_txt,
      btn_txt,
      btn_link,
      banner_img: resizedImagePath, // Use the resized image path
      status,
    });

    // Save the banner data to the database
    await banner_data.save();

    // Send a success response
    return res.status(201).json({
      message: "Banner details saved successfully in the database!",
    });
  } catch (error) {
    console.error("Error in postBannerData: ", error);
    return res
      .status(500)
      .json({ err: "An error occurred while saving banner data." });
  }
};

const getBannerData = async (req, res) => {
  try {
    // Check if the user exists in the database
    const bannerDetails = await BannerModel.find();
    if (!bannerDetails) {
      return res.status(404).json({ error: "banner details are not found " });
    }
    res.status(200).json({
      banner_Data: bannerDetails,
      message: "banner Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateBannerData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id, title, heading, desc_txt, btn_txt, btn_link } = req.body;
    const status = 1;
    // Check if a file was uploaded
    let updatedBannerImg;
    if (req.file) {
      const imagePath = req.file.path; // Original image path

      // Resize the image to 1920x1080 using Sharp
      const resizedImagePath = path.join(
        "uploads",
        `resized_${req.file.filename}`
      ); // Define a new path for resized image

      await sharp(imagePath)
        .resize(1450, 850) // Set width and height
        .toFile(resizedImagePath); // Save resized image to a new file

      // Set the updated banner image path
      updatedBannerImg = resizedImagePath;
    }

    // Validate required fields
    if (!_id) {
      return res.status(401).json({ err: "Banner ID is required!" });
    }

    // Find the existing banner data by ID
    const bannerData = await BannerModel.findOne({ _id });
    if (!bannerData) {
      return res.status(404).json({ error: "Banner data not found" });
    }

    // Create an object to hold the updates
    const updateData = {
      title: title || bannerData.title,
      heading: heading || bannerData.heading,
      desc_txt: desc_txt || bannerData.desc_txt,
      btn_txt: btn_txt || bannerData.btn_txt,
      btn_link: btn_link || bannerData.btn_link,
      status: status || bannerData.status,
    };

    // Only update the image if a new one was uploaded
    if (updatedBannerImg) {
      updateData.banner_img = updatedBannerImg;
    }

    // Update the banner data
    const updatedBanner = await BannerModel.findOneAndUpdate(
      { _id },
      updateData,
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Banner data updated successfully!",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update banner data." });
  }
};

const deleteBannerData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const _id = req.params.id;

    // Validate required fields
    if (!_id) {
      return res.status(401).json({ err: "Banner ID is required!" });
    }

    // Find the existing banner data by ID and delete it
    const bannerData = await BannerModel.findOneAndDelete({ _id });

    // Check if the banner data exists
    if (!bannerData) {
      return res.status(404).json({ error: "Banner data not found!" });
    }

    // Construct the path to the image file
    const imagePath = path.join(__dirname, "..", bannerData.banner_img); // Adjust path based on your directory structure

    // Delete the associated image file
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting image file:", err);
        // You may choose to return a warning here, but continue with the deletion response
      }
    });

    // Send a success response
    return res.status(200).json({
      message: "Banner data deleted successfully!",
      data: bannerData, // Return the deleted banner data
    });
  } catch (error) {
    console.error("Error deleting banner data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to delete banner data." });
  }
};

const changeStatusBannerData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id } = req.body;

    // Check if the required ID is missing
    if (!_id) {
      return res.status(401).json({ err: "Banner ID is required!" });
    }

    // Find the existing banner data by ID
    const bannerData = await BannerModel.findById(_id);
    if (!bannerData) {
      return res.status(404).json({ error: "Banner data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    const updatedStatus =
      bannerData.status === "1" || bannerData.status === 1 ? "0" : "1";

    // Update the status of the banner data
    const updatedBannerData = await BannerModel.findByIdAndUpdate(
      _id, // Find the document by ID
      { status: updatedStatus }, // Set the new status
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Banner status updated successfully!",
      data: updatedBannerData,
    });
  } catch (error) {
    console.error("Error updating banner status:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update banner status." });
  }
};

module.exports = {
  postBannerData,
  getBannerData,
  updateBannerData,
  deleteBannerData,
  changeStatusBannerData,
};
