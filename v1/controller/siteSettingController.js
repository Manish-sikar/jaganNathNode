const SiteModel = require("../models/siteModel");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");


const updateDataSite = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const {
      _id,
      site_name,
      // site_short_name,
      title,
      mobile_no,
      email,
      Address,
    } = req.body;

    // Access the uploaded files from req.files
    const favicon = req?.files.favicon ? req?.files.favicon[0].path : null;
    const site_logo = req?.files.site_logo
      ? req?.files.site_logo[0].path 
      : null;

    // Check if any required fields are missing
    if (
      !_id ||
      !email ||
      !site_name ||
      !title ||
      !Address ||
      // !site_short_name ||
      !mobile_no
    ) {
      return res.status(401).json({ err: "All fields are required!" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }

    
        // Resize the image to 1920x1080 using Sharp
        const resizedImagePath = path.join(
          "uploads",
          `resized_${req.files.filename}`
        ); // Define a new path for resized image
    
        await sharp(site_logo)
          .resize(80, 80) // Set width and height
          .toFile(resizedImagePath); // Save resized image to a new file
    
    // Create a new instance of SiteModel with the provided data
    let updatesiteData = {
      email: email,
      site_name: site_name,
      // site_short_name: site_short_name,
      title: title,
      Address: Address,
      mobile_no: mobile_no,
    };

    // Add file paths if provided
    if (favicon) updatesiteData.favicon = favicon;
    if (site_logo) updatesiteData.site_logo = resizedImagePath;

    // Update the footer data
    const updatedSiteData = await SiteModel.findByIdAndUpdate(
      _id, // Filter by ID
      updatesiteData,
      { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!updatedSiteData) {
      return res.status(404).json({
        err: "Site data not found.",
      });
    }

    // Send a success response
    return res.status(200).send({ message: "Site data updated successfully!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to save site data." });
  }
};

const getDataSite = async (req, res) => {
  try {
    // Check if the user exists in the database
    const siteDetails = await SiteModel.findOne();
    if (!siteDetails) {
      return res.status(404).json({ error: "site details are not found " });
    }
    res.status(200).json({
      site_Data: siteDetails,
      message: "site Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateDataSite, getDataSite };
