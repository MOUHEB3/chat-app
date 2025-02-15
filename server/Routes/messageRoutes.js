import express from "express";
import { allMessages, sendMessage } from "../Controllers/messageControllers.js";
import protect from "../middleware/authMiddleWare.js";

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

export default router;
