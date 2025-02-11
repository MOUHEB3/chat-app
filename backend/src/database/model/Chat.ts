import { Schema, Types, model } from "mongoose";

export const DOCUMENT_NAME = "Chat";

export default interface Chat {
  _id: Types.ObjectId;
  name: string;
  isGroupChat: boolean;
  lastMessage?: Types.ObjectId;
  participants: Types.ObjectId[];
  admin: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// make the the chat interface partial so we  can update selective fields
export type UpdateChatFields = Partial<Chat>;

// define the schema for corresponding document interface
const schema = new Schema<Chat>({
  name: {
    type: Schema.Types.String,
    required: true,
    trim: true,
    maxlength: 200,
  },

  isGroupChat: {
    type: Schema.Types.Boolean,
    default: false,
    required: true,
  },

  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },

  participants: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    required: true,
  },

  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },

  updatedAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
});

export const ChatModel = model<Chat>(DOCUMENT_NAME, schema);



/** 
 * leaveGroupChat
 *
 * This helper function finds a chat by its ID, verifies that it is a group chat,
 * and removes the specified user from the participants list.
 *
 * @param {string} chatId - The ID of the chat.
 * @param {string} userId - The ID of the user who is leaving.
 * @returns {Promise<Chat>} - The updated chat document.
 * @throws {Error} - If the chat is not found or if it's not a group chat.
 */
export const leaveGroupChat = async (chatId: string, userId: string) => {
  // Find the chat by its ID
  const chat = await ChatModel.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }

  // Ensure the chat is a group chat
  if (!chat.isGroupChat) {
    throw new Error("Not a group chat");
  }

  // Remove the user from the participants array
  chat.participants = chat.participants.filter(
    (participant) => participant.toString() !== userId
  );

  // Save and return the updated chat
  await chat.save();
  return chat;
};
