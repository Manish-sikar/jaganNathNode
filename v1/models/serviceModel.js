const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema({
  card_logo: {
    type: String // The path to the resized image (logo)
  },
  card_title: {
    type: String,
    required: true, // Title of the service card
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
servicesSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model using the schema
const ServicesModel = mongoose.model("Service", servicesSchema);

module.exports = ServicesModel;
