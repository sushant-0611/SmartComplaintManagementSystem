const express = require("express");
const Department = require("../models/Department");
const { protect, authorize } = require("../middleware/auth");
const { ApiError, asyncHandler } = require("../utils/ApiError");

const router = express.Router();

// @route GET /api/departments
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, count: departments.length, departments });
  })
);

// @route POST /api/departments  (admin)
router.post(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      throw new ApiError(400, "Department name is required");
    }

    const department = await Department.create({ name: name.trim(), description });

    res.status(201).json({ success: true, department });
  })
);

module.exports = router;
