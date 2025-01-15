const mongoose = require("mongoose");

const contactFormSchema = new mongoose.Schema({
    contact_name: {
    type: String,
    required: true, // Title of the service card
  },
  contact_email: {
    type: String,
    required: true, // Description of the service card
  },
  contact_project: {
    type: String,
    required: true, // Button text (e.g., "Learn More", "Buy Now")
  },
  contact_project: {
    type: String,
    required: true, // URL link for the button action
  },
  contact_message: {
    type: String,
    required: true, // URL link for the button action
  },
  status: {
    type: Number,
    required: true, // URL link for the button action
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
contactFormSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model using the schema
const ContactFormModel = mongoose.model("contact_formData", contactFormSchema);

module.exports = ContactFormModel;
