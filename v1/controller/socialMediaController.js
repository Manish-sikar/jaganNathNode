const SocialModel = require("../models/socialMediaModel");

const postSocialMedia = async (req, res) => {
  try {
    const { icon_class, icon_name, icon_url } = req.body;
    if (!icon_class || !icon_name || !icon_url) {
      return res.status(401).json({ err: "msg all field require" });
    }

    // Create a new instance of SiteModel with the provided data
    let social_data = new SocialModel({
      icon_name: icon_name,
      icon_class: icon_class,
      icon_url: icon_url,
      status: 1,
    });

    // Save the site data to the database
    await social_data.save();

    // Send a success response
    return res.status(200).send({
      message: "Social Media details saved successfully in the database!",
    });
  } catch (error) {
    console.log("error In post Api of Social Media controller  : ", error);
  }
};

const getSocialMedia = async (req, res) => {
  try {
    // Check if the user exists in the database
    const socialDetails = await SocialModel.find();
    if (!socialDetails) {
      return res.status(404).json({ error: "social details are not found " });
    }
    res.status(200).json({
      social_Data: socialDetails,
      message: "social Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateSocialMedia = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id, icon_name, icon_class, icon_url } = req.body;
    // Check if any required fields are missing
    if (!_id || !icon_name || !icon_class || !icon_url) {
      return res.status(401).json({ err: "All fields are required!" });
    }

    // Find the existing social media data by ID
    const socialData = await SocialModel.findOne({ _id });
    if (!socialData) {
      return res.status(404).json({ error: "Social data not found" });
    }
    // Update the social media data with the new values
    await SocialModel.findOneAndUpdate(
      { _id }, // Find the document by id
      {
        icon_name: icon_name,
        icon_class: icon_class,
        icon_url: icon_url,
      },
      { new: true } // Return the updated document
    );

    // Send a success response
    return res
      .status(200)
      .json({ message: "Social media data updated successfully!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update social media data." });
  }
};

const deleteSocialMedia = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const _id = req.params.id;

    // Check if the ID field is missing
    if (!_id) {
      return res.status(401).json({ err: "Id is required!" });
    }

    // Find and delete the social media data by ID
    const deletedData = await SocialModel.findByIdAndDelete(_id);

    // Check if the data was found and deleted
    if (!deletedData) {
      return res.status(404).json({ error: "Social media data not found!" });
    }

    // Send a success response
    return res
      .status(200)
      .json({ message: "Social media data deleted successfully!" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to delete social media data." });
  }
};

const changeStatusSocialMedia = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id } = req.body;
    // Check if the required ID is missing
    if (!_id) {
      return res.status(401).json({ err: "Id is required!" });
    }

    // Find the existing social media data by ID
    const socialData = await SocialModel.findById(_id);

    if (!socialData) {
      return res.status(404).json({ error: "Social media data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    const updatedStatus = socialData.status === "1" ? "0" : "1";

    // Update the status of the social media data
    const updatedSocialData = await SocialModel.findByIdAndUpdate(
      _id, // Find the document by id
      { status: updatedStatus }, // Set the new status
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Social media status updated successfully!",
      data: updatedSocialData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      err: "An error occurred, unable to update social media status.",
    });
  }
};

module.exports = {
  postSocialMedia,
  getSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
  changeStatusSocialMedia,
};
