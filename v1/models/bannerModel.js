const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  heading: {
    type: String,
    required: true,
  },
  desc_txt: {
    type: String,
    required: true,
  },
  btn_txt: {
    type: String,
    required: true,
  },
  btn_link: {
    type: String,
    required: true,
  } ,
  banner_img: {
    type: String,
  },
  status: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BannerModel = mongoose.model("top_banner", bannerSchema);

module.exports = BannerModel;
