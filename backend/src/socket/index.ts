import cookie from "cookie";
import User from "../database/model/User";
import { UserModel } from "../database/model/User";  // <-- New import for updating user status
import { Namespace, Socket } from "socket.io";
import { ChatEventEnum } from "../constants";
import { Server } from "http";
import { Application, Request } from "express";
import { BadTokenError } from "../core/ApiError";
import JWT from "../core/JWT";
import userRepo from "../database/repositories/userRepo";
import colorsUtils from "../helpers/colorsUtils";
import { Types } from "mongoose";

declare module "socket.io" {
  interface Socket {
    user?: User;
  }
}

// handles the join chat event i.e. when a user joins a room
const mountJoinChatEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
    colorsUtils.log("info", "user joined a chat room. chatId: " + chatId);
    socket.join(chatId); // join the user to a one-to-one or group chat room
  });
};

// handle the start typing event
const mountStartTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.START_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.START_TYPING_EVENT, chatId);
  });
};

// handle the stop typing event
const mountStopTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

// function to initialize the socket.io
const initSocketIo = (io: any): void => {
  io.on("connection", async (socket: Socket) => {
    try {
      // get the token from the cookies or the handshake auth header
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      let token = cookies?.accessToken || socket.handshake.auth?.token;

      // throw an error if the token is not found
      if (!token) {
        throw new BadTokenError("Token not found");
      }

      // decode the token
      const decodedToken = await JWT.validateToken(token);

      // get user info
      const userId = new Types.ObjectId(decodedToken.sub);
      const user = await userRepo.findById(userId);

      if (!user) {
        throw new BadTokenError("Invalid token");
      }

      socket.user = user;
      socket.join(user._id.toString());

      // Update online status to true upon connection
      await UserModel.findByIdAndUpdate(user._id, { isOnline: true, status: "online" });

      // Notify other users about the online status
      io.emit("updateUserStatus", { userId: user._id.toString(), status: "online" });

      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      colorsUtils.log("info", "🤝 User connected. userId: " + user._id.toString());

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

      // disconnect event: update online status to offline and notify clients
      socket.on("disconnect", async () => {
        if (socket.user?._id) {
          await UserModel.findByIdAndUpdate(socket.user._id, { isOnline: false, status: "offline" });

          // Notify other users about the offline status
          io.emit("updateUserStatus", { userId: socket.user._id.toString(), status: "offline" });

          socket.leave(socket.user._id.toString());
        }
      });
      
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        "something went wrong while connecting to socket"
      );
    }
  });
};

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
