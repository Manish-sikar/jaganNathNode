const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  projectimg: {
    type: String, // The path to the resized image (logo)
  },
  address_name: {
    type: String,
    required: true, // Title of the service card
  },
  address_link: {
    type: String,
    required: true, // Description of the service card
  },
  mob_no: {
    type: [String], // Array of strings to support multiple mobile numbers
    required: true,
  },
  email: {
    type: String,
    required: true, // URL link for the button action
  },
  iframe_link: {
    type: String,
    required: true, // URL link for the button action
  },
  open_days: {
    type: String,
  },
  open_hours: {
    type: String,
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
contactSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model using the schema
const ContactModel = mongoose.model("contact_data", contactSchema);

module.exports = ContactModel;
