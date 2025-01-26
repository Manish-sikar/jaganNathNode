const UserApplyFormModel = require("../models/UserApplyFormModel");

const postUserApplyForm = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,  // Changed from phone
      designation,
      institutionName,
      message,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !mobile ||
      !designation ||
      !institutionName ||
      !message
    ) {
      return res.status(400).json({
        err: "All fields are required.",
      });
    }

    const userForm = new UserApplyFormModel({
      fullName,
      email,
      phone: mobile,  // Mapping mobile to phone
      designation,
      institutionName,
      message,
    });

    await userForm.save();

    return res.status(201).json({
      message: "User application form data saved successfully!",
    });
  } catch (error) {
    console.error("Error in postUserApplyForm: ", error);
    return res
      .status(500)
      .json({ err: "An error occurred while saving the form data." });
  }
};



const getUserApplyForm = async (req, res) => {
    try {
      // Retrieve all contact form details
      const userFormDetails = await UserApplyFormModel.find();
  
      // Check if there are no records in the database
      if (userFormDetails.length === 0) {
        return res.status(404).json({
          error: "No contact form details found.",
        });
      }
  
      // Return the retrieved data with a success message
      return res.status(200).json({
        userForm_Data: userFormDetails,
        message: "User Apply form details retrieved successfully!",
      });
    } catch (error) {
      console.error("Error retrieving User Apply form details:", error);
      return res.status(500).json({
        error: "An internal server error occurred.",
      });
    }
  };



module.exports = {
  postUserApplyForm,
  getUserApplyForm
};
