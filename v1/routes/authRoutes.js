const {
  AdminLogin,
  AdminLoginpost,
  AddAmountByAdmin,
  SumbitPaymentDetails,
  getPaymentDetails,
  updatePaymentStatus,
  addDelar,
  getAllDelar,
  deleteDelarRegister,
  changePassDelarRegister,
} = require("../controller/authController");

const {
  updateDataSite,
  getDataSite,
} = require("../controller/siteSettingController");
const router = require("express").Router();

const multer = require("multer");
const {
  postSocialMedia,
  getSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
  changeStatusSocialMedia,
} = require("../controller/socialMediaController");
const {
  updateFooterData,
  getFooterData,
} = require("../controller/footerController");
const {
  postBannerData,
  getBannerData,
  updateBannerData,
  deleteBannerData,
  changeStatusBannerData,
} = require("../controller/bannerController");
const {
  postAboutData,
  getAboutData,
  updateAboutData,
  deleteAboutData,
  changeStatusAboutData,
} = require("../controller/aboutController");
const {
  updateContactData,
  getContactData,
} = require("../controller/contactController");
const {
  postContactForm,
  getContactForm,
  deleteContactForm,
} = require("../controller/contactFormController");
const {
  postServicesData,
  getServicesData,
  updateServicesData,
  deleteServicesData,
  changeStatusServicesData,
} = require("../controller/servicesController");
const {
  postProjectsData,
  getProjectsData,
  updateProjectsData,
  deleteProjectsData,
  changeStatusProjectsData,
} = require("../controller/projectsController");
const {
  postTeamData,
  getTeamData,
  updateTeamData,
  deleteTeamData,
  changeStatusTeamData,
} = require("../controller/teamController");
const {
  PartnerLogin,
  PartnerRegister,
  GetPartnerRegister,
  updatePartnerRegister,
  deletePartnerRegister,
  changePassPartnerRegister,
  GetSpecialpartnerData,
} = require("../controller/userAuthController");
const {
  postLoanData,
  getLoanData,
  updateLoanData,
  deleteLoanData,
  changeStatusLoanData,
} = require("../controller/loanDataController");
const {
  postUserApplyForm,
  getUserApplyForm,
  deleteUserApplyForm,
  updateUserApplyForm,
} = require("../controller/applyFormController");
const {
  forgotPasswordSendOtp,
  UserRegisterverifyOtp,
  forgotChangePasswordUser,
} = require("../controller/forgotPasswordController");
const { getReportStatus } = require("../controller/reportController");
const {
  postUserApplyFormStatus,
  postUserApplyFormChangeStatus,
  getTransitionHistory,
} = require("../controller/reportStatusController");
const { postlinkWithHttpData, getlinkWithHttpData, deletelinkWithHttpData } = require("../controller/linkWithHttpDataController");
const { getpayments, handlePaymentWebhook } = require("../controller/razorPayController");

 

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, process.env.IMG_DIR_PATH); // Specify the directory for file storage
//     },
//     filename: (req, file, cb) => {
//       // Generate a unique filename using a timestamp and the original file name
//       const uniqueFilename = Date.now() + "-" + file.originalname;
//       req.fileName = uniqueFilename;
//       cb(null, uniqueFilename);
//     },
//   });
//   const upload = multer({ storage: storage });

// Multer configuration
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// admin routes
router.post("/login", AdminLogin);
router.post("/loginPost", AdminLoginpost);

// User Partner routes
router.post("/User-login", PartnerLogin);
router.post("/User-reg", upload.single("Avtar"), PartnerRegister);
router.get("/User-reg", GetPartnerRegister);
router.post("/getSpeacialParthner", GetSpecialpartnerData);
router.put("/update-User-reg",upload.single("Avtar"), updatePartnerRegister);
router.post("/delete-User-reg/:id", deletePartnerRegister);
router.post("/change-pass-User-reg", changePassPartnerRegister);

// site setting Routes
router.put(
  "/site_setting",
  upload.fields([
    { name: "favicon", maxCount: 1 },
    { name: "site_logo", maxCount: 1 },
  ]),
  updateDataSite
);
router.get("/site_setting", getDataSite);

// social apis Routes
router.post("/social_media", postSocialMedia);
router.get("/social_media", getSocialMedia);
router.put("/social_media", updateSocialMedia);
router.delete("/social_media/:id", deleteSocialMedia);
router.put("/social_media/chanege_status", changeStatusSocialMedia);

//footer  api's routes
router.put("/footer_data", updateFooterData);
router.get("/footer_data", getFooterData);

// banner Api's
router.post("/banner_details", upload.single("bannerimg"), postBannerData);
router.get("/banner_details", getBannerData);
router.put("/banner_details", upload.single("bannerimg"), updateBannerData);
router.delete("/banner_details/:id", deleteBannerData);
router.put("/banner_details/chanege_status", changeStatusBannerData);

// about apis routes
router.post("/about_details", upload.array("images", 2), postAboutData);
router.get("/about_details", getAboutData);
router.put("/about_details", upload.array("images", 2), updateAboutData);
router.delete("/about_details/:id", deleteAboutData);
router.put(
  "/about_details/chanege_status",

  changeStatusAboutData
);

// Contact Us apis routes
router.put("/contact_data", updateContactData);
router.get("/contact_data", getContactData);

// Contact Us  formapis routes
router.post("/contact_form", postContactForm);
router.get("/contact_form", getContactForm);
router.delete("/contact_form/:id", deleteContactForm);

// Our Servies apis routes
router.post("/services_details", upload.single("serviceimg"), postServicesData);
router.get("/services_details", getServicesData);
router.put(
  "/services_details",
  upload.single("serviceimg"),
  updateServicesData
);
router.delete("/services_details/:id", deleteServicesData);
router.put("/services_details/chanege_status", changeStatusServicesData);

// Our Project apis routes
router.post(
  "/projects_details",

  upload.single("projectimg"),
  postProjectsData
);
router.get("/projects_details", getProjectsData);
router.put(
  "/projects_details",
  upload.single("projectimg"),
  updateProjectsData
);
router.delete("/projects_details/:id", deleteProjectsData);
router.put("/projects_details/chanege_status", changeStatusProjectsData);

// our Team
router.post("/team_details", upload.single("teamimg"), postTeamData);
router.get("/team_details", getTeamData);
router.put("/team_details", upload.single("teamimg"), updateTeamData);
router.delete("/team_details/:id", deleteTeamData);

router.put("/team_details/chanege_status", changeStatusTeamData);

// user Apply loan form
router.post(
  "/user_apply_form",
  upload.fields([
    { name: "document1", maxCount: 1 },
    { name: "document2", maxCount: 1 },
    { name: "document3", maxCount: 1 },
  ]),
  postUserApplyForm
);
router.get("/user_apply_form", getUserApplyForm);
router.delete("/user_apply_form/:id", deleteUserApplyForm);
router.post(
  "/user_apply_form/:id",
  upload.fields([
    { name: "document1", maxCount: 1 },
    { name: "document2", maxCount: 1 },
    { name: "document3", maxCount: 1 },
  ]),
  updateUserApplyForm
);
// router.delete("/contact_form/:id", deleteContactForm );

// Loan Servies apis routes
router.post("/loan_details", upload.single("loanimg"), postLoanData);
router.get("/loan_details", getLoanData);
router.put("/loan_details", upload.single("loanimg"), updateLoanData);
router.delete("/loan_details/:id", deleteLoanData);
router.put("/loan_details/chanege_status", changeStatusLoanData);

/// foorgot password
router.post("/changePassSendOtp", forgotPasswordSendOtp);
router.post("/verifyOtp", UserRegisterverifyOtp);
router.post("/resetPassword", forgotChangePasswordUser);

// get report of form
router.post("/reportStatus", getReportStatus);

//report status
router.post("/user_apply_form-change-status", postUserApplyFormChangeStatus);

router.post(
  "/user_apply_form-status",
  upload.fields([
    { name: "document4", maxCount: 1 },
    { name: "document5", maxCount: 1 },
    { name: "document6", maxCount: 1 },
    { name: "document7", maxCount: 1 },
  ]),
  postUserApplyFormStatus
);
router.get("/get-transition-data/:id", getTransitionHistory);

router.post("/addAmountByAdmin", AddAmountByAdmin);

router.post("/SumbitPaymentDetails", SumbitPaymentDetails);
router.get("/getPaymentDetails", getPaymentDetails);
router.put("/updatePaymentStatus", updatePaymentStatus);

// Contact Us  formapis routes
router.post("/linkWithHttpData", postlinkWithHttpData);
router.get("/linkWithHttpData", getlinkWithHttpData);
router.delete("/linkWithHttpData/:id", deletelinkWithHttpData);

//add and get delar data 

router.post("/addDelar", addDelar);
router.get("/getAllDelar", getAllDelar);

router.post("/deleteDelarRegister/:id",  deleteDelarRegister);
router.post("/changePassDelarRegister", changePassDelarRegister);




router.post("/testGetway" , getpayments );
router.post("/payment-success" , handlePaymentWebhook  );



module.exports = router;
