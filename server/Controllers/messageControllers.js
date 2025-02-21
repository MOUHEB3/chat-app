// messageController.js

import handler from "express-async-handler";
import Message from "../Models/messageModel.js";
import User from "../Models/userModel.js";
import Chat from "../Models/chatModel.js";

export const allMessages = handler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email image")
      .populate("reciever")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const sendMessage = handler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await message.populate("reciever");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email image",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// New: Delete Message (soft delete) functionality with Socket.IO event emission
export const deleteMessage = handler(async (req, res) => {
  const { messageId } = req.params;

  // Find the message
  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  // Ensure the requesting user is part of the chat
  const chat = await Chat.findById(message.chat);
  if (!chat || !chat.users.some(user => user.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  // Soft delete: add the user's id to the deletedBy array if not already present
  if (!message.deletedBy.includes(req.user._id)) {
    message.deletedBy.push(req.user._id);
  }
  await message.save();

  // Emit Socket.IO event for real-time update
  const io = req.app.locals.io;
  if (io) {
    io.to(chat._id.toString()).emit("messageDeleted", {
      messageId,
      chatId: chat._id,
      userId: req.user._id,
    });
  }

  res.status(200).json({ message: "Message deleted for user", deletedMessage: message });
});
