const expressAsyncHandler = require("express-async-handler");
const ChatModel = require("../models/chatModel");
const UserModel = require("../models/userModel");

const createOrFetchOneToOneChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Invalid request. Please provide a user ID." });
  }

  const userChat = await ChatModel.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage.sender name email");

  if (userChat.length > 0) {
    res.json(userChat[0]);
  } else {
    const chatData = {
      chatName: "One-to-One Chat",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await ChatModel.create(chatData);

      const fullChat = await ChatModel.findOne({ _id: createdChat._id })
        .populate("users", "-password")
        .populate("latestMessage.sender name email");

      res.status(200).json(fullChat);
    } catch (error) {
      res.status(400).json({ error: "Failed to create or fetch the one-to-one chat." });
    }
  }
});

const fetchUserChats = expressAsyncHandler(async (req, res) => {
  try {
    const userChats = await ChatModel.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users -password")
      .populate("groupAdmin -password")
      .populate("latestMessage.sender name email")
      .sort({ updatedAt: -1 });

    res.status(200).json(userChats);
  } catch (error) {
    res.status(400).json({ error: "Failed to fetch user chats." });
  }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).json({ error: "Please provide all required fields." });
  }

  const parsedUsers = JSON.parse(users);

  if (parsedUsers.length < 2) {
    return res.status(400).json({ error: "A group chat requires at least two users." });
  }

  parsedUsers.push(req.user);

  try {
    const groupChat = await ChatModel.create({
      chatName: name,
      users: parsedUsers,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
      .populate("users -password")
      .populate("groupAdmin -password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ error: "Failed to create the group chat." });
  }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await ChatModel.findByIdAndUpdate(chatId, { chatName: chatName }, { new: true })
    .populate("users -password")
    .populate("groupAdmin -password");

  if (!updatedChat) {
    res.status(404).json({ error: "Chat not found." });
  } else {
    res.json(updatedChat);
  }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removedChat = await ChatModel.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
    .populate("users -password")
    .populate("groupAdmin -password");

  if (!removedChat) {
    res.status(404).json({ error: "Chat not found." });
  } else {
    res.json(removedChat);
  }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const addedChat = await ChatModel.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate("users -password")
    .populate("groupAdmin -password");

  if (!addedChat) {
    res.status(404).json({ error: "Chat not found." });
  } else {
    res.json(addedChat);
  }
});

module.exports = {
  createOrFetchOneToOneChat,
  fetchUserChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
