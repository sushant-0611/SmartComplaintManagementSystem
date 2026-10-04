import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { assetUrl, getErrorMessage } from "../services/api";
import DashboardLayout, { PORTAL_LABEL } from "../components/DashboardLayout";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Pending";

const fmtSla = (ms) => {
  if (ms === null || ms === undefined) return "Not set";

  if (ms <= 0) return "Overdue";

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);

  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h remaining`;
  return `${h}h ${m}m remaining`;
};

const STAGE_FLOW = ["Submitted", "Verified", "Assigned", "In Progress", "Resolved", "Closed"];

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [assignStaffId, setAssignStaffId] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" });

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.role === "admin") {
      api
        .get("/users/staff")
        .then((res) => setStaffList(res.data.staff))
        .catch(() => {});
    }
  }, [user?.role]);

  const doAction = async (fn, successText) => {
    setBusy(true);
    setActionMsg({ type: "", text: "" });

    try {
      await fn();
      await load();
      setActionMsg({ type: "success", text: successText });
    } catch (err) {
      setActionMsg({ type: "danger", text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const verify = () =>
    doAction(
      () => api.patch(`/complaints/${id}/verify`, {}),
      "Complaint verified successfully."
    );

  const assign = () =>
    doAction(async () => {
      if (!assignStaffId) throw new Error("Please select a staff member");
      await api.patch(`/complaints/${id}/assign`, { staffId: assignStaffId });
    }, "Complaint assigned successfully.");

  const reject = () =>
    doAction(async () => {
      if (rejectReason.trim().length < 3)
        throw new Error("Please provide a rejection reason");
      await api.patch(`/complaints/${id}/reject`, { reason: rejectReason });
    }, "Complaint rejected.");

  const startWork = () =>
    doAction(
      () => api.patch(`/complaints/${id}/status`, { status: "In Progress" }),
      "Work started. Status updated to In Progress."
    );

  const resolve = () =>
    doAction(async () => {
      if (resolutionNote.trim().length < 5)
        throw new Error("Please provide resolution details (min 5 characters)");
      await api.patch(`/complaints/${id}/status`, {
        status: "Resolved",
        resolutionNote,
      });
    }, "Complaint marked as resolved.");

  const reopen = () =>
    doAction(
      () => api.patch(`/complaints/${id}/reopen`, {}),
      "Complaint reopened."
    );

  const close = () =>
    doAction(
      () => api.patch(`/complaints/${id}/close`, {}),
      "Complaint closed."
    );

  const submitFeedback = () =>
    doAction(
      () =>
        api.post(`/complaints/${id}/feedback`, {
          rating: feedback.rating,
          comment: feedback.comment,
        }),
      "Thank you for your feedback!"
    );

  if (loading) {
    return (
      <DashboardLayout
        portal={PORTAL_LABEL[user?.role] || "USER PORTAL"}
        title="Complaint Details"
        active={user?.role === "user" ? "my-complaints" : "dashboard"}
      >
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !complaint) {
    return (
      <DashboardLayout
        portal={PORTAL_LABEL[user?.role] || "USER PORTAL"}
        title="Complaint Details"
        active={user?.role === "user" ? "my-complaints" : "dashboard"}
      >
        <div className="text-center py-5">
          <div className="alert alert-danger">{error}</div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const c = complaint;
  const statusKey = c.status.toLowerCase().replaceAll(" ", "-");
  const isOwner = user?.role === "user";
  const isAssignedStaff =
    user?.role === "staff" &&
    (c.assignedTo?._id === user.id || c.assignedTo?._id === user._id);
  const isAdmin = user?.role === "admin";
  const slaText = c.isOverdue
    ? "Overdue"
    : fmtSla(c.slaRemainingMs);
  const highestStageIndex = Math.max(
    ...c.timeline.map((t) => STAGE_FLOW.indexOf(t.status))
  );

  return (
    <DashboardLayout
      portal={PORTAL_LABEL[user?.role] || "USER PORTAL"}
      title={`Complaint ${c.complaintId}`}
      active={user?.role === "user" ? "my-complaints" : "dashboard"}
    >
          <Link
            to={
              isAdmin
                ? "/admin/dashboard"
                : isAssignedStaff
                  ? "/staff/dashboard"
                  : "/user/dashboard"
            }
            className="text-decoration-none complaint-back"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </Link>

          <div className="details-header mt-4">

            <div>
              <div className="d-flex align-items-center gap-3 flex-wrap">

                <span className="complaint-id">
                  {c.complaintId}
                </span>

                <span className={`status-badge status-${statusKey}`}>
                  {c.status.toUpperCase()}
                </span>

              </div>

              <h1 className="fw-bold mt-3 mb-2">
                {c.title}
              </h1>

              <p className="text-muted mb-0">
                Submitted on {fmtDate(c.createdAt)} by {c.user?.name}
              </p>
            </div>

            <div className={`sla-highlight ${c.isOverdue ? "sla-overdue" : ""}`}>
              <small>SLA Status</small>

              <strong>
                <i className="bi bi-clock me-2"></i>
                {["Resolved", "Closed", "Rejected"].includes(c.status)
                  ? `Resolved in SLA: ${fmtDate(c.resolvedAt)}`
                  : slaText}
              </strong>
            </div>

          </div>

          {actionMsg.text && (
            <div
              className={`alert alert-${actionMsg.type} mt-3`}
              role="alert"
            >
              {actionMsg.text}
            </div>
          )}

          <div className="row g-4 mt-2">

            <div className="col-lg-8">

              <div className="details-card">

                <div className="details-card-header">
                  <h5>
                    <i className="bi bi-file-text me-2"></i>
                    Complaint Details
                  </h5>
                </div>

                <div className="details-card-body">

                  <div className="row g-4">

                    <div className="col-md-6">
                      <div className="detail-label">
                        Category
                      </div>

                      <div className="detail-value">
                        <i className="bi bi-tag me-2"></i>
                        {c.category}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="detail-label">
                        Priority
                      </div>

                      <div className="detail-value">
                        <span className={`priority-${c.priority.toLowerCase()}`}>
                          {c.priority}
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="detail-label">
                        Location
                      </div>

                      <div className="detail-value">
                        <i className="bi bi-geo-alt me-2"></i>
                        {c.location}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="detail-label">
                        Department
                      </div>

                      <div className="detail-value">
                        {c.department?.name || "Not assigned yet"}
                      </div>
                    </div>

                  </div>

                  <hr className="my-4" />

                  <div className="detail-label mb-2">
                    Description
                  </div>

                  <p className="complaint-description">
                    {c.description}
                  </p>

                  {c.attachment && (
                    <div className="attachment-preview mt-4">

                      <i className="bi bi-paperclip"></i>

                      <div>
                        <strong>
                          Supporting Attachment
                        </strong>

                        <small className="d-block text-muted">
                          {c.attachment.originalName}
                        </small>
                      </div>

                      <a
                        href={assetUrl(c.attachment.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary ms-auto"
                      >
                        View
                      </a>

                    </div>
                  )}

                  {c.rejectedReason && (
                    <div className="alert alert-warning mt-4 mb-0">
                      <strong>
                        <i className="bi bi-x-circle me-2"></i>
                        Rejection Reason:
                      </strong>{" "}
                      {c.rejectedReason}
                    </div>
                  )}

                  {c.resolutionNote && (
                    <div className="alert alert-success mt-4 mb-0">
                      <strong>
                        <i className="bi bi-check-circle me-2"></i>
                        Resolution:
                      </strong>{" "}
                      {c.resolutionNote}
                    </div>
                  )}

                </div>
              </div>

              <div className="details-card mt-4">

                <div className="details-card-header">
                  <h5>
                    <i className="bi bi-clock-history me-2"></i>
                    Complaint Timeline
                  </h5>
                </div>

                <div className="details-card-body">

                  <div className="complaint-timeline">

                    {c.timeline.map((item, idx) => {
                      const done = true;
                      const current = idx === c.timeline.length - 1;

                      return (
                        <div
                          className={`timeline-item ${
                            current ? "current" : ""
                          } ${done ? "completed" : ""}`}
                          key={idx}
                        >

                          <div className="timeline-marker">
                            <i className="bi bi-check-lg"></i>
                          </div>

                          <div className="timeline-content">

                            <div className="d-flex justify-content-between gap-3 flex-wrap">

                              <div>

                                <span className="timeline-status">
                                  {item.status.toUpperCase()}
                                </span>

                                <h6 className="fw-bold mt-1 mb-1">
                                  {item.status === "Rejected"
                                    ? "Complaint Rejected"
                                    : `Complaint ${item.status}`}
                                </h6>

                              </div>

                              <small className="text-muted">
                                {fmtDate(item.at)}
                              </small>

                            </div>

                            <p className="text-muted small mb-0">
                              {item.note ||
                                (item.by
                                  ? `By ${item.by.name} (${item.by.role})`
                                  : "")}
                            </p>

                          </div>

                        </div>
                      );
                    })}

                    {highestStageIndex < STAGE_FLOW.indexOf("Resolved") &&
                      !["Rejected"].includes(c.status) && (
                        <div className="timeline-item">

                          <div className="timeline-marker">
                            <i className="bi bi-circle"></i>
                          </div>

                          <div className="timeline-content">
                            <span className="timeline-status">RESOLVED</span>

                            <h6 className="fw-bold mt-1 mb-1">
                              Complaint Resolved
                            </h6>

                            <p className="text-muted small mb-0">
                              Resolution details will appear here.
                            </p>
                          </div>

                        </div>
                      )}

                  </div>

                </div>
              </div>

            </div>

            <div className="col-lg-4">

              <div className="details-card">

                <div className="details-card-header">
                  <h5>
                    <i className="bi bi-person-badge me-2"></i>
                    Assignment
                  </h5>
                </div>

                <div className="details-card-body">

                  {c.assignedTo ? (
                    <div className="assignment-person">

                      <div className="assignment-avatar">
                        <i className="bi bi-person"></i>
                      </div>

                      <div>
                        <strong>
                          {c.assignedTo.name}
                        </strong>

                        <small className="d-block text-muted">
                          {c.assignedTo.department?.name ||
                            c.department?.name ||
                            "Staff"}
                        </small>
                      </div>

                    </div>
                  ) : (
                    <p className="text-muted small mb-0">
                      <i className="bi bi-hourglass-split me-2"></i>
                      Not yet assigned to any staff member.
                    </p>
                  )}

                  <hr />

                  <div className="mini-info">
                    <span>
                      Assignment Status
                    </span>

                    <strong>
                      {c.assignedTo ? "Active" : "Pending"}
                    </strong>
                  </div>

                  <div className="mini-info">
                    <span>
                      SLA Target
                    </span>

                    <strong>
                      {c.slaHours} Hours
                    </strong>
                  </div>

                  {c.feedback && (
                    <>
                      <hr />

                      <div className="mini-info">
                        <span>Feedback</span>

                        <strong>
                          {"★".repeat(c.feedback.rating)}
                          {"☆".repeat(5 - c.feedback.rating)}
                        </strong>
                      </div>

                      {c.feedback.comment && (
                        <p className="small text-muted mt-2 mb-0">
                          "{c.feedback.comment}"
                        </p>
                      )}
                    </>
                  )}

                </div>
              </div>

              {/* ADMIN ACTIONS */}
              {isAdmin && (
                <div className="action-card mt-4">

                  <h6 className="fw-bold">
                    <i className="bi bi-shield-lock me-2"></i>
                    Admin Actions
                  </h6>

                  {["Submitted", "Reopened"].includes(c.status) && (
                    <button
                      type="button"
                      className="btn btn-primary w-100 mb-2"
                      onClick={verify}
                      disabled={busy}
                    >
                      <i className="bi bi-check2-circle me-2"></i>
                      Verify Complaint
                    </button>
                  )}

                  {["Submitted", "Verified", "Reopened", "Assigned", "In Progress"].includes(
                    c.status
                  ) && (
                    <>
                      <div className="mb-2">
                        <label className="form-label small mb-1">
                          Assign to staff
                        </label>

                        <select
                          className="form-select form-select-sm"
                          value={assignStaffId}
                          onChange={(e) => setAssignStaffId(e.target.value)}
                        >
                          <option value="">Select staff member</option>

                          {staffList.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.department?.name || "No dept"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        className="btn btn-success w-100 mb-2"
                        onClick={assign}
                        disabled={busy}
                      >
                        <i className="bi bi-person-check me-2"></i>
                        {c.assignedTo ? "Reassign" : "Assign"}
                      </button>
                    </>
                  )}

                  {["Submitted", "Verified", "Reopened"].includes(c.status) && (
                    <>
                      <div className="mb-2">
                        <textarea
                          className="form-control form-control-sm"
                          rows="2"
                          placeholder="Rejection reason (required)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={reject}
                        disabled={busy}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Reject Complaint
                      </button>
                    </>
                  )}

                </div>
              )}

              {/* STAFF ACTIONS */}
              {isAssignedStaff && (
                <div className="action-card mt-4">

                  <h6 className="fw-bold">
                    <i className="bi bi-tools me-2"></i>
                    Staff Actions
                  </h6>

                  {c.status === "Assigned" && (
                    <button
                      type="button"
                      className="btn btn-primary w-100 mb-2"
                      onClick={startWork}
                      disabled={busy}
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Start Work
                    </button>
                  )}

                  {["Assigned", "In Progress"].includes(c.status) && (
                    <>
                      <label className="form-label small mb-1">
                        Resolution details
                      </label>

                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows="3"
                        placeholder="Describe what was done to fix the issue (required)"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                      ></textarea>

                      <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={resolve}
                        disabled={busy}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Mark as Resolved
                      </button>
                    </>
                  )}

                </div>
              )}

              {/* USER ACTIONS */}
              {isOwner && (
                <div className="action-card mt-4">

                  <h6 className="fw-bold">
                    Need further action?
                  </h6>

                  {["Resolved", "Closed"].includes(c.status) && !c.feedback && (
                    <>
                      <label className="form-label small mb-1">
                        Rate the resolution
                      </label>

                      <div className="mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`bi ${
                              star <= feedback.rating
                                ? "bi-star-fill text-warning"
                                : "bi-star text-muted"
                            }`}
                            style={{ cursor: "pointer", fontSize: "1.3rem" }}
                            onClick={() =>
                              setFeedback((f) => ({ ...f, rating: star }))
                            }
                          ></i>
                        ))}
                      </div>

                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows="2"
                        placeholder="Optional comment"
                        value={feedback.comment}
                        onChange={(e) =>
                          setFeedback((f) => ({
                            ...f,
                            comment: e.target.value,
                          }))
                        }
                      ></textarea>

                      <button
                        type="button"
                        className="btn btn-primary w-100 mb-2"
                        onClick={submitFeedback}
                        disabled={busy}
                      >
                        <i className="bi bi-star me-2"></i>
                        Submit Feedback
                      </button>
                    </>
                  )}

                  {c.status === "Resolved" && (
                    <button
                      type="button"
                      className="btn btn-success w-100 mb-2"
                      onClick={close}
                      disabled={busy}
                    >
                      <i className="bi bi-check2-all me-2"></i>
                      Close Complaint
                    </button>
                  )}

                  {["Resolved", "Closed"].includes(c.status) && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={reopen}
                      disabled={busy}
                    >
                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                      Reopen Complaint
                    </button>
                  )}

                  {!["Resolved", "Closed"].includes(c.status) && (
                    <p className="small text-muted mb-0">
                      Your complaint is being processed. Actions will
                      appear here after resolution.
                    </p>
                  )}

                </div>
              )}

            </div>

          </div>
    </DashboardLayout>
  );
}

export default ComplaintDetails;
