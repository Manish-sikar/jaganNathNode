const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const ProjectsModel = require("../models/projectsModel");

const postProjectsData = async (req, res) => {
  try {
    const { project_title, project_desc, btn_txt, btn_link, more_project_desc } = req.body;
    const status = 1;
    // Check if the card logo file exists
    if (!req.file) {
      return res.status(400).json({ err: "Project Logo is required." });
    }

    const imagePath = req.file.path; // Original image path

    // Resize the image to 1920x1080 using Sharp
    const resizedImagePath = path.join(
      "uploads",
      `resized_${req.file.filename}`
    ); // Define a new path for resized image

    await sharp(imagePath)
      .resize(180, 180) // Set width and height
      .toFile(resizedImagePath); // Save resized image to a new file

    // Validate required fields
    if (!project_title || !project_desc || !btn_txt || !btn_link || !status || !more_project_desc) {
      return res.status(400).json({
        err: "All fields are required, including Project title, description and  button text.",
      });
    }

    // Create a new instance of ServicesModel (assuming ServicesModel is your schema/model for this)
    let projectsData = new ProjectsModel({
      projectimg: resizedImagePath, // Use the resized image path for the logo
      project_title,
      project_desc,
      more_project_desc,
      btn_txt,
      btn_link,
      status,
    });

    // Save the service data to the database
    await projectsData.save();

    // Send a success response
    return res.status(201).json({
      message: "Projects details saved successfully in the database!",
    });
  } catch (error) {
    console.error("Error in postPeojectsData: ", error);
    return res
      .status(500)
      .json({ err: "An error occurred while saving Projects data." });
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
    // Destructure data from req.body (form fields)
    const { _id, project_title, project_desc, btn_txt, btn_link , more_project_desc } = req.body;

    // Validate the presence of _id
    if (!_id) {
      return res.status(400).json({
        err: "ID is required to update the data.",
      });
    }

    // Check if the document with the given ID exists
    const projectsData = await ProjectsModel.findById(_id);
    if (!projectsData) {
      return res.status(404).json({
        err: "ID not found. Please provide a valid ID.",
      });
    }

    // Initialize resizedImagePath with the old image path
    let resizedImagePath = projectsData.projectimg;

    // Check if a new image file is uploaded
    if (req.file) {
      const imagePath = req.file.path; // Original image path

      // Resize the image to the desired dimensions using Sharp
      resizedImagePath = path.join("uploads", `resized_${req.file.filename}`); // Define a new path for resized image
      await sharp(imagePath)
        .resize(180, 180) // Set desired width and height
        .toFile(resizedImagePath); // Save resized image to the new path
    }

    // Validate required fields
    if (!project_title || !project_desc || !btn_txt || !btn_link || !more_project_desc) {
      return res.status(400).json({
        err: "All fields are required, including Project title, description, button text, and status.",
      });
    }

    // Create an object to hold the updates
    const updateData = {
      project_title,
      project_desc,
      more_project_desc ,
      btn_txt,
      btn_link,
      projectimg: resizedImagePath, // Use the resized image path (or keep the old one if no new image)
      updatedAt: Date.now(), // Update the timestamp
    };

    // Update the service data
    const updatedProjectsData = await ProjectsModel.findByIdAndUpdate(
      _id, // Filter by ID
      updateData,
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Projects details updated successfully!",
      data: updatedProjectsData,
    });
  } catch (error) {
    console.error("Error updating Projects data:", error);
    return res.status(500).json({
      err: "An error occurred, unable to update Projects details.",
    });
  }
};






  const deleteProjectsData = async (req, res) => {
    try {
      // Destructure data from req.body (form fields)
      const  _id  = req.params.id;
  
      // Validate required fields
      if (!_id) {
        return res.status(400).json({ err: "Projects ID is required!" });
      }
  
      // Find the existing service data by ID and delete it
      const projectsData = await ProjectsModel.findByIdAndDelete(_id);
  
      // Check if the service data exists
      if (!projectsData) {
        return res.status(404).json({ error: "Projects data not found!" });
      }
  
      // Construct the full path to the image file
      const fullImagePath = path.join(__dirname, "..", projectsData.projectimg); // Adjust the path as needed
  
      // Delete the associated image file
      fs.unlink(fullImagePath, (err) => {
        if (err) {
          console.error(`Error deleting image file: ${fullImagePath}`, err);
          // Optionally log this error but still return the success response
        }
      });
  
      // Send a success response
      return res.status(200).json({
        message: "Projects data and associated image deleted successfully!",
        data: projectsData, // Return the deleted service data
      });
    } catch (error) {
      console.error("Error deleting Projects data:", error);
      return res.status(500).json({ err: "An error occurred, unable to delete Projects data." });
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
        const updatedStatus = (projectsData.status === "1" || projectsData.status === 1) ? "0" : "1";
    
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
        return res.status(500).json({ err: "An error occurred, unable to update Projects status." });
      }
    };
    
 

 
module.exports = {
  postProjectsData,
  getProjectsData,
  updateProjectsData,
  deleteProjectsData,
  changeStatusProjectsData

};
