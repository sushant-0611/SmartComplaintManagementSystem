const Complaint = require("../models/Complaint");
const { asyncHandler } = require("../utils/ApiError");

const OPEN_STATUSES = [
  "Submitted",
  "Verified",
  "Assigned",
  "In Progress",
  "Reopened",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// @route GET /api/analytics/summary  (any authenticated user, scoped by role)
const getSummary = asyncHandler(async (req, res) => {
  const scope =
    req.user.role === "user"
      ? { user: req.user._id }
      : req.user.role === "staff"
        ? { assignedTo: req.user._id }
        : {};

  const complaints = await Complaint.find(scope)
    .populate("department", "name")
    .populate("assignedTo", "name");

  const now = new Date();

  const byStatus = {};
  const byCategory = {};
  const byDepartment = {};
  const byMonth = {};
  let overdue = 0;
  let dueSoon = 0;
  let withinSla = 0;
  let resolvedWithinSla = 0;
  let resolvedTotal = 0;
  let totalResolutionHours = 0;

  for (const c of complaints) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;

    const deptName = c.department?.name || "Unassigned";
    byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;

    const monthKey = `${MONTHS[c.createdAt.getMonth()]} ${c.createdAt.getFullYear()}`;
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;

    const isOpen = OPEN_STATUSES.includes(c.status);

    if (isOpen && c.slaDueAt) {
      if (now > c.slaDueAt) {
        overdue += 1;
      } else if (c.slaDueAt - now < 24 * 3600 * 1000) {
        dueSoon += 1;
      } else {
        withinSla += 1;
      }
    }

    if (["Resolved", "Closed"].includes(c.status)) {
      resolvedTotal += 1;
      if (c.resolvedAt) {
        const hours = (c.resolvedAt - c.createdAt) / (3600 * 1000);
        totalResolutionHours += hours;
        if (c.resolvedAt <= c.slaDueAt) resolvedWithinSla += 1;
      }
    }
  }

  const openCount = OPEN_STATUSES.reduce((sum, s) => sum + (byStatus[s] || 0), 0);
  const resolvedCount = (byStatus.Resolved || 0) + (byStatus.Closed || 0);

  res.json({
    success: true,
    summary: {
      total: complaints.length,
      open: openCount,
      inProgress: byStatus["In Progress"] || 0,
      resolved: resolvedCount,
      rejected: byStatus.Rejected || 0,
      overdue,
      dueSoon,
      withinSla,
      slaComplianceRate:
        resolvedTotal > 0 ? Math.round((resolvedWithinSla / resolvedTotal) * 100) : null,
      avgResolutionHours:
        resolvedTotal > 0 ? Math.round((totalResolutionHours / resolvedTotal) * 10) / 10 : null,
      byStatus,
      byCategory,
      byDepartment,
      byMonth,
    },
  });
});

module.exports = { getSummary };
