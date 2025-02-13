import { Namespace, Socket } from "socket.io";
import { Request } from "express";

// Emit socket event to notify other users about the status update
export const emitSocketEvent = (req: Request, userId: string, event: string, data: any) => {
  const io = req.app.get("io") as Namespace;  // Get the Socket.io namespace

  // Emit the event to all clients except the one whose status is being updated
  io.emit(event, data);  // Broadcast to all clients
};
