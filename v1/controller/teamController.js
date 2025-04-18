const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const TeamsModel = require("../models/teamModel");


const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// AWS S3 Config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload image to S3
const uploadToS3 = async (buffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `teams/${fileName}`,
    Body: buffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  const { Location } = await s3.upload(params).promise();
  return Location;
};





// // Post Team Data
// const postTeamData = async (req, res) => {
//   try {
//     const { team_member, degination, social_icons } = req.body;
//     const status = 1;

//     // Validation
//     if (!team_member || !degination || !social_icons) {
//       return res.status(400).json({
//         error: "All fields are required: team member, designation, and social icons.",
//       });
//     }

//     // Parse and validate social icons
//     let parsedSocialIcons;
//     try {
//       parsedSocialIcons = JSON.parse(social_icons);
//     } catch (err) {
//       return res.status(400).json({ error: "Invalid JSON format for social_icons." });
//     }

//     if (!Array.isArray(parsedSocialIcons) || parsedSocialIcons.length === 0) {
//       return res.status(400).json({ error: "At least one social icon is required." });
//     }

//     // Check for image file
//     if (!req.file) {
//       return res.status(400).json({ error: "Team image is required." });
//     }

//     // Upload original image to S3
//     const fileName = `${uuidv4()}_${req.file.originalname}`;
//     const imageUrl = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);

//     // Save to database
//     const teamData = new TeamsModel({
//       teamimg: imageUrl,
//       team_member,
//       degination,
//       social_icons: parsedSocialIcons,
//       status,
//     });

//     await teamData.save();

//     return res.status(201).json({
//       message: "Team data saved successfully!",
//       data: teamData,
//     });
//   } catch (error) {
//     console.error("Error in postTeamData:", error);
//     return res.status(500).json({
//       error: "An error occurred while saving team data.",
//     });
//   }
// };

 
 

const postTeamData = async (req, res) => {
  try {
    const { team_member, degination, social_icons } = req.body;
    const status = 1;

    // Validation
    if (!team_member || !degination || !social_icons) {
      return res.status(400).json({
        error: "All fields are required: team member, designation, and social icons.",
      });
    }

    // Parse social_icons if it's a string
    let parsedSocialIcons;
    try {
      parsedSocialIcons = typeof social_icons === "string" 
        ? JSON.parse(social_icons) 
        : social_icons;
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON format for social_icons." });
    }

    if (!Array.isArray(parsedSocialIcons) || parsedSocialIcons.length === 0) {
      return res.status(400).json({ error: "At least one social icon is required." });
    }

    // Optional image handling
    let imageUrl = "";
    if (req.file) {
      const fileName = `${uuidv4()}_${req.file.originalname}`;
      imageUrl = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);
    }

    // Save to DB
    const teamData = new TeamsModel({
      teamimg: imageUrl, // Empty string if no image
      team_member,
      degination,
      social_icons: parsedSocialIcons,
      status,
    });

    await teamData.save();

    return res.status(201).json({
      message: "Team data saved successfully!",
      data: teamData,
    });
  } catch (error) {
    console.error("Error in postTeamData:", error);
    return res.status(500).json({
      error: "An error occurred while saving team data.",
    });
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
 

// Update Team Data
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

    if (!team_member || !degination || !social_icons) {
      return res.status(400).json({ err: "All fields are required." });
    }

    // Upload new image if available
    let imageUrl = teamData.teamimg;
    if (req.file) {
      const fileName = `${uuidv4()}_${req.file.originalname}`;
      imageUrl = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);
    }

    // Parse social icons
    const parsedSocialIcons = typeof social_icons === 'string'
      ? JSON.parse(social_icons)
      : social_icons;

    // Merge social icons (update existing or add new)
    const updatedSocialIcons = parsedSocialIcons.map((newIcon) => {
      const existingIcon = teamData.social_icons.find((icon) => icon._id === newIcon._id);
      return existingIcon
        ? {
            ...existingIcon,
            icon_class: newIcon.icon_class || existingIcon.icon_class,
            icon_url: newIcon.icon_url || existingIcon.icon_url,
            icon_name: newIcon.icon_name || existingIcon.icon_name,
          }
        : newIcon;
    });

    // Prepare update object
    const updateData = {
      team_member,
      degination,
      social_icons: updatedSocialIcons,
      teamimg: imageUrl,
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
 
 

// Helper: Delete image from S3
const deleteFromS3 = async (imageUrl) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const key = imageUrl.split(".amazonaws.com/")[1]; // Extract S3 key

  if (!key) return;

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`Image deleted from S3: ${key}`);
  } catch (err) {
    console.error("Error deleting from S3:", err);
  }
};

// Controller: Delete team data and image
const deleteTeamData = async (req, res) => {
  try {
    const _id = req.params.id;

    if (!_id) {
      return res.status(400).json({ err: "Team Member ID is required!" });
    }

    // Find and delete the team member
    const teamData = await TeamsModel.findByIdAndDelete(_id);

    if (!teamData) {
      return res.status(404).json({ error: "Team data not found!" });
    }

    // Delete image from S3
    if (teamData.teamimg) {
      await deleteFromS3(teamData.teamimg);
    }

    return res.status(200).json({
      message: "Team data and image deleted successfully!",
      data: teamData,
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



