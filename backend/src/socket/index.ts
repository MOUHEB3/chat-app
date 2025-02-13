import cookie from "cookie";
import User from "../database/model/User";
import { UserModel } from "../database/model/User";  // <-- New import for updating user status
import { Namespace, Socket } from "socket.io";
import { ChatEventEnum } from "../constants";
import { Server } from "http";
import { Application, Request } from "express";
import { BadTokenError, ApiError } from "../core/ApiError";
import JWT from "../core/JWT";
import userRepo from "../database/repositories/userRepo";
import colorsUtils from "../helpers/colorsUtils";
import { Types } from "mongoose";

// Declare the Socket interface to include 'user' property
declare module "socket.io" {
  interface Socket {
    user?: User;
  }
}

// Handles the join chat event, i.e., when a user joins a room
const mountJoinChatEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
    colorsUtils.log("info", "User joined a chat room. chatId: " + chatId);
    socket.join(chatId); // Join the user to a one-to-one or group chat room
  });
};

// Handle the start typing event
const mountStartTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.START_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.START_TYPING_EVENT, chatId);
  });
};

// Handle the stop typing event
const mountStopTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

// Function to initialize socket.io and manage connections
const initSocketIo = (io: any): void => {
  io.on("connection", async (socket: Socket) => {
    try {
      // Get the token from the cookies or handshake auth header
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      let token = cookies?.accessToken || socket.handshake.auth?.token;

      // If no token is found, throw a BadTokenError
      if (!token) {
        throw new BadTokenError("Token not found");
      }

      // Validate the token
      const decodedToken = await JWT.validateToken(token);

      // Retrieve user info based on token data
      const userId = new Types.ObjectId(decodedToken.sub);
      const user = await UserModel.findById(userId);


      if (!user) {
        throw new BadTokenError("Invalid token");
      }

      // Set the user on the socket
      socket.user = user;
      socket.join(user._id.toString());

      // Update online status to true upon connection
      await UserModel.findByIdAndUpdate(user._id, { isOnline: true, status: "online" });

      // Emit status to all users about the user's online status
      io.emit("updateUserStatus", { userId: user._id.toString(), status: "online" });

      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      colorsUtils.log("info", "🤝 User connected. userId: " + user._id.toString());

      // Handle other socket events like typing events and joining chats
      mountJoinChatEvent(socket);
      mountStartTypingEvent(socket);
      mountStopTypingEvent(socket);

      // Listen for user status changes (e.g., away, do not disturb)
      socket.on("set-status", async (status: string) => {
        if (user && ["active", "away", "dnd"].includes(status)) {
          // Update user status in the database
          await UserModel.findByIdAndUpdate(user._id, { status });

          // Notify others about the status change
          io.emit("updateUserStatus", { userId: user._id.toString(), status });
        }
      });

      // Disconnect event: update online status to offline and notify clients
      socket.on("disconnect", async () => {
        if (socket.user?._id) {
          const userId = socket.user._id.toString();
          await UserModel.findByIdAndUpdate(userId, { isOnline: false, status: "offline" });
          io.emit("updateUserStatus", { userId: socket.user._id.toString(), status: "offline" });

          // Update offline status in the database
          await UserModel.findByIdAndUpdate(user._id, { isOnline: false, status: "offline" });

          // Notify other users about the offline status
          io.emit("updateUserStatus", { userId: socket.user._id.toString(), status: "offline" });

          socket.leave(socket.user._id.toString());
        }
      });

    } catch (error) {
      // Handle errors and send socket-specific error response
      if (error instanceof ApiError) {
        // Emit the error directly to the socket
        socket.emit("error", error.message);
      } else {
        socket.emit("error", "Something went wrong with the connection");
      }
    }
  });
};

// Emit socket event to notify other users about the status update
const emitSocketEvent = (
  req: Request,
  roomId: string,
  event: ChatEventEnum,
  payload: any
): void => {
  const io = req.app.get("io") as Namespace;
  io.in(roomId).emit(event, payload);
};

export { initSocketIo, emitSocketEvent };
