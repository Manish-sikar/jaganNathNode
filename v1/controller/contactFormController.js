const ContactFormModel = require("../models/contactFormModel");

const postContactForm = async (req, res) => {
  try {
    const { fullName, designation, email, mobile, institutionName, message } = req.body;
    const status = 1;

    // Validate required fields
    if (!fullName || !designation || !email || !mobile || !institutionName || !message) {
      return res.status(400).json({
        err: "All fields are required, including full name, designation, email, mobile, institution name, and message.",
      });
    }

    // Create a new instance of ContactFormModel
    let contactFormData = new ContactFormModel({
      fullName,
      designation,
      email,
      mobile,
      institutionName,
      message,
      status,
    });

    // Save the contact form data to the database
    await contactFormData.save();

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

const getContactForm = async (req, res) => {
  try {
    // Check if the user exists in the database
    const contactFormDetails = await ContactFormModel.find();
    if (!contactFormDetails) {
      return res
        .status(404)
        .json({ error: "contact Form details are not found " });
    }
    res.status(200).json({
      contactForm_Data: contactFormDetails,
      message: "Contact Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const deleteContactForm = async (req, res) => {
//   try {
//     // Destructure data from req.body (form fields)
//     const _id = req.params.id;

//     // Validate required fields
//     if (!_id) {
//       return res.status(401).json({ err: "Contact form ID is required!" });
//     }

//     // Find the existing banner data by ID and delete it
//     const contactFormData = await ContactFormModel.findOneAndDelete({ _id });

//     // Check if the banner data exists
//     if (!contactFormData) {
//       return res.status(404).json({ error: "contact Form data not found!" });
//     }

//     // Send a success response
//     return res.status(200).json({
//       message: "contact Form data deleted successfully!",
//       data: contactFormData, // Return the deleted banner data
//     });
//   } catch (error) {
//     console.error("Error deleting banner data:", error);
//     return res
//       .status(500)
//       .json({ err: "An error occurred, unable to delete banner data." });
//   }
// };

const deleteContactForm = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const _id = req.params.id;

    // Check if the required ID is missing
    if (!_id) {
      return res.status(401).json({ err: "contact Form ID is required!" });
    }

    // Find the existing banner data by ID
    const contactData = await ContactFormModel.findById(_id);
    if (!contactData) {
      return res.status(404).json({ error: "Contact Form data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    let updatedStatus;

    if (contactData.status == 1 ) {
      updatedStatus = "0";
    }

    // Update the status of the banner data
    const updatedContactFormData = await ContactFormModel.findByIdAndUpdate(
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
  postContactForm,
  getContactForm,
  deleteContactForm,
};
