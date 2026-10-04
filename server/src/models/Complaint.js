const mongoose = require("mongoose");

const STATUSES = [
  "Submitted",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
  "Reopened",
  "Closed",
];

const CATEGORIES = [
  "Maintenance",
  "Electrical",
  "IT / Network",
  "Cleaning",
  "Security",
  "Facilities",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const SLA_HOURS = {
  Critical: 24,
  High: 48,
  Medium: 72,
  Low: 120,
};

const attachmentSchema = new mongoose.Schema(
  {
    fileName: String,
    originalName: String,
    url: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: STATUSES,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: "Other",
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: "Medium",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    attachment: {
      type: attachmentSchema,
      default: null,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "Submitted",
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectedReason: {
      type: String,
      trim: true,
      default: "",
    },
    resolutionNote: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    slaHours: {
      type: Number,
      default: SLA_HOURS.Medium,
    },
    slaDueAt: {
      type: Date,
      default: null,
    },
    feedback: {
      type: feedbackSchema,
      default: null,
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
  },
  { timestamps: true }
);

complaintSchema.index({ createdAt: -1 });

complaintSchema.statics.SLA_HOURS = SLA_HOURS;
complaintSchema.statics.STATUSES = STATUSES;
complaintSchema.statics.CATEGORIES = CATEGORIES;
complaintSchema.statics.PRIORITIES = PRIORITIES;

complaintSchema.methods.isOverdue = function () {
  if (!this.slaDueAt) return false;
  if (["Resolved", "Closed", "Rejected"].includes(this.status)) return false;
  return new Date() > this.slaDueAt;
};

complaintSchema.methods.slaRemainingMs = function () {
  if (!this.slaDueAt) return null;
  return this.slaDueAt.getTime() - Date.now();
};

module.exports = mongoose.model("Complaint", complaintSchema);
