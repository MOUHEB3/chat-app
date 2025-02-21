import React, { useState } from "react";
import { IconButton, MenuItem, Slide, Menu } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";

export default function SelfMessage({ props, onMessageDeleted }) {
  const date = new Date(props.createdAt);

  // Force 24-hour format using local device's time zone
  const options = { hour: "2-digit", minute: "2-digit", hour12: false };
  // Using [] or undefined ensures local device locale/time zone
  const formattedTime = date.toLocaleTimeString([], options);

  const [viewTimestamp, setViewTimestamp] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Open the three-dot menu (prevent timestamp toggle)
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  // Close the menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Delete the message
  const handleDeleteMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${process.env.REACT_APP_API_KEY}/message/${props._id}`,
        config
      );
      if (onMessageDeleted) onMessageDeleted(props._id);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
    handleMenuClose();
  };

  // Copy the message
  const handleCopyMessage = () => {
    navigator.clipboard
      .writeText(props.content)
      .then(() => console.log("Message copied to clipboard!"))
      .catch((err) => console.error("Failed to copy message:", err));
    handleMenuClose();
  };

  return (
    <>
      <style>
        {`
          /* Outer container, aligned to the right */
          .self-message-container {
            position: relative;
            display: inline-block;
            margin: 10px 0;
            margin-left: auto;
            cursor: pointer;
            max-width: 100%;
          }

          /* The bubble itself (no background-color set here) */
          .messageBox {
            max-width: min(40ch, 65vw);
            border-radius: 10px;
            padding: 10px 14px;
            margin-left: auto;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
          }

          .self-timeStamp {
            font-size: 0.75rem;
            margin-top: 5px;
            color: black; 
          }

          /* Three-dot icon (desktop) */
          .message-options-button {
            position: absolute;
            top: 50%;
            left: -35px;
            transform: translateY(-50%);
            display: inline-flex;
            transition: transform 0.2s ease-in-out;
            z-index: 9999; /* ensure icon is on top */
          }

          /* Mobile adjustments */
          @media (max-width: 600px) {
            .messageBox {
              max-width: 50vw !important; /* narrower bubble on phone */
            }
            .self-timeStamp {
              font-size: 0.7rem;
            }
            .message-options-button {
              left: -30px !important; 
              top: 50% !important;
              transform: translateY(-50%) !important;
              z-index: 9999 !important;
            }
          }

          /* Very large screens */
          @media (min-width: 1200px) {
            .messageBox {
              max-width: 400px; 
            }
          }
        `}
      </style>

      <div
        className="self-message-container"
        onClick={() => setViewTimestamp(!viewTimestamp)}
      >
        <div className="messageBox">
          {/* Your message text */}
          <p style={{ margin: 0, color: "black" }}>{props.content}</p>

          {/* 24-hour local time format, only shown if viewTimestamp is true */}
          {viewTimestamp && (
            <p className="self-timeStamp">
              {formattedTime}
            </p>
          )}
        </div>

        {/* Three-dot icon for delete/copy menu */}
        <IconButton
          className="message-options-button"
          size="small"
          onClick={handleMenuClick}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Slide}
          TransitionProps={{ direction: "left" }}
          anchorOrigin={{ vertical: "center", horizontal: "left" }}
          transformOrigin={{ vertical: "center", horizontal: "right" }}
          PaperProps={{
            sx: {
              borderRadius: 1,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              fontSize: "0.85rem",
              padding: 0,
            },
          }}
        >
          {/* Delete */}
          <MenuItem
            sx={{
              fontSize: "0.85rem",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              color: "red",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#ffe5e5",
              },
            }}
            onClick={handleDeleteMessage}
          >
            <DeleteOutlineIcon
              sx={{ mr: 1, fontSize: "1rem", color: "red" }}
            />
            Delete Message
          </MenuItem>

          {/* Copy */}
          <MenuItem
            sx={{
              fontSize: "0.85rem",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "#f0f0f0",
              },
            }}
            onClick={handleCopyMessage}
          >
            <ContentCopyIcon sx={{ mr: 1, fontSize: "1rem" }} />
            Copy Message
          </MenuItem>
        </Menu>
      </div>
    </>
  );
}
