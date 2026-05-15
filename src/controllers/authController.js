const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { register, login } = require('../services/authService');

const registerUser = asyncHandler(async (req, res) => {
  const result = await register(req.body, { UserModel: User });
  res.status(201).json({ success: true, data: result });
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await login(req.body, { UserModel: User });
  res.status(200).json({ success: true, data: result });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { id: req.user._id, username: req.user.username, email: req.user.email }
  });
});

module.exports = { registerUser, loginUser, getMe };
