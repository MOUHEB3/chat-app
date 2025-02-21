// messageRoutes.js

import express from "express";
import { allMessages, sendMessage, deleteMessage } from "../Controllers/messageControllers.js";
import protect from "../middleware/authMiddleWare.js";

const router = express.Router();

// Route to fetch all messages for a chat
router.route("/:chatId").get(protect, allMessages);

// Route to send a new message
router.route("/").post(protect, sendMessage);

// New: DELETE route for soft deleting a message (adds user to deletedBy array)
router.route("/:messageId").delete(protect, deleteMessage);

export default router;
