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

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  socketEvents: {},
  userStatus: {},
});

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
  UPDATE_USER_STATUS_EVENT: "updateUserStatus", // Add the user status update event
};

const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userStatus, setUserStatus] = useState({}); // Store statuses of all users

  // Establish socket connection
  const connectSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = getSocket();

      // Event handling for socket connection
      socketRef.current.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected!"); // Ensure socket is connected before updating status
      });
      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected!");
      });

      // Handle the update of user status
      socketRef.current.on(socketEvents.UPDATE_USER_STATUS_EVENT, (data) => {
        console.log("User status updated:", data); // Log status
        // Update the state that holds the user status
        setUserStatus((prevStatus) => ({
          ...prevStatus,
          [data.userId]: data.status, // Update or add new user status
        }));
      });
    }
  }, []);

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off(socketEvents.UPDATE_USER_STATUS_EVENT); // Clean up user status event listener
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketEvents, isConnected, userStatus, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
