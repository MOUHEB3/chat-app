import React, { useEffect, useState } from "react";
import { BiSearch } from "../assets";
import { LocalStorage } from "../utils";
import { useChat } from "../context/ChatContext";
import RecentUserChatCard from "./RecentUserChatCard";
import Loading from "./Loading";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function RecentChatsSidebar() {
  const {
    currentUserChats,
    loadingChats,
    getCurrentUserChats,
    setMessages,
    getMessages,
    currentSelectedChat,
    isChatSelected,
    setIsChatSelected,
    setOpenAddChat, // used to open the AddChat modal for group creation
  } = useChat();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const [filteredRecentUserChats, setFilteredRecentUserChats] = useState(null);

  const getFilteredRecentChats = (e) => {
    const { value } = e.target;
    const usernameRegex = new RegExp(value, "i");

    if (value.trim() === "") {
      setFilteredRecentUserChats(currentUserChats);
    } else {
      setFilteredRecentUserChats(
        currentUserChats.filter((chat) => {
          if (chat?.isGroupChat) {
            return usernameRegex.test(chat.name);
          } else {
            return chat.participants.some((participant) => {
              if (participant._id === user._id) return false;
              return usernameRegex.test(participant.username);
            });
          }
        })
      );
    }
  };

  // This function sets a flag so that the AddChat modal knows to show the group creation UI.
  const handleCreateGroupChat = () => {
    LocalStorage.set("groupChat", true);
    setOpenAddChat(true);
  };

  useEffect(() => {
    setFilteredRecentUserChats(currentUserChats);
  }, [currentUserChats]);

  useEffect(() => {
    // Fetch the current user chats on mount.
    getCurrentUserChats();
  }, []);

  return (
    <div
      className={`px-5 py-6 md:p-2 w-full h-full md:${
        isChatSelected ? "hidden" : "block"
      }`}
    >
      {/* Top header with "Recent chats" title and the new group creation button */}
      <div className="top flex items-center justify-between">
        <h1 className="text-black font-medium text-xl dark:text-white">
          Recent chats
        </h1>
        <button
          onClick={handleCreateGroupChat}
          className="p-2 rounded-full hover:bg-blue-100 transition duration-200"
          title="Create Group Chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* Group chat (user add) icon */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3M6 14v-4a4 4 0 118 0v4m-8 0a4 4 0 108 0"
            />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-1 bg-backgroundLight3 dark:bg-backgroundDark1 dark:text-slate-300 p-3 rounded-md my-5">
        <div className="text-xl">
          <BiSearch />
        </div>
        <input
          type="text"
          onChange={getFilteredRecentChats}
          className="bg-transparent outline-none px-2 w-[90%]"
          placeholder="Search for chats..."
        />
      </div>

      {/* Chat list */}
      {loadingChats ? (
        <div className="flex justify-center items-center h-[calc(100vh-170px)]">
          <Loading />
        </div>
      ) : currentUserChats?.length === 0 ? (
        <div className="flex justify-center items-center h-52">
          <h1 className="text-2xl text-slate-400 dark:text-slate-500">
            No Recent chats
          </h1>
        </div>
      ) : (
        <div className="recentUserChats overflow-auto max-h-[calc(100vh-170px)] md:h-[calc(100vh-280px)]">
          {filteredRecentUserChats?.map((chat) => (
            <RecentUserChatCard
              key={chat._id}
              chat={chat}
              isActive={currentSelectedChat.current?._id === chat._id}
              onClick={(clickedChat) => {
                if (
                  currentSelectedChat.current?._id &&
                  currentSelectedChat.current?._id === clickedChat?._id
                )
                  return;
                LocalStorage.set("currentSelectedChat", clickedChat);
                currentSelectedChat.current = clickedChat;
                setIsChatSelected(true);
                setMessages([]);
                getMessages(currentSelectedChat.current?._id);
              }}
              // For one-to-one chats, pass the opponent's online status using socket context onlineUsers set.
              opponentOnline={
                !chat.isGroupChat &&
                (() => {
                  const opponent = chat.participants.find(
                    (participant) => participant._id !== user._id
                  );
                  // Convert opponent._id to a string before checking onlineUsers
                  return opponent ? onlineUsers.has(opponent._id.toString()) : false;
                })()
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
