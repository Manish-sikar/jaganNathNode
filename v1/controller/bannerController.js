const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const BannerModel = require("../models/bannerModel");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});


// const postBannerData = async (req, res) => {
//   try {
//     const { title, heading, desc_txt, btn_txt, btn_link } = req.body;
//     const status = 1;

//     // Check if the file exists and extract the banner image path
//     if (!req.file) {
//       return res.status(400).json({ err: "Banner image is required." });
//     }

//     const imagePath = req.file.path; // Original image path

//     // Resize the image to 1920x1080 using Sharp
//     const resizedImagePath = path.join(
//       "uploads",
//       `resized_${req.file.filename}`
//     ); // Define a new path for resized image
//     await sharp(imagePath)
//       .resize(1450, 850) // Set width and height
//       .toFile(resizedImagePath); // Save resized image to a new file

//     // Update req.file.path to point to the resized image
//     req.file.path = resizedImagePath;

//     // Validate required fields
//     if (!title || !heading || !desc_txt || !btn_txt || !btn_link || !status) {
//       return res
//         .status(401)
//         .json({ err: "All fields are required, including banner image." });
//     }

//     // Create a new instance of BannerModel with the provided data
//     let banner_data = new BannerModel({
//       title,
//       heading,
//       desc_txt,
//       btn_txt,
//       btn_link,
//       banner_img: resizedImagePath, // Use the resized image path
//       status,
//     });

//     // Save the banner data to the database
//     await banner_data.save();

//     // Send a success response
//     return res.status(201).json({
//       message: "Banner details saved successfully in the database!",
//     });
//   } catch (error) {
//     console.error("Error in postBannerData: ", error);
//     return res
//       .status(500)
//       .json({ err: "An error occurred while saving banner data." });
//   }
// };


const postBannerData = async (req, res) => {
  try {
    const { title, heading, desc_txt, btn_txt, btn_link } = req.body;
    const status = 1;

    // Validate required fields
    if (!title || !heading || !desc_txt || !btn_txt || !btn_link) {
      return res.status(400).json({ err: "All fields are required." });
    }

    if (!req.file) {
      return res.status(400).json({ err: "Banner image is required." });
    }

    // Resize the image using Sharp
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(1650, 670) // Set dimensions
      .toFormat("jpeg")
      .toBuffer();

    // Generate a unique filename
    const uniqueFilename = `resized_${Date.now()}_${uuidv4()}.jpeg`;
    // const uploadParams = {
    //   Bucket: process.env.AWS_BUCKET_NAME, // S3 Bucket Name
    //   Key: `banners/${uniqueFilename}`, // File path in S3
    //   Body: resizedImageBuffer,
    //   ContentType: "image/jpeg",
    // };
    
    // Upload resized image to S3
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME, // S3 Bucket Name
      Key: `banners/${uniqueFilename}`, // File path in S3
      Body: resizedImageBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read", // Make file public
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    console.log(uploadResult)
    // Save banner details in the database
    const banner_data = new BannerModel({
      title,
      heading,
      desc_txt,
      btn_txt,
      btn_link,
      banner_img: uploadResult.Location, // S3 URL
      status,
    });

    await banner_data.save();

    return res.status(201).json({
      message: "Banner details saved successfully!",
      bannerImgUrl: uploadResult.Location,
    });
  } catch (error) {
    console.error("Error in banner_details:", error);
    return res.status(500).json({ err: "An error occurred while processing the request." });
  }
}



const getBannerData = async (req, res) => {
  try {
    // Check if the user exists in the database
    const bannerDetails = await BannerModel.find();
    if (!bannerDetails) {
      return res.status(404).json({ error: "banner details are not found " });
    }
    res.status(200).json({
      banner_Data: bannerDetails,
      message: "banner Details found sucessfully !! ",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateBannerData = async (req, res) => {
  try {
    const { _id, title, heading, desc_txt, btn_txt, btn_link } = req.body;
    const status = 1;

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ err: "Banner ID is required!" });
    }

    // Find the existing banner data by ID
    const bannerData = await BannerModel.findOne({ _id });
    if (!bannerData) {
      return res.status(404).json({ error: "Banner data not found" });
    }

    // Prepare update object
    const updateData = {
      title: title || bannerData.title,
      heading: heading || bannerData.heading,
      desc_txt: desc_txt || bannerData.desc_txt,
      btn_txt: btn_txt || bannerData.btn_txt,
      btn_link: btn_link || bannerData.btn_link,
      status: status || bannerData.status,
    };

    // Check if a new image was uploaded
    if (req.file) {
      // Resize image using Sharp
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize(1650, 670)
        .toFormat("jpeg")
        .toBuffer();

      // Generate a unique filename for the new image
      const uniqueFilename = `resized_${Date.now()}_${uuidv4()}.jpeg`;

      // Upload resized image to S3
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME, // S3 Bucket Name
        Key: `banners/${uniqueFilename}`, // File path in S3
        Body: resizedImageBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read", // Make file public
      };

      const uploadResult = await s3.upload(uploadParams).promise();

      // Delete old image from S3
      const oldImageKey = bannerData.banner_img.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
      if (oldImageKey) {
        try {
          await s3
            .deleteObject({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: oldImageKey,
            })
            .promise();
        } catch (err) {
          console.error("Error deleting old image from S3:", err);
        }
      }

      // Update banner image in database
      updateData.banner_img = uploadResult.Location; // S3 URL
    }

    // Update the banner data in the database
    const updatedBanner = await BannerModel.findOneAndUpdate(
      { _id },
      updateData,
      { new: true } // Return the updated document
    );

    // Send a success response
    return res.status(200).json({
      message: "Banner data updated successfully!",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update banner data." });
  }
};


const deleteBannerData = async (req, res) => {
  try {
    const { id: _id } = req.params; // Extract banner ID from request parameters

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ err: "Banner ID is required!" });
    }

    // Find the existing banner data by ID
    const bannerData = await BannerModel.findOneAndDelete({ _id });

    // Check if the banner data exists
    if (!bannerData) {
      return res.status(404).json({ error: "Banner data not found!" });
    }

    // Extract the S3 key from the banner image URL
    const bannerImgUrl = bannerData.banner_img;
    const s3Key = bannerImgUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];

    if (s3Key) {
      try {
        // Delete the image from S3
        await s3
          .deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
          })
          .promise();
      } catch (err) {
        console.error("Error deleting image from S3:", err);
        // Proceed without failing the entire request
      }
    }

    // Send a success response
    return res.status(200).json({
      message: "Banner data and associated image deleted successfully!",
      data: bannerData, // Return the deleted banner data
    });
  } catch (error) {
    console.error("Error deleting banner data:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to delete banner data." });
  }
};


const changeStatusBannerData = async (req, res) => {
  try {
    // Destructure data from req.body (form fields)
    const { _id } = req.body;

    // Check if the required ID is missing
    if (!_id) {
      return res.status(401).json({ err: "Banner ID is required!" });
    }

    // Find the existing banner data by ID
    const bannerData = await BannerModel.findById(_id);
    if (!bannerData) {
      return res.status(404).json({ error: "Banner data not found!" });
    }

    // Toggle the status: If current status is '1', set it to '0', and vice versa
    const updatedStatus =
      bannerData.status === "1" || bannerData.status === 1 ? "0" : "1";

    // Update the status of the banner data
    const updatedBannerData = await BannerModel.findByIdAndUpdate(
      _id, // Find the document by ID
      { status: updatedStatus }, // Set the new status
      { new: true } // Return the updated document
    );

    // Send a success response with the updated data
    return res.status(200).json({
      message: "Banner status updated successfully!",
      data: updatedBannerData,
    });
  } catch (error) {
    console.error("Error updating banner status:", error);
    return res
      .status(500)
      .json({ err: "An error occurred, unable to update banner status." });
  }
};

module.exports = {
  postBannerData,
  getBannerData,
  updateBannerData,
  deleteBannerData,
  changeStatusBannerData,
};
