const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { ApiError, asyncHandler } = require("../utils/ApiError");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  phone: user.phone,
  createdAt: user.createdAt,
});

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, "Email is already registered. Please login.");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "user",
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: sanitizeUser(user),
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.active) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: "Login successful",
    token,
    user: sanitizeUser(user),
  });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const populated = await req.user.populate("department", "name");
  res.json({ success: true, user: sanitizeUser(populated) });
});

module.exports = { register, login, getMe, sanitizeUser };
