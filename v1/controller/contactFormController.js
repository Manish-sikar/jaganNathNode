const ContactFormModel = require("../models/contactFormModel");

const postContactForm = async (req, res) => {
  try {
    const { contact_name, contact_email, contact_project, contact_message } =
      req.body;
    const status = 1;
    // Validate required fields
    if (
      !contact_name ||
      !contact_email ||
      !contact_project ||
      !contact_message
    ) {
      return res.status(400).json({
        err: "All fields are required, including  name, email, subject, and message.",
      });
    }

    // Create a new instance of TeamsModel
    let contact_formData = ContactFormModel({
      contact_name, // Use the resized image path for the logo
      contact_email,
      contact_project,
      contact_message,
      status,
    });

    // Save the team data to the database
    await contact_formData.save();

    // Send a success response
    return res.status(201).json({
      message: "contact form data saved successfully in the database!",
    });
  } catch (error) {
    console.error("Error in postTeamData: ", error);
    return res
      .status(500)
      .json({ err: "An error occurred while saving team data." });
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
