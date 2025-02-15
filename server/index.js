import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import userRoutes from "./Routes/userRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
dotenv.config();
app.use(express.json());

const connect_db = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to database:", error.message);
  }
};
connect_db();

app.get("/", (req, res) => {
  res.send("Welcome to Chat Now 2025");
});

app.use("/user", userRoutes);
app.use("/chats", chatRoutes);
app.use("/message", messageRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

const onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("setup", (userId) => {
    onlineUsers[userId] = socket.id;
    socket.join(userId);
    socket.emit("connected");
    io.emit("user online", userId);
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );
    if (userId) {
      delete onlineUsers[userId];
      io.emit("user offline", userId);
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing", room));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

  socket.on("new message", (newMessageStatus) => {
    const chat = newMessageStatus.chat;
    if (!chat.users) {
      return console.log("chat.users not found");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageStatus.sender._id) return;
      socket.in(user._id).emit("message received", newMessageStatus);
    });
  });
});
