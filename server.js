const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./v1/routes/authRoutes");
const path = require("path"); // Import the path module
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const { initializeSocketServer } = require("./v1/socket/socketServer.js");
const connectToDatabase = require("./database/mongoseConnection");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4041;
const SOCKET_PORT = process.env.SOCKET_PORT || 4040;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
app.use('/api/admin/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/admin", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to admin page Node Backend");
});

app.get('/api/admin/uploads/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filepath = path.join(__dirname, 'uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).send('File not found');
    }

    res.sendFile(filepath);
  } catch (err) {
    console.error('Error serving file:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
initializeSocketServer(SOCKET_PORT);
const server = http.createServer(app);
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });


// Start the server
server.listen(PORT, async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.log(error);
  }
  console.log(`Server is running on port ${PORT}`);
});

