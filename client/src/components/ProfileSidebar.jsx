import React, { useState } from "react";
import { RiArrowDropDownLine, RiArrowDropUpLine, profile } from "../assets";
import { useAuth } from "../context/AuthContext";

export default function ProfileSidebar({ onlineUsers }) {
  const { user, logout } = useAuth();

  const colapseFieldValues = [
    {
      title: "Name",
      value: user.username,
    },
    {
      title: "Email",
      value: user.email,
    },
  ];

  const [isColapsed, setIsColapsed] = useState(false);

  // Determine online status based on onlineUsers prop if available
  const isUserOnline = onlineUsers ? onlineUsers.has(user._id) : user.isOnline;

  return (
    <div className="w-[380px] md:w-screen h-full px-5 py-6">
      <div>
        <div className="flex justify-between">
          <h1 className="text-black font-semibold text-2xl dark:text-white">
            My Profile
          </h1>

          {/* Changed from a <div> to a <button> to ensure reliable click handling */}
          <button
            onClick={logout}
            className="text-red-500 cursor-pointer text-sm font-medium bg-transparent border-none"
          >
            Log out
          </button>
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-3 my-10">
          {/* Added relative wrapper and online indicator */}
          <div className="relative">
            <img
              className="size-32 rounded-full object-cover"
              src={user.avatarUrl}
              alt={user.username}
            />
            {/* Online/Offline Indicator */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isUserOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
          </div>
          <p className="text-black font-medium text-xl dark:text-white">
            {user.username}
          </p>

          <p className="text-left text-gray-500 text-base">
            {user.bio || "no bio"}
          </p>
        </div>

        <div className="about">
          <div
            className="about-card flex items-center justify-between py-2 px-4 rounded-sm bg-backgroundLight1 cursor-pointer dark:bg-backgroundDark3 shadow-lg dark:text-white"
            onClick={() => setIsColapsed(!isColapsed)}
          >
            <div className="text-md font-medium">About</div>
            <div className="text-2xl">
              {isColapsed ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
            </div>
          </div>
          <div
            className={`colapse py-2 px-4 bg-white rounded-sm dark:bg-backgroundDark3 dark:text-white ${
              isColapsed ? "block h-fit" : "hidden h-0"
            }`}
          >
            {colapseFieldValues.map(({ title, value }, index) => (
              <div className="mb-5" key={index}>
                <p className="text-sm text-gray-500">{title}</p>
                <h5 className="text-base">{value}</h5>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
