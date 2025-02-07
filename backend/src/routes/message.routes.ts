import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { mongoIdPathValidator } from "../validators/mongoId.validator";
import { validate } from "../validators/validate";
import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller";
import { messagesValidator } from "../validators/messages.validator";
import { upload } from "../middlewares/multer.middlwares"; // Fixed typo here

const router = Router();

// verify the jwt token with the verifyJWT middleware for all incoming requests at this route
router.use(verifyJWT);

// Route to get all messages for a chat
router
  .route("/:chatId")
  .get(mongoIdPathValidator("chatId"), validate, getAllMessages) // Get messages for a chat
  .post(
    mongoIdPathValidator("chatId"),
    messagesValidator(),
    validate,
    upload.fields([{ name: "attachments", maxCount: 5 }]), // File upload for messages
    sendMessage // Send a new message
  );

// Route to delete a specific message by its ID
router
  .route("/:messageId")
  .delete(mongoIdPathValidator("messageId"), validate, deleteMessage);

export default router;
