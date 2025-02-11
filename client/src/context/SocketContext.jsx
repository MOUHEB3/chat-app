import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { LocalStorage } from "../utils";
import socketio from "socket.io-client";

// Method to establish a socket connection
const getSocket = () => {
  const token = LocalStorage.get("token"); // Get token from local storage
  return socketio(import.meta.env.VITE_SOCKET_URI, {
    withCredentials: true,
    auth: { token },
    reconnection: true, // ✅ Enables automatic reconnection
    reconnectionAttempts: 5, // ✅ Limits reconnection attempts
    reconnectionDelay: 3000, // ✅ 3s delay before trying to reconnect
  });
};

const SocketContext = createContext({ socket: null, isConnected: false });

// Custom hook to access socket instance from context
const useSocket = () => useContext(SocketContext);

const socketEvents = {
  CONNECTED_EVENT: "connected",
  DISCONNECT_EVENT: "disconnect",
  JOIN_CHAT_EVENT: "joinChat",
  NEW_CHAT_EVENT: "newChat",
  TYPING_EVENT: "typing",
  STOP_TYPING_EVENT: "stopTyping",
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  LEAVE_CHAT_EVENT: "leaveChat",
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  MESSAGE_DELETE_EVENT: "messageDeleted",
  USER_ONLINE: "userOnline",
  USER_OFFLINE: "userOffline",
};

const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const connectSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = getSocket();

      // ✅ Proper event handling with cleanup
      socketRef.current.on("connect", () => setIsConnected(true));
      socketRef.current.on("disconnect", () => setIsConnected(false));

      socketRef.current.on("updateUserStatus", ({ userId, status }) => {
        setOnlineUsers((prev) => {
          const updatedUsers = new Set(prev);
          status === "online" ? updatedUsers.add(userId) : updatedUsers.delete(userId);
          return updatedUsers;
        });
      });
    }
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off("updateUserStatus");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketEvents, isConnected, onlineUsers, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
