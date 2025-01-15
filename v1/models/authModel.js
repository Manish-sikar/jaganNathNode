
const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    UserName: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const LoginModel = mongoose.model('user', loginSchema);

module.exports = LoginModel;
