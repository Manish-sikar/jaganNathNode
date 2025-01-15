const mongoose = require("mongoose");

const socialSchema = new mongoose.Schema({
  icon_name: {
    type: String,
    required: true,
  },
  icon_class: {
    type: String,
    required: true,
  },
  icon_url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SocialModel = mongoose.model("social_media", socialSchema);

module.exports = SocialModel;
