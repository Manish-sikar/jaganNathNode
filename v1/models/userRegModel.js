const mongoose = require('mongoose');

// Define the Customer schema
const partnerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
  },
  mobile: {
    type: String,
    required: true,
    unique: true, // Ensures mobile number is unique
  },
  balance: {
    type: String,
    required: true,
    default: "0", // Default balance set to "0"
  },
  institutionName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  panNo: {
    type: String,
    required: true,
    unique: true,
  },
  aadharNo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  JN_Id: {
    type: String,
    required: true,
    unique:true
  },
  Avtar: {
    type: String,
  },
  acDetails: {
    type: String,
  },
});

// Create and export the Partner model
const Partner = mongoose.model('Partner', partnerSchema);
module.exports = Partner;
