import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Socket connection (ensure this URL is correct and the server is running)
const socket = io("http://localhost:5000");

const UserStatus = ({ userId }) => {
  const [status, setStatus] = useState("offline");

  useEffect(() => {
    // Listen for user status updates
    socket.on("updateUserStatus", (data) => {
      if (data.userId === userId) {
        setStatus(data.status); // Update status based on the emitted event
      }
    });

    return () => {
      // Cleanup: remove listeners on unmount
      socket.off("updateUserStatus");
    };
  }, [userId]);

  // Conditional class names based on the user status
  const statusClasses = {
    online: "bg-green-500",   // Green for online
    active: "bg-blue-500",    // Blue for active
    offline: "bg-gray-400",   // Gray for offline
  };

  return (
    <div className="relative">
      {/* Display the user's status as a dot */}
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          statusClasses[status] || statusClasses.offline // Default to offline if no match
        }`}
      ></span>
    </div>
  );
};

export default UserStatus;
