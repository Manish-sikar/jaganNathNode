const mongoose = require("mongoose");


const teamSchema = new mongoose.Schema({
    teamimg: {
      type: String, // The path to the resized image (logo)
    },
    team_member: {
      type: String,
      required: true, // Team member name
    },
    degination: {
      type: String,
      required: true, // Team member designation
    },
    social_icons: [
      {
        icon_name: {
          type: String, 
          required: true, // Name of the social media icon
        },
        icon_url: {
          type: String, 
          required: true, // URL for the social media profile
        },
        icon_class: {
          type: String, 
          required: true, // CSS class for the social media icon
        }
      }
    ],
    status: {
      type: String,
      default: "1" // Default status (e.g., active)
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
  teamSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });
  
  // Create the model using the schema
  const TeamsModel = mongoose.model("teams_data", teamSchema);
  
  module.exports = TeamsModel;
  