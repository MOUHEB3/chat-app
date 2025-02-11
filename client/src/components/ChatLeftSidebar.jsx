import React from "react";
import ProfileSidebar from "./ProfileSidebar";
import RecentChatsSidebar from "./RecentChatsSidebar";
import SearchUserSidebar from "./SearchUserSidebar";
import SideMenu from "./SideMenu";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../context/SocketContext"; // <-- Added import for online status

// NOTE: To display each user's online/offline status,
// ensure that your child components (ProfileSidebar, RecentChatsSidebar, SearchUserSidebar)
// render an online indicator (e.g. a small dot) based on each user's isOnline property.

export default function ChatLeftSidebar({ activeLeftSidebar }) {
  const { setActiveLeftSidebar } = useChat();
  const { onlineUsers } = useSocket(); // <-- Retrieve onlineUsers from context

  const renderLeftSidebar = () => {
    switch (activeLeftSidebar) {
      case "profile":
        return <ProfileSidebar onlineUsers={onlineUsers} />;
      case "recentChats":
        return <RecentChatsSidebar onlineUsers={onlineUsers} />;
      case "searchUser":
        return <SearchUserSidebar onlineUsers={onlineUsers} />;
      default:
        return <ProfileSidebar onlineUsers={onlineUsers} />;
    }
  };

  return (
    <div className="w-[380px] md:w-full md:h-[calc(100vh-120px)] h-full bg-backgroundLight2 dark:bg-backgroundDark2 border-r-2 dark:border-none">
      {renderLeftSidebar()}
    </div>
  );
}
