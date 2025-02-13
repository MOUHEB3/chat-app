import React from "react";
import ProfileSidebar from "./ProfileSidebar";
import RecentChatsSidebar from "./RecentChatsSidebar";
import SearchUserSidebar from "./SearchUserSidebar";
import { useChat } from "../context/ChatContext";

export default function ChatLeftSidebar({ activeLeftSidebar }) {
  const { setActiveLeftSidebar } = useChat();

  const renderLeftSidebar = () => {
    switch (activeLeftSidebar) {
      case "profile":
        return <ProfileSidebar />; // Profile with user status
      case "recentChats":
        return <RecentChatsSidebar />; // Recent chats with participants' statuses
      case "searchUser":
        return <SearchUserSidebar />; // Search users with their statuses
      default:
        return <ProfileSidebar />; // Default to ProfileSidebar
    }
  };

  return (
    <div className="w-[380px] md:w-full md:h-[calc(100vh-120px)] h-full bg-backgroundLight2 dark:bg-backgroundDark2 border-r-2 dark:border-none">
      {renderLeftSidebar()} {/* Renders the active sidebar */}
    </div>
  );
}
