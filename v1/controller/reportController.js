const UserApplyFormModel = require("../models/UserApplyFormModel");

const getReportStatus = async(req,res)=>{
    try {
        const {partnerEmail}=req.body
        const newpartnerEmail = `${String(partnerEmail)}`; 
            // Fetch partner data using JN_Id instead of ID
            const partnerData = await UserApplyFormModel.find({ partnerEmail:newpartnerEmail });
        // Retrieve all contact form details
    
        // Check if there are no records in the database
        if (partnerData.length === 0) {
          return res.status(404).json({
            error: "No contact form details found.",
          });
        }
    
        // Return the retrieved data with a success message
        return res.status(200).json({
          userForm_Data: partnerData,
          message: "User Apply form details retrieved successfully!",
        });
      } catch (error) {
        console.error("Error retrieving User Apply form details:", error);
        return res.status(500).json({
          error: "An internal server error occurred.",
        });
      }
}

module.exports={getReportStatus}
