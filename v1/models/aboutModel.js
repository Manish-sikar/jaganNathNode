const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  about_heading: {
    type: String,
    required: true,
  },
  desc_about: {
    type: String,
    required: true,
  },
  about_images: {
    type: [String], // Changed from String to an array of Strings
  },
  status: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AboutModel = mongoose.model("about_site", aboutSchema);

module.exports = AboutModel;
