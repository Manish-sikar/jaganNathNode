const FooterModel = require("../models/footerModel");



const updateFooterData = async (req, res) => {
  try {
    const {
      _id, // Assuming _id is passed in req.body
      footer_title,
      footer_desc,
      footer_social_details,
      footer_services,
      footer_address1,
      footer_address2,
      footer_email  // Include address_link if needed
    } = req.body;

    // Validate required fields
    if (
      !_id ||
      !footer_title ||
      !footer_desc ||
      !footer_social_details ||
      !footer_services ||
      ! footer_address1 || 
      ! footer_address2 || 
      ! footer_email 
    ) {
      return res.status(400).json({
        err: "All fields are required, including _id, footer_title, footer_desc, footer_social_details, footer_services, and footer_contacts.",
      });
    }

    // Create an object to hold the updates
    const updateData = {
      footer_title,
      footer_desc,
      footer_social_details,
      footer_services,
      footer_address1,
      footer_address2 ,
      footer_email ,
      updatedAt: Date.now(), // Update the timestamp
    };

    // Update the footer data
    const updatedFooterData = await FooterModel.findByIdAndUpdate(
      _id, // Filter by ID
      updateData,
      { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!updatedFooterData) {
      return res.status(404).json({
        err: "Footer data not found.",
      });
    }

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Footer details updated successfully!",
      data: updatedFooterData, // Corrected to the proper variable
    });
  } catch (error) {
    console.error("Error updating footer data:", error);
    return res.status(500).json({
      err: "An error occurred, unable to update footer details.",
    });
  }
};





const getFooterData = async (req, res) => {
  try {
    // Fetch all footer details from the database
    const footerDetails = await FooterModel.find();

    // Check if the result is empty
    if (!footerDetails || footerDetails.length === 0) {
      return res.status(404).json({ error: "Footer details not found" });
    }

    // Send success response with the fetched data
    res.status(200).json({
      footer_Data: footerDetails, // Updated to use camelCase
      message: "Footer details found successfully!",
    });
  } catch (error) {
    console.error("Error fetching footer data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};








  module.exports = {
    updateFooterData ,
    getFooterData

  }