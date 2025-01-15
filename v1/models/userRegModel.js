// models/UserModel.js

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  birthday: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,

  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  state: {
    type: Number, // Can be mapped to a state ID or name, depending on your use case
    required: true,
  },
  city: {
    type: Number, // Similarly, can be mapped to city ID
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
