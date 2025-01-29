const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const ProjectsModel = require("../models/projectsModel");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const postProjectsData = async (req, res) => {
  try {
    const {
      project_title,
      project_desc,
      btn_txt,
      btn_link,
      more_project_desc,
    } = req.body;
    const status = 1;

    if (!req.file) {
      return res.status(400).json({ err: "Project Logo is required." });
    }

    const fileBuffer = req.file.buffer; // Access file in memory
    const fileName = `project_${Date.now()}.jpg`; // Unique filename

    // Resize image using Sharp
    const resizedBuffer = await sharp(fileBuffer)
      .resize(180, 180) // Resize to 180x180
      .toFormat("jpeg")
      .toBuffer();

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME, // Your S3 bucket name
      Key: `projects/${fileName}`,
      Body: req.file.buffer,
      ContentType: "image/jpeg",
      ACL: "public-read", // Make it publicly accessible
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    const imageUrl = uploadResult.Location;

    // Validate required fields
    if (
      !project_title ||
      !project_desc ||
      !btn_txt ||
      !btn_link ||
      !status ||
      !more_project_desc
    ) {
      return res.status(400).json({
        err: "All fields are required, including Project title, description, and button text.",
      });
    }

    // Save project data in MongoDB
    let projectsData = new ProjectsModel({
      projectimg: imageUrl, // Store S3 image URL
      project_title,
      project_desc,
      more_project_desc,
      btn_txt,
      btn_link,
      status,
    });

    await projectsData.save();

    return res.status(201).json({
      message: "Project details saved successfully!",
      imageUrl, // Return uploaded image URL
    });
  } catch (error) {
    console.error("Error in postProjectsData: ", error);
    return res
      .status(500)
      .json({ err: "An error occurred while saving project data." });
  }
};

const getProjectsData = async (req, res) => {
  try {
    // Check if the user exists in the database
    const projectsDetails = await ProjectsModel.find();
    if (!projectsDetails) {
      return res.status(404).json({ error: "projects details are not found " });
    }
    res.status(200).json({
      projects_Data: projectsDetails,
      message: "Projects Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProjectsData = async (req, res) => {
  try {
    const {
      _id,
      project_title,
      project_desc,
      btn_txt,
      btn_link,
      more_project_desc,
    } = req.body;
    const status = 1; // Default status

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ err: "Project ID is required!" });
    }

    // Find the existing project data by ID
    const projectData = await ProjectsModel.findById(_id);
    if (!projectData) {
      return res.status(404).json({ error: "Project data not found!" });
    }

    // Prepare update object
    const updateData = {
      project_title: project_title || projectData.project_title,
      project_desc: project_desc || projectData.project_desc,
      more_project_desc: more_project_desc || projectData.more_project_desc,
      btn_txt: btn_txt || projectData.btn_txt,
      btn_link: btn_link || projectData.btn_link,
      status: status || projectData.status,
    };

    // Check if a new image was uploaded
    if (req.file) {
      // Resize image using Sharp
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize(180, 180)
        .toFormat("jpeg")
        .toBuffer();

      // Generate a unique filename for the new image
      const uniqueFilename = `project_${Date.now()}_${uuidv4()}.jpeg`;

      // Upload resized image to S3
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME, // S3 Bucket Name
        Key: `projects/${uniqueFilename}`, // File path in S3
        Body: resizedImageBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read", // Make file public
      };

      const uploadResult = await s3.upload(uploadParams).promise();

      // Delete old image from S3
      if (projectData.projectimg) {
        const oldImageKey = projectData.projectimg.split(
          `${process.env.AWS_BUCKET_NAME}/`
        )[1];
        if (oldImageKey) {
          try {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: oldImageKey,
              })
              .promise();
          } catch (err) {
            console.error("Error deleting old image from S3:", err);
          }
        }
      }

      // Update project image in database
      updateData.projectimg = uploadResult.Location; // S3 URL
    }

    // Update the project data in the database
    const updatedProject = await ProjectsModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true } // Return the updated document
    );

    // Send a success response
    return res.status(200).json({
      message: "Project data updated successfully!",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update project data." });
  }
};

const deleteProjectsData = async (req, res) => {
  try {
    const { id: _id } = req.params; // Extract project ID from request parameters

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ err: "Project ID is required!" });
    }

    // Find the existing project data by ID
    const projectData = await ProjectsModel.findOneAndDelete({ _id });

    // Check if the project data exists
    if (!projectData) {
      return res.status(404).json({ error: "Project data not found!" });
    }

    // Extract the S3 key from the project image URL
    const projectImgUrl = projectData.projectimg;
    if (projectImgUrl) {
      const s3Key = projectImgUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
console.log(s3Key)
      if (s3Key) {
        try {
          // Delete the image from S3
          await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: s3Key,
            })
            .promise();
        } catch (err) {
          console.error("Error deleting image from S3:", err);
          // Proceed without failing the entire request
        }
      }
    }

    // Send a success response
    return res.status(200).json({
      message: "Project data and associated image deleted successfully!",
      data: projectData, // Return the deleted project data
    });
  } catch (error) {
    console.error("Error deleting project data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to delete project data." });
  }
};

const changeStatusProjectsData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id } = req.body;

    // Check if the required ID is missing
    if (!_id) {
      return res.status(400).json({ err: "Project ID is required!" }); // Changed to 400 for bad request
    }

    // Find the existing service data by ID
    const projectsData = await ProjectsModel.findById(_id);
    if (!projectsData) {
      return res.status(404).json({ error: "Projects data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    const updatedStatus =
      projectsData.status === "1" || projectsData.status === 1 ? "0" : "1";

    // Update the status of the service data
    const updatedProjecstData = await ProjectsModel.findByIdAndUpdate(
      _id, // Find the document by ID
      { status: updatedStatus }, // Set the new status
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Projects status updated successfully!",
      data: updatedProjecstData,
    });
  } catch (error) {
    console.error("Error updating Projects status:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update Projects status." });
  }
};

module.exports = {
  postProjectsData,
  getProjectsData,
  updateProjectsData,
  deleteProjectsData,
  changeStatusProjectsData,
};
