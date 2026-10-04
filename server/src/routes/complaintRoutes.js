const express = require("express");
const {
  createComplaint,
  suggestClassification,
  getComplaints,
  getComplaintById,
  verifyComplaint,
  rejectComplaint,
  assignComplaint,
  updateStatus,
  reopenComplaint,
  closeComplaint,
  addFeedback,
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("user", "admin"),
  upload.single("attachment"),
  createComplaint
);

router.post("/suggest", protect, suggestClassification);

router.get("/", protect, getComplaints);

router.get("/:id", protect, getComplaintById);

router.patch("/:id/verify", protect, authorize("admin"), verifyComplaint);

router.patch("/:id/reject", protect, authorize("admin"), rejectComplaint);

router.patch("/:id/assign", protect, authorize("admin"), assignComplaint);

router.patch(
  "/:id/status",
  protect,
  authorize("staff", "admin"),
  updateStatus
);

router.patch("/:id/reopen", protect, authorize("user"), reopenComplaint);

router.patch("/:id/close", protect, authorize("user"), closeComplaint);

router.post("/:id/feedback", protect, authorize("user"), addFeedback);

module.exports = router;
