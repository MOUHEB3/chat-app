import { Namespace } from "socket.io";
import { Request } from "express";

// Emit socket event to notify other users about the status update
export const emitSocketEvent = (req: Request, userId: string, event: string, status: string) => {
  const io = req.app.get("io") as Namespace;
  const data = { userId, status }; // Passing 'status' directly

  // Emit event to specific user
  io.to(userId).emit(event, data);

  // Optionally, broadcast to all users
  // io.emit(event, data);
};


  
  // Alternatively, if you want to broadcast to all clients:
  // io.emit(event, data); // Broadcast to all connected clients

