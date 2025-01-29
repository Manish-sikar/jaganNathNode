 
const SiteModel = require("../models/siteModel");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
// / Upload file to S3
const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `site_assets/${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  const { Location } = await s3.upload(params).promise();
  return Location;
};

// Update Site Data
const updateDataSite = async (req, res) => {
  try {
    const { _id, site_name, title, mobile_no, email, Address } = req.body;

    if (!_id || !email || !site_name || !title || !Address || !mobile_no) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }

    if (!/^\d{10}$/.test(mobile_no)) {
      return res.status(400).json({ error: "Invalid mobile number format." });
    }

    let updatesiteData = { email, site_name, title, Address, mobile_no };

    // Process site_logo if provided
    if (req.files.site_logo) {
      const siteLogoBuffer = await sharp(req.files.site_logo[0].buffer)
        .resize(80, 80)
        .toBuffer();

      const siteLogoUrl = await uploadToS3(siteLogoBuffer, `site_logo_${uuidv4()}.jpg`, "image/jpeg");
      updatesiteData.site_logo = siteLogoUrl;
    }

    // Process favicon if provided
    if (req.files.favicon) {
      const faviconUrl = await uploadToS3(req.files.favicon[0].buffer, `favicon_${uuidv4()}.ico`, "image/x-icon");
      updatesiteData.favicon = faviconUrl;
    }

    // Update the site data in the database
    const updatedSiteData = await SiteModel.findByIdAndUpdate(_id, updatesiteData, { new: true });

    if (!updatedSiteData) {
      return res.status(404).json({ error: "Site data not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Site data updated successfully!",
      data: updatedSiteData,
    });
  } catch (error) {
    console.error("Error updating site data:", error);
    return res.status(500).json({ success: false, error: "An error occurred, unable to save site data." });
  }
};

// Get Site Data
const getDataSite = async (req, res) => {
  try {
    // Check if the user exists in the database
    const siteDetails = await SiteModel.findOne();
    if (!siteDetails) {
      return res.status(404).json({ error: "Site details are not found." });
    }

    return res.status(200).json({
      success: true,
      site_Data: siteDetails,
      message: "Site details found successfully!",
    });
  } catch (error) {
    console.error("Error fetching site data:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
};

module.exports = { updateDataSite, getDataSite };
