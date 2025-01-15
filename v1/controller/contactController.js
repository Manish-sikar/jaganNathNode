const ContactModel = require("../models/contactModel");

const updateContactData = async (req, res) => {
  try {
    // console.log(req.body);
    const { _id, address_name, address_link, mob_no, email, iframe_link ,open_hours ,open_days } =
      req.body;
    const status = 1; // Status is hardcoded, no need to check it


      // Validate that `mob_no` is an array of strings
      if (!Array.isArray(mob_no) || !mob_no.every(num => typeof num === "string")) {
        return res.status(400).json({ message: "Invalid format for mobile numbers." });
      }

    // Validate required fields
    if (!address_name || !address_link  || !email || !iframe_link) {
      return res.status(400).json({
        err: "All fields are required, including address_name, address_link, mob_no, email, and iframe_link.",
      });
    }

    // Create an object to hold the updates
    const updateData = {
      address_name,
      address_link,
      mob_no,
      email,
      iframe_link,
      open_days,
      open_hours,
      status,
      updatedAt: Date.now(), // Update the timestamp
    };

    // Update the contact data
    const updatedContactData = await ContactModel.findByIdAndUpdate(
      _id, // Filter by ID
      updateData,
      { new: true } // Return the updated document
    );

    // Check if the update was successful
    if (!updatedContactData) {
      return res.status(404).json({
        err: "Contact not found.",
      });
    }

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Contact details updated successfully!",
      data: updatedContactData,
    });
  } catch (error) {
    console.error("Error updating Contact data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update Contact details." });
  }
};

const getContactData = async (req, res) => {
  try {
    // Fetch all contact details from the database
    const contactDetails = await ContactModel.find();

    // Check if the result is empty
    if (contactDetails.length === 0) {
      return res.status(404).json({ error: "Contact details are not found" });
    }

    // Send success response with the fetched data
    res.status(200).json({
      contact_Data: contactDetails,
      message: "Contact details found successfully!",
    });
  } catch (error) {
    console.error("Error fetching contact data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  updateContactData,
  getContactData,
};
