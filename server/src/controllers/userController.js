const User = require("../models/User");
const { ApiError, asyncHandler } = require("../utils/ApiError");
const { sanitizeUser } = require("./authController");

// @route GET /api/users/staff  (admin)
const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: "staff" })
    .populate("department", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: staff.length, staff });
});

// @route POST /api/users/staff  (admin)
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, departmentId, phone } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(400, "Email is already registered");
  }

  const staff = await User.create({
    name,
    email,
    password,
    phone,
    role: "staff",
    department: departmentId || null,
  });

  res.status(201).json({
    success: true,
    message: "Staff account created",
    staff,
  });
});

// @route GET /api/users  (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .sort({ createdAt: -1 })
    .select("-password");

  res.json({ success: true, count: users.length, users });
});

// @route PATCH /api/users/:id/status  (admin)
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) throw new ApiError(404, "User not found");

  if (user.role === "admin") {
    throw new ApiError(400, "Admin account cannot be deactivated");
  }

  user.active = !user.active;
  await user.save();

  res.json({
    success: true,
    message: `Account ${user.active ? "activated" : "deactivated"}`,
    user: sanitizeUser(user),
  });
});

module.exports = { getStaff, createStaff, getUsers, toggleUserActive };
