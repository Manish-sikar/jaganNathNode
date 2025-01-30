const mongoose = require("mongoose");

const FooterSchema = new mongoose.Schema(
  {
    footer_title: {
      type: String,
      required: true,
    },
    footer_desc: {
      type: String,
      required: true,
    },
    footer_social_details: [
      {
        icon_name: {
          type: String,
          required: true,
        },
        icon_url: {
          type: String,
          required: true,
        },
        icon_class: {
          type: String,
          required: true,
        },
      },
    ],

    footer_our_services: [
      {
        service_name: { type: String, required: true },
      },
    ],
    footer_other_services: [
      {
        service_name: { type: String, required: true },
      },
    ],
    footer_banking_services: [
      {
        service_name: { type: String, required: true },
      },
    ],

    footer_address1: {
      type: String,
      required: true,
    },
    footer_address2: {
      type: String,
      required: true,
    },
    footer_email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the schema as a model
const FooterModel = mongoose.model("footer_detail", FooterSchema);

module.exports = FooterModel;
