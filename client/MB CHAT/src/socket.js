// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: false, // Disable credentials to avoid CORS issues
  transports: ["websocket"], // Force using websockets for better performance
});

// Event listener for connection errors.
socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err);
});

// Log reconnection attempts.
socket.on("reconnect_attempt", () => {
  console.log("Socket attempting to reconnect...");
});

// Log successful connection.
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

// Listen for real-time chat deletion events
socket.on("chatDeleted", (data) => {
  console.log("Chat deleted event received:", data);
  // Here, you can dispatch an action or update state to remove the chat from your UI.
});

// Listen for real-time message deletion events
socket.on("messageDeleted", (data) => {
  console.log("Message deleted event received:", data);
  // Here, you can dispatch an action or update your state to remove the deleted message.
  // Example (if using Redux):
  // store.dispatch(removeMessage(data.messageId));
  //
  // Or if using React state, call a function to update your state:
  // updateMessages(prevMessages => prevMessages.filter(msg => msg._id !== data.messageId));
});

// Log disconnections.
socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;
