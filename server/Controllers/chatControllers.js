// chatController.js

import User from "../Models/userModel.js";
import Chat from "../Models/chatModel.js";
import handler from "express-async-handler";

export const accessChat = handler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("user id not sent in params");
  }
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password")
        .populate("latestMessage.sender", "name email");
      res.status(200).json(fullChat);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

export const fetchChats = handler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const fetchGroups = handler(async (req, res) => {
  try {
    const allGroups = await Chat.where("isGroupChat").equals(true);
    res.status(200).send(allGroups);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const createGroupChat = handler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Data is insufficient" });
  }

  const users = req.body.users;
  console.log("chatController/createGroups : ", req);
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const groupExit = handler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

export const addSelfGroup = handler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

export const addMemberToGroup = handler(async (req, res) => {
  const { groupId, usersToAdd } = req.body;

  if (!groupId || !usersToAdd || !Array.isArray(usersToAdd) || usersToAdd.length === 0) {
    return res.status(400).send({ message: "Invalid data provided" });
  }

  // Fetch the group first to check existing members
  const group = await Chat.findById(groupId);
  if (!group) {
    return res.status(404).send({ message: "Group not found" });
  }

  // Determine which users are already in the group
  const alreadyAdded = usersToAdd.filter((userId) =>
    group.users.some((memberId) => memberId.toString() === userId)
  );

  if (alreadyAdded.length > 0) {
    return res.status(200).json({
      alreadyAdded: true,
      message: "User is already in the group",
      alreadyMembers: alreadyAdded,
    });
  }

  try {
    const updatedGroup = await Chat.findByIdAndUpdate(
      groupId,
      { $addToSet: { users: { $each: usersToAdd } } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export const getUsersInGroup = handler(async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).send({ message: "Invalid data provided" });
  }

  try {
    const group = await Chat.findById(groupId).populate(
      "users",
      "name _id image"
    );

    if (!group) {
      return res.status(404).send({ message: "Group not found" });
    }

    const adminId = group.groupAdmin ? group.groupAdmin._id : null;
    const userMappings = group.users.map((user) => ({
      userId: user._id,
      username: user.name,
      userImage: user.image,
    }));
    const userNamesSet = new Set(group.users.map((user) => user.name));
    const userNames = Array.from(userNamesSet);

    res.status(200).json({ adminId, userNames, userMappings });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// New: Delete Chat (soft delete) functionality with Socket.IO event emission
export const deleteChat = handler(async (req, res) => {
  const { chatId } = req.params;

  // Find the chat by ID
  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  // Ensure the requesting user is part of the chat
  if (!chat.users.some((user) => user.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error("Unauthorized");
  }

  // Soft delete: Add user ID to deletedBy if not already present
  if (!chat.deletedBy.includes(req.user._id)) {
    chat.deletedBy.push(req.user._id);
  }
  await chat.save();

  // Emit Socket.IO event for real-time deletion update
  // (Assumes io is stored in app.locals.io in server/index.js)
  const io = req.app.locals.io;
  if (io) {
    io.to(chatId.toString()).emit("chatDeleted", { chatId, userId: req.user._id });
  }

  res.status(200).json({ message: "Chat deleted for user", chat });
});
