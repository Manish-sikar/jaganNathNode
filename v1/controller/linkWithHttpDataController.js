// const ContactFormModel = require("../models/contactFormModel");
const linkWithHttpModel = require("../models/linkWithHttpModel");

const postlinkWithHttpData = async (req, res) => {
  try {
    console.log(req.body , "gsdjgfasjg")
    const { fullName, email, phone, panCard, fullAddress } = req.body;

    // Validate required fields
    if (!fullName || !panCard || !email || !phone || !fullAddress) {
      return res.status(400).json({
        err: "All fields are required, including fullName, email, mobile, panCard and address .",
      });
    }

    // Create a new instance of ContactFormModel
    let linkWithHttpData = new linkWithHttpModel({
      fullName,
      email,
      phone,
      panCard,
      fullAddress,
      status : 1
    });
 

    // Save the contact form data to the database
    await linkWithHttpData.save();

    // Send a success response
    return res.status(201).json({
      message: "Contact form data saved successfully in the database!",
    });
  } catch (error) {
    console.error("Error in postContactForm: ", error);
    return res.status(500).json({
      err: "An error occurred while saving contact form data.",
    });
  }
};

const getlinkWithHttpData = async (req, res) => {
  try {
    // Check if the user exists in the database
    const linkWithHttpDetails = await linkWithHttpModel.find({status:1});
    if (!linkWithHttpDetails) {
      return res
        .status(404)
        .json({ error: "contact Form details are not found " });
    }
    res.status(200).json({
      linkWithHttp_Data: linkWithHttpDetails,
      message: "Contact Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletelinkWithHttpData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const _id = req.params.id;

    // Check if the required ID is missing
    if (!_id) {
      return res.status(401).json({ err: "contact Form ID is required!" });
    }

    // Find the existing banner data by ID
    const contactData = await linkWithHttpModel.findById(_id);
    if (!contactData) {
      return res.status(404).json({ error: "Contact Form data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    let updatedStatus;

    if (contactData.status == 1) {
      updatedStatus = "0";
    }

    // Update the status of the banner data
    const updatedContactFormData = await linkWithHttpModel.findByIdAndUpdate(
      _id, // Find the document by ID
      { status: updatedStatus }, // Set the new status
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "contact Form status updated successfully!",
      data: updatedContactFormData,
    });
  } catch (error) {
    console.error("Error updating banner status:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update banner status." });
  }
};

module.exports = {
  postlinkWithHttpData,
  getlinkWithHttpData,
  deletelinkWithHttpData,
};
