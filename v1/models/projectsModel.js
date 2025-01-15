const mongoose = require("mongoose");

const projectsSchema = new mongoose.Schema({
    projectimg: {
    type: String // The path to the resized image (logo)
  },
  project_title: {
    type: String,
    required: true, // Title of the service card
  },
  project_desc: {
    type: String,
    required: true, // Description of the service card
  },
  more_project_desc: {
    type: String,
    required: true, // Description of the service card
  },
  btn_txt: {
    type: String,
    required: true, // Button text (e.g., "Learn More", "Buy Now")
  },
  btn_link: {
    type: String,
    required: true, // URL link for the button action
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the created date
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically sets the updated date, can be changed on update
  },
});

// Pre-save middleware to update the 'updatedAt' field whenever a document is modified
projectsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model using the schema
const ProjectsModel = mongoose.model("Projects_data", projectsSchema);

module.exports = ProjectsModel;
