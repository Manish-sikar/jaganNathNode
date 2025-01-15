const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./v1/routes/authRoutes");
const path = require("path"); // Import the path module
const cors = require("cors");
const http = require("http");
const connectToDatabase = require("./database/mongoseConnection");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4041;

app.use(bodyParser.json());
app.use(express.json())
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use('/api/admin/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/admin", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to admin page Node Backend");
});


// Start the server
app.listen(PORT, async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.log(error);
  }
  console.log(`Server is running on port ${PORT}`);
});
