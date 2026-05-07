const express = require("express");
const app = express();
const dotEnv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("../backend/routes/userRoutes");
const chatRoutes = require("../backend/routes/chatRoute");
const messageRoute = require("../backend/routes/messageRoute");
const userModel = require("./models/userModel");

app.use(cors());

dotEnv.config();

app.use(express.json());

// Register routes
app.get("/", (req, res) => {
  return res.send("WORKING");
});

app.use("/chat", userRoutes);
app.use("/mainchat", chatRoutes);
app.use("/message", messageRoute);
app.use("/uploads", express.static("uploads"));

// Database connection and server startup
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    
    // Start server only after DB connection is successful
    const server = app.listen(process.env.DB_PORT, () => {
      console.log(`✅ Server is running on port ${process.env.DB_PORT}`);
    });
    
    setupSocketIO(server);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Make sure MongoDB is running and DB_URI in .env is correct");
    process.exit(1);
  });

// Socket.IO setup
function setupSocketIO(server) {
  const io = require("socket.io")(server, {
    pingTimeout: 1000,
    cors: {
      origin: "*",
      // methods: ["GET", "POST", "PUT", "DELETE"],
      // credentials: true,
    },
  });

  io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("disconnect", (reason) => {
    if (reason === "ping timeout") {
      // Perform actions when a ping timeout occurs
      // console.log("Ping timeout occurred for :", socket.id);
      // Perform custom cleanup or other operations
      // For example, you might remove the disconnected socket from a data structure or update a database
    }
  });

  socket.on("setup", async (userData) => {
    socket.join(userData?._id);
    socket.emit("connected", socket.id);
    await userModel.findByIdAndUpdate(
      { _id: userData?._id },
      { isOnline: true }
    );
    socket.broadcast.emit("user online", "world");
  });

  socket.on("chat create", async (userId) => {
    const data = await userModel.findById(userId);

    io.to(data.socketId).emit("newuser joined", {
      userId,
      data: data.socketId,
    });
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) {
        return;
      } else {
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      }
    });
  });
  socket.on("message delete", (newMessageRecieved) => {
    newMessageRecieved &&
      newMessageRecieved.chatIds.forEach((ids) => {
        socket.in(ids).emit("message delete2", newMessageRecieved.data);
      });
  });

  socket.on("setup leave", async (userData) => {
    console.log("userData", userData);
    await userModel.findByIdAndUpdate(
      { _id: userData?._id },
      { isOnline: false }
    );
    socket.broadcast.emit("user online", "world");
    socket.leave(userData._id);
  });

  socket.on("leaving", async (userData) => {
    await userModel.findByIdAndUpdate(
      { _id: userData?._id },
      { isOnline: false }
    );
    socket.broadcast.emit("user online", "world");
    socket.leave(userData._id);
  });

  socket.on("pingTimeout", (user) => {
    // Perform actions when a pingTimeout occurs
    console.log("Ping timeout occurred for socket:", user, socket.id);
    // Perform custom cleanup or other operations
    // For example, you might remove the disconnected socket from a data structure or update a database
  });
  });
}