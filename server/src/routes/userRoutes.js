const express = require("express");
const {
  getStaff,
  createStaff,
  getUsers,
  toggleUserActive,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/staff", protect, authorize("admin"), getStaff);
router.post("/staff", protect, authorize("admin"), createStaff);

router.get("/", protect, authorize("admin"), getUsers);

router.patch("/:id/status", protect, authorize("admin"), toggleUserActive);

module.exports = router;
