import React, { useContext } from "react";
import SingleChat from "./SingleChat";
import { ChatContext } from "../App";

export default function ChatArea() {
  const chatContextValue = useContext(ChatContext); // Use the context

  return <div className="chatArea-container">
    <SingleChat chatData={chatContextValue} /> {/* Pass context data if needed */}
  </div>;
}
