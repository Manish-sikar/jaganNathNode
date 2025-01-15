const mongoose = require('mongoose');

// Define the site schema
const siteSchema = new mongoose.Schema({
  site_name: {
    type: String,
    required: true
  },
  site_short_name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  mobile_no: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Validate email format
  },
  Address: {
    type: String,
    required: true
  },
  favicon: {
    type: String, // Store the path to the uploaded favicon file
   
  },
  site_logo: {
    type: String, // Store the path to the uploaded site_logo file
   
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model from the schema
const SiteModel = mongoose.model('site_details', siteSchema);

module.exports = SiteModel;
