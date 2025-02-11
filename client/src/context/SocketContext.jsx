import { createContext, useContext, useEffect, useState } from "react";
import { LocalStorage } from "../utils";
import socketio from "socket.io-client";

// method to establish a socket connection
const getSocket = () => {
  const token = LocalStorage.get("token"); // get token from local storage
  // create a socket connection with the provided URI and authentication
  return socketio(import.meta.env.VITE_SOCKET_URI, {
    withCredentials: true,
    auth: { token },
  });
};

const SocketContext = createContext({ socket: null, isConnected: false });

// custom hook to access socket instance from context
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
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    // Listen for connection and disconnection events to update connection status
    socketInstance.on("connect", () => setIsConnected(true));
    socketInstance.on("disconnect", () => setIsConnected(false));

    // Listen for online/offline status updates from the server using "updateUserStatus" event
    socketInstance.on("updateUserStatus", ({ userId, status }) => {
      if (status === "online") {
        setOnlineUsers((prev) => new Set(prev).add(userId));
      } else if (status === "offline") {
        setOnlineUsers((prev) => {
          const updatedUsers = new Set(prev);
          updatedUsers.delete(userId);
          return updatedUsers;
        });
      }
    });

    // Disconnect socket when component unmounts
    return () => {
      if (socketInstance) {
        socketInstance.off("connect");
        socketInstance.off("disconnect");
        socketInstance.off("updateUserStatus");
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketEvents, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
