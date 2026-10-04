const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const generateComplaintId = require("../services/complaintId");
const { classify } = require("../services/classifier");
const { ApiError, asyncHandler } = require("../utils/ApiError");

const OPEN_STATUSES = [
  "Submitted",
  "Verified",
  "Assigned",
  "In Progress",
  "Reopened",
];

const findComplaint = async (idOrComplaintId) => {
  const query = /^[a-f\d]{24}$/i.test(idOrComplaintId)
    ? { _id: idOrComplaintId }
    : { complaintId: idOrComplaintId.toUpperCase() };

  return Complaint.findOne(query)
    .populate("user", "name email role")
    .populate("assignedTo", "name email role department")
    .populate("assignedBy", "name email role")
    .populate("verifiedBy", "name email role")
    .populate("department", "name")
    .populate("timeline.by", "name role");
};

const assertAccess = (complaint, user) => {
  if (user.role === "admin") return;
  if (user.role === "staff") {
    if (String(complaint.assignedTo?._id || complaint.assignedTo) === String(user._id))
      return;
    throw new ApiError(403, "You can only view complaints assigned to you");
  }
  if (String(complaint.user._id || complaint.user) === String(user._id)) return;
  throw new ApiError(403, "You can only view your own complaints");
};

const addTimeline = (complaint, status, note, by) => {
  complaint.timeline.push({ status, note: note || "", by });
};

const resolveDepartment = async (category) => {
  return Department.findOne({ name: category });
};

// @route POST /api/complaints
const createComplaint = asyncHandler(async (req, res) => {
  const { title, category, location, description, priority } = req.body;

  if (!title || !location || !description) {
    throw new ApiError(400, "Title, location and description are required");
  }

  const suggestion = classify(description);

  let finalCategory = category || suggestion.category;
  if (!Complaint.CATEGORIES.includes(finalCategory)) {
    finalCategory = "Other";
  }

  let finalPriority = priority || suggestion.priority;
  if (!Complaint.PRIORITIES.includes(finalPriority)) {
    finalPriority = "Medium";
  }

  const complaintId = await generateComplaintId();
  const department = await resolveDepartment(finalCategory);

  const complaint = await Complaint.create({
    complaintId,
    user: req.user._id,
    title,
    description,
    location,
    category: finalCategory,
    priority: finalPriority,
    department: department ? department._id : null,
    status: "Submitted",
    slaHours: Complaint.SLA_HOURS[finalPriority],
    slaDueAt: new Date(Date.now() + Complaint.SLA_HOURS[finalPriority] * 3600 * 1000),
    attachment: req.file
      ? {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          url: `/uploads/${req.file.filename}`,
          mimeType: req.file.mimetype,
          size: req.file.size,
        }
      : null,
    timeline: [
      {
        status: "Submitted",
        note: suggestion.autoClassified
          ? `Auto-classified as ${finalCategory} (${finalPriority} priority)`
          : "",
        by: req.user._id,
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Complaint submitted successfully",
    complaint,
  });
});

// @route POST /api/complaints/suggest
const suggestClassification = asyncHandler(async (req, res) => {
  const { description } = req.body;

  if (!description || description.trim().length < 3) {
    throw new ApiError(400, "Please provide a complaint description");
  }

  res.json({ success: true, suggestion: classify(description) });
});

// @route GET /api/complaints
const getComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, search, overdue } = req.query;

  const query = {};

  if (req.user.role === "user") {
    query.user = req.user._id;
  } else if (req.user.role === "staff") {
    query.assignedTo = req.user._id;
  }

  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  if (search) {
    const rx = new RegExp(search.trim(), "i");
    query.$or = [{ title: rx }, { complaintId: rx.toUpperCase() }, { location: rx }];
  }

  let complaints = await Complaint.find(query)
    .populate("user", "name email")
    .populate("assignedTo", "name email department")
    .populate("department", "name")
    .sort({ createdAt: -1 });

  if (overdue === "true") {
    complaints = complaints.filter((c) => c.isOverdue());
  }

  res.json({
    success: true,
    count: complaints.length,
    complaints,
  });
});

// @route GET /api/complaints/:id
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) {
    throw new ApiError(404, "Complaint not found");
  }

  assertAccess(complaint, req.user);

  res.json({
    success: true,
    complaint: {
      ...complaint.toObject(),
      isOverdue: complaint.isOverdue(),
      slaRemainingMs: complaint.slaRemainingMs(),
    },
  });
});

// @route PATCH /api/complaints/:id/verify  (admin)
const verifyComplaint = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (!["Submitted", "Reopened"].includes(complaint.status)) {
    throw new ApiError(400, `Cannot verify a complaint in ${complaint.status} status`);
  }

  const { category, priority, note } = req.body;

  if (category && Complaint.CATEGORIES.includes(category)) {
    complaint.category = category;
    const dept = await resolveDepartment(category);
    complaint.department = dept ? dept._id : null;
  }

  if (priority && Complaint.PRIORITIES.includes(priority)) {
    complaint.priority = priority;
    complaint.slaHours = Complaint.SLA_HOURS[priority];
  }

  complaint.status = "Verified";
  complaint.verifiedBy = req.user._id;
  complaint.slaDueAt = new Date(Date.now() + complaint.slaHours * 3600 * 1000);
  addTimeline(complaint, "Verified", note, req.user._id);

  await complaint.save();

  res.json({ success: true, message: "Complaint verified", complaint });
});

// @route PATCH /api/complaints/:id/reject  (admin)
const rejectComplaint = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (["Resolved", "Closed", "Rejected"].includes(complaint.status)) {
    throw new ApiError(400, `Cannot reject a complaint in ${complaint.status} status`);
  }

  const { reason } = req.body;
  if (!reason || reason.trim().length < 3) {
    throw new ApiError(400, "Please provide a rejection reason");
  }

  complaint.status = "Rejected";
  complaint.rejectedReason = reason.trim();
  addTimeline(complaint, "Rejected", reason.trim(), req.user._id);

  await complaint.save();

  res.json({ success: true, message: "Complaint rejected", complaint });
});

// @route PATCH /api/complaints/:id/assign  (admin)
const assignComplaint = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (["Resolved", "Closed", "Rejected"].includes(complaint.status)) {
    throw new ApiError(400, `Cannot assign a complaint in ${complaint.status} status`);
  }

  const { staffId, note } = req.body;

  if (!staffId) throw new ApiError(400, "staffId is required");

  const staff = await User.findOne({ _id: staffId, role: "staff", active: true });

  if (!staff) throw new ApiError(404, "Staff member not found");

  const reassigned = ["Assigned", "In Progress"].includes(complaint.status);

  complaint.assignedTo = staff._id;
  complaint.assignedBy = req.user._id;
  complaint.status = "Assigned";
  if (staff.department) complaint.department = staff.department;
  addTimeline(
    complaint,
    "Assigned",
    note || (reassigned ? `Reassigned to ${staff.name}` : `Assigned to ${staff.name}`),
    req.user._id
  );

  await complaint.save();

  res.json({
    success: true,
    message: reassigned ? "Complaint reassigned" : "Complaint assigned",
    complaint,
  });
});

// @route PATCH /api/complaints/:id/status  (staff/admin)
const updateStatus = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (req.user.role === "staff") {
    if (String(complaint.assignedTo?._id || complaint.assignedTo) !== String(req.user._id)) {
      throw new ApiError(403, "You can only update complaints assigned to you");
    }
  }

  const { status, note, resolutionNote } = req.body;

  const allowed = {
    "In Progress": ["Assigned", "Verified", "Submitted", "Reopened"],
    Resolved: ["In Progress", "Assigned"],
  };

  if (!allowed[status]) {
    throw new ApiError(400, `Invalid status update. Allowed: In Progress, Resolved`);
  }

  if (!allowed[status].includes(complaint.status)) {
    throw new ApiError(
      400,
      `Cannot move complaint from ${complaint.status} to ${status}`
    );
  }

  if (status === "Resolved" && (!resolutionNote || resolutionNote.trim().length < 5)) {
    throw new ApiError(400, "Please provide resolution details (min 5 characters)");
  }

  complaint.status = status;

  if (status === "Resolved") {
    complaint.resolutionNote = resolutionNote.trim();
    complaint.resolvedAt = new Date();
  }

  addTimeline(complaint, status, resolutionNote || note || "", req.user._id);

  await complaint.save();

  res.json({ success: true, message: `Complaint moved to ${status}`, complaint });
});

// @route PATCH /api/complaints/:id/reopen  (owner)
const reopenComplaint = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) throw new ApiError(404, "Complaint not found");

  assertAccess(complaint, req.user);

  if (!["Resolved", "Closed"].includes(complaint.status)) {
    throw new ApiError(400, "Only resolved or closed complaints can be reopened");
  }

  const { note } = req.body;

  complaint.status = "Reopened";
  complaint.resolvedAt = null;
  complaint.slaDueAt = new Date(Date.now() + complaint.slaHours * 3600 * 1000);
  addTimeline(complaint, "Reopened", note || "Complaint reopened by user", req.user._id);

  await complaint.save();

  res.json({ success: true, message: "Complaint reopened", complaint });
});

// @route PATCH /api/complaints/:id/close  (owner)
const closeComplaint = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) throw new ApiError(404, "Complaint not found");

  assertAccess(complaint, req.user);

  if (complaint.status !== "Resolved") {
    throw new ApiError(400, "Only resolved complaints can be closed");
  }

  complaint.status = "Closed";
  addTimeline(complaint, "Closed", "Closed by user", req.user._id);

  await complaint.save();

  res.json({ success: true, message: "Complaint closed", complaint });
});

// @route POST /api/complaints/:id/feedback  (owner)
const addFeedback = asyncHandler(async (req, res) => {
  const complaint = await findComplaint(req.params.id);

  if (!complaint) throw new ApiError(404, "Complaint not found");

  assertAccess(complaint, req.user);

  if (!["Resolved", "Closed"].includes(complaint.status)) {
    throw new ApiError(400, "Feedback can only be given after resolution");
  }

  if (complaint.feedback) {
    throw new ApiError(400, "Feedback already submitted for this complaint");
  }

  const { rating, comment } = req.body;

  if (!rating || ![1, 2, 3, 4, 5].includes(Number(rating))) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  complaint.feedback = { rating: Number(rating), comment: comment || "" };
  addTimeline(complaint, complaint.status, `Feedback: ${rating}/5 stars`, req.user._id);

  await complaint.save();

  res.json({ success: true, message: "Feedback submitted", complaint });
});

module.exports = {
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
};
