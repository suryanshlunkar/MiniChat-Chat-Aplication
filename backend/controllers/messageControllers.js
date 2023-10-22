const expressAsyncHandler = require("express-async-handler");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");

const getAllMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await MessageModel.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: "Failed to retrieve messages." });
  }
});

const createNewMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ error: "Invalid data passed into the request." });
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    const message = await MessageModel.create(newMessage);

    message
      .populate("sender", "name")
      .populate("chat")
      .populate({
        path: "chat.users",
        select: "name email",
      })
      .execPopulate();

    await ChatModel.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: "Failed to send the message." });
  }
});

module.exports = { getAllMessages, createNewMessage };
