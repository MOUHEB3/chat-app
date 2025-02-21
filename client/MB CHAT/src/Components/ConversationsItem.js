import React, { useContext, useState, useEffect } from "react";
import "./myStyle.css";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../App";
import Avatar from "@mui/material/Avatar";
import { RefreshContext } from "../App";
import Badge from "@mui/material/Badge";
import { useSelector } from "react-redux";
import socket from "../socket";

function ConversationsItem({ props }) {
  const [entryCount, setEntryCount] = useState(0);
  const [visible, setVisible] = useState(true);

  // NEW: Force a re-mount key that changes on new message
  const [forceRemountKey, setForceRemountKey] = useState(0);

  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const { setChatInfo, onlineUsers } = useContext(ChatContext);
  const { notifications, setNotifications } = useContext(RefreshContext);

  const iconName = props.name ? props.name[0] : "";
  const title = props.name || "";
  const lastMessage = props.lastMessage || "start a new chat";
  const otherUserImage = props.otherUserImage;

  // Update notification count for this conversation
  useEffect(() => {
    let count = 0;
    for (const key in notifications) {
      if (notifications[key].ChatId === props._id) {
        count++;
      }
    }
    setEntryCount(count);
  }, [notifications, props._id]);

  // Listen for real-time chat deletion
  useEffect(() => {
    const handleChatDeleted = (data) => {
      if (data.chatId === props._id) {
        setVisible(false);
      }
    };
    socket.on("chatDeleted", handleChatDeleted);
    return () => {
      socket.off("chatDeleted", handleChatDeleted);
    };
  }, [props._id]);

  // NEW: Listen for new messages that belong to this conversation
  useEffect(() => {
    const handleNewMessage = (data) => {
      // If the incoming message belongs to this conversation's ID
      if (data.chat && data.chat._id === props._id) {
        // Force a re-mount by changing our key
        setForceRemountKey((prev) => prev + 1);
      }
    };
    socket.on("new message", handleNewMessage);

    return () => {
      socket.off("new message", handleNewMessage);
    };
  }, [props._id]);

  if (!visible) {
    return null;
  }

  const removeNotification = (chatId) => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.ChatId !== chatId
    );
    setNotifications(updatedNotifications);
  };

  function getContentById(id) {
    let latestEntry = null;
    for (const key in notifications) {
      if (notifications[key].ChatId === id) {
        if (
          !latestEntry ||
          notifications[key].timeStamp > latestEntry.timeStamp
        ) {
          latestEntry = notifications[key];
        }
      }
    }
    return latestEntry
      ? latestEntry.isGroupChat
        ? latestEntry.sender + ":" + latestEntry.content
        : latestEntry.content
      : null;
  }

  return (
    <div
      key={forceRemountKey} // <-- Force re-mount whenever forceRemountKey changes
      className="conversation-container"
      onClick={() => {
        localStorage.setItem("conversations", JSON.stringify(props));
        setChatInfo(JSON.parse(localStorage.getItem("conversations")) || []);
        removeNotification(props._id);
        navigate("/app/chat");
      }}
    >
      {otherUserImage && !props.isGroup ? (
        <Avatar
          className="con-icon"
          sx={{
            width: 52,
            height: 52,
            borderRadius: 15,
            border: onlineUsers.has(props.otherUser)
              ? "2px solid green"
              : null,
          }}
          src={otherUserImage}
        />
      ) : (
        <p className="con-icon">{iconName}</p>
      )}

      <p
        className="con-title"
        style={{ color: lightTheme ? "black" : "white" }}
      >
        {title}{" "}
      </p>
      <p
        className="con-lastMessage"
        style={{ color: lightTheme ? "black" : "white" }}
      >
        {getContentById(props._id) ? getContentById(props._id) : lastMessage}
      </p>
      <p
        className="con-timeStamp"
        style={{ color: lightTheme ? "black" : "white" }}
      >
        <Badge badgeContent={entryCount} color="success" />
      </p>
    </div>
  );
}

export default ConversationsItem;
