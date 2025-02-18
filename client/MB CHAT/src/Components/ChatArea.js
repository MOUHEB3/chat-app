import React, { useContext } from "react";
import SingleChat from "./SingleChat";
import { ChatContext } from "../App";

export default function ChatArea() {
  const chatContextValue = useContext(ChatContext);

  return (
    <div className="chatArea-container">
      <SingleChat chatData={chatContextValue} />
    </div>
  );
}
