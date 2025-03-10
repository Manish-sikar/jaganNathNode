// socketServer.js

const { Server } = require("socket.io");
let io; // Global Socket.IO instance

let onlineUser=0 ;

const initializeSocketServer = (socketPort = 4040) => {
  const httpServer = require("http").createServer(); // Create HTTP Server
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000",
        "https://www.jasnathfinance.in",
        "https://jasnathfinance.in"], // Replace with your React app's URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    onlineUser++
    console.log("New client connected:", socket.id);
    io.emit("updateOnlineUser", onlineUser);

    socket.on("disconnect", () => {
      onlineUser--
      console.log("Client disconnected:", socket.id);
      io.emit("updateOnlineUser", onlineUser);
    });
    socket.on("chat message", (message) => {
      console.log("Received chat message:", message);
      io.emit("chat message", message); // Broadcast message to all clients
    });
  });

  httpServer.listen(socketPort, () => {
    console.log(`Socket.IO server is running on port ${socketPort}`);
  });
};

const emitEvent = (eventName, data) => {
  if (io) {
    io.emit(eventName, data);
    console.log(`Event ${eventName} emitted with data:`, data);
  } else {
    console.error("Socket.IO server is not initialized.");
  }
};

module.exports = { initializeSocketServer, emitEvent };
