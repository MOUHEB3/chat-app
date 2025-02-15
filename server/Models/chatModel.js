import mongoose from "mongoose";

const chatModel = new mongoose.Schema(
  {
    chatName: { type: String },
    isGroupChat: { type: Boolean },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, 
  }
);

const Chat = mongoose.model("Chat", chatModel);
export default Chat;
