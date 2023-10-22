const expressAsyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const generateToken = require("../config/generateToken");

const getUsers = expressAsyncHandler(async (req, res) => {
  const searchQuery = req.query.search || "";
  const searchRegExp = new RegExp(searchQuery, "i");

  const users = await UserModel.find({
    $or: [{ name: { $regex: searchRegExp } }, { email: { $regex: searchRegExp } }],
    _id: { $ne: req.user._id },
  });

  res.json(users);
});

const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ error: "Invalid Email or Password" });
  }
});

const registerNewUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Please provide all required fields" });
    return;
  }

  const userExists = await UserModel.findOne({ email });

  if (userExists) {
    res.status(400).json({ error: "User already exists" });
    return;
  }

  const user = await UserModel.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ error: "User registration failed" });
  }
});

module.exports = { getUsers, loginUser, registerNewUser };
