const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const TeamsModel = require("../models/teamModel");



const postTeamData = async (req, res) => {
  try {
    const { team_member, degination, social_icons } = req.body;
    const status = 1;

    // Check if the card logo file exists
    if (!req.file) {
      return res.status(400).json({ err: "Team Image is required." });
    }

    const imagePath = req.file.path; // Original image path

    // Define a new path for the resized image
    const resizedImagePath = path.join(
      "uploads",
      `resized_${req.file.filename}`
    );

    // Resize the image to 500x500 using Sharp and save to a new file
    await sharp(imagePath)
      .resize(500, 500) // Set width and height
      .toFile(resizedImagePath); // Save resized image to a new file

    // Validate required fields
    if (!team_member || !degination || !social_icons || !status) {
      return res.status(400).json({
        err: "All fields are required, including team member name, designation, social icons, and status.",
      });
    }

    // Validate social_icons
    const parsedSocialIcons = JSON.parse(social_icons); // Parse the social_icons if it's a JSON string
    if (!Array.isArray(parsedSocialIcons) || parsedSocialIcons.length === 0) {
      return res
        .status(400)
        .json({ err: "At least one social icon is required." });
    }

    // Create a new instance of TeamsModel
    let teamData = new TeamsModel({
      teamimg: resizedImagePath, // Use the resized image path for the logo
      team_member,
      degination,
      social_icons: parsedSocialIcons, // Save the parsed social icons array
      status,
    });

    // Save the team data to the database
    await teamData.save();

    // Send a success response
    return res.status(201).json({
      message: "Team details saved successfully in the database!",
    });
  } catch (error) {
    console.error("Error in postTeamData: ", error);
    return res
      .status(500)
      .json({ err: "An error occurred while saving team data." });
  }
};



const getTeamData = async (req, res) => {
  try {
    // Check if the user exists in the database
    const teamDetails = await TeamsModel.find();
    if (!teamDetails) {
      return res.status(404).json({ error: "team details are not found " });
    }
    res.status(200).json({
      team_Data: teamDetails,
      message: "Team Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateTeamData = async (req, res) => {
  try {
    const { _id, team_member, degination, social_icons } = req.body;

    if (!_id) {
      return res.status(400).json({ err: "ID is required to update the data." });
    }

    const cleanId = _id.trim();
    const teamData = await TeamsModel.findById(cleanId);

    if (!teamData) {
      return res.status(404).json({ err: "ID not found. Please provide a valid ID." });
    }

    let resizedImagePath = teamData.teamimg;
    if (req.file) {
      const imagePath = req.file.path;
      resizedImagePath = path.join("uploads", `resized_${req.file.filename}`);
      await sharp(imagePath).resize(500, 500).toFile(resizedImagePath);
    }

    if (!team_member || !degination || !social_icons) {
      return res.status(400).json({ err: "All fields are required." });
    }

    // Parse social_icons if it's a string
    const parsedSocialIcons = typeof social_icons === 'string' ? JSON.parse(social_icons) : social_icons;

    // Update existing icons or add new ones
    const updatedSocialIcons = parsedSocialIcons.map((newIcon) => {
      const existingIcon = teamData.social_icons.find((icon) => icon._id === newIcon._id);

      if (existingIcon) {
        // Only update the specified fields (icon_class, icon_url, icon_name)
        return {
          ...existingIcon,
          icon_class: newIcon.icon_class || existingIcon.icon_class,
          icon_url: newIcon.icon_url || existingIcon.icon_url,
          icon_name: newIcon.icon_name || existingIcon.icon_name,
        };
      } else {
        // Treat as a new icon if no match is found
        return newIcon;
      }
    });

    // Update team data with new icons and other fields
    const updateData = {
      team_member,
      degination,
      social_icons: updatedSocialIcons, // Replace old icons with the updated list
      teamimg: resizedImagePath,
      updatedAt: Date.now(),
    };

    const updatedTeamData = await TeamsModel.findByIdAndUpdate(cleanId, updateData, { new: true });

    return res.status(200).json({
      message: "Team details updated successfully!",
      data: updatedTeamData,
    });
  } catch (error) {
    console.error("Error updating team data:", error);
    return res.status(500).json({ err: "An error occurred, unable to update team details." });
  }
};








const deleteTeamData = async (req, res) => {
  try {
    console.log(req.params);
    // Destructure _id from req.body
    const  _id  = req.params.id;
     // Validate required fields
    if (!_id) {
      return res.status(400).json({ err: "Team Member ID is required!" });
    }

    // Find the existing team data by ID and delete it
    const teamData = await TeamsModel.findByIdAndDelete(_id);

    // Check if the team data exists
    if (!teamData) {
      return res.status(404).json({ error: "Team data not found!" });
    }

    // Construct the full path to the image file
    const fullImagePath = path.join(__dirname, "..", teamData.teamimg); // Adjust the path as needed

    // Delete the associated image file asynchronously
    fs.unlink(fullImagePath, (err) => {
      if (err) {
        console.error(`Error deleting image file: ${fullImagePath}`, err);
      } else {
        console.log(`Successfully deleted image file: ${fullImagePath}`);
      }
    });

    // Send a success response
    return res.status(200).json({
      message: "Team data and associated image deleted successfully!",
      data: teamData, // Return the deleted team data
    });
  } catch (error) {
    console.error("Error deleting team data:", error);
    return res.status(500).json({
      err: "An error occurred, unable to delete team data.",
    });
  }
};

const changeStatusTeamData = async (req, res) => {
  try {
    // Destructure _id from req.body
    const { _id } = req.body;

    // Validate the presence of _id
    if (!_id) {
      return res.status(400).json({ err: "Team ID is required!" });
    }

    // Find the existing team data by ID
    const teamData = await TeamsModel.findById(_id);
    if (!teamData) {
      return res.status(404).json({ error: "Team data not found!" });
    }

    // Toggle the status (assuming status is stored as a string '1' or '0')
    const updatedStatus = teamData.status === "1" ? "0" : "1";

    // Update the status of the team data
    const updatedTeamData = await TeamsModel.findByIdAndUpdate(
      _id,
      { status: updatedStatus },
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Team status updated successfully!",
      data: updatedTeamData,
    });
  } catch (error) {
    console.error("Error updating team status:", error);
    return res.status(500).json({
      err: "An error occurred, unable to update team status.",
    });
  }
};





module.exports = {
  postTeamData,
  getTeamData,
  updateTeamData,
  deleteTeamData,
  changeStatusTeamData,
};



