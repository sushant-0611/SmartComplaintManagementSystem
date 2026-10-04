import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const STATUSES = [
  "Submitted",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
  "Reopened",
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const monthSortKey = (label) => {
  const [mon, year] = label.split(" ");
  return Number(year) * 12 + MONTHS.indexOf(mon);
};

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const [summaryRes, complaintsRes, staffRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/complaints", { params }),
        api.get("/users/staff"),
      ]);

      setSummary(summaryRes.data.summary);
      setComplaints(complaintsRes.data.complaints);
      setStaff(staffRes.data.staff);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const verify = async (complaint) => {
    try {
      await api.patch(`/complaints/${complaint._id}/verify`, {});
      setActionMsg(`${complaint.complaintId} verified successfully`);
      load();
    } catch (err) {
      setActionMsg(getErrorMessage(err));
    }
  };

  const chartData = summary
    ? Object.entries(summary.byMonth)
        .sort((a, b) => monthSortKey(a[0]) - monthSortKey(b[0]))
        .slice(-6)
    : [];

  const chartMax = Math.max(1, ...chartData.map(([, count]) => count));

  const pendingVerification = complaints.filter((c) =>
    ["Submitted", "Reopened"].includes(c.status)
  );

  return (
    <DashboardLayout
      portal="ADMIN PORTAL"
      title="Management Dashboard"
      active="dashboard"
    >
          {error && <div className="alert alert-danger">{error}</div>}

          {actionMsg && (
            <div className="alert alert-info">{actionMsg}</div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              <div className="row g-4 mb-4">
                {[
                  ["Total Complaints", summary?.total ?? 0, "bi-files", "blue"],
                  ["Open Complaints", summary?.open ?? 0, "bi-folder2-open", "orange"],
                  ["In Progress", summary?.inProgress ?? 0, "bi-arrow-repeat", "purple"],
                  ["Resolved", summary?.resolved ?? 0, "bi-check-circle", "green"],
                ].map(([label, value, icon, color]) => (
                  <div className="col-md-6 col-xl-3" key={label}>
                    <div className="stat-card">
                      <div className={`stat-icon ${color}`}>
                        <i className={`bi ${icon}`}></i>
                      </div>
                      <span>{label}</span>
                      <h3>{value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="dashboard-card">
                    <div className="card-heading">
                      <div>
                        <h5>Complaint Performance</h5>
                        <p>Complaints per month (last 6 months)</p>
                      </div>
                    </div>

                    {chartData.length === 0 ? (
                      <p className="text-muted text-center py-5 mb-0">
                        No complaint data yet.
                      </p>
                    ) : (
                      <div className="admin-chart">
                        {chartData.map(([label, count]) => (
                          <div
                            className="chart-bar"
                            style={{
                              height: `${Math.max(8, (count / chartMax) * 100)}%`,
                            }}
                            title={`${label}: ${count}`}
                            key={label}
                          >
                            <span>{label.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="dashboard-card h-100">
                    <div className="card-heading">
                      <div>
                        <h5>SLA Status</h5>
                        <p>Complaint resolution</p>
                      </div>
                    </div>

                    <div className="sla-stat">
                      <strong>
                        {summary?.slaComplianceRate ?? "—"}
                        {summary?.slaComplianceRate != null ? "%" : ""}
                      </strong>
                      <span>Within SLA</span>
                    </div>

                    <div className="progress mb-4">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${summary?.slaComplianceRate ?? 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="sla-row">
                      <span>Within SLA</span>
                      <strong>{summary?.withinSla ?? 0}</strong>
                    </div>

                    <div className="sla-row">
                      <span>Warning</span>
                      <strong>{summary?.dueSoon ?? 0}</strong>
                    </div>

                    <div className="sla-row">
                      <span>Overdue</span>
                      <strong>{summary?.overdue ?? 0}</strong>
                    </div>

                    <div className="sla-row">
                      <span>Avg Resolution</span>
                      <strong>
                        {summary?.avgResolutionHours != null
                          ? `${summary.avgResolutionHours}h`
                          : "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* PENDING VERIFICATION */}
              {pendingVerification.length > 0 && (
                <div className="dashboard-card mt-4">
                  <div className="card-heading">
                    <div>
                      <h5>Pending Verification</h5>
                      <p>Complaints waiting for your review</p>
                    </div>
                  </div>

                  {pendingVerification.map((c) => (
                    <div className="staff-task" key={c._id}>
                      <div>
                        <span className={`priority priority-${c.priority.toLowerCase()}`}>
                          {c.priority.toUpperCase()}
                        </span>
                        <h5>{c.title}</h5>
                        <p>
                          #{c.complaintId} • {c.category} • {c.location} • by{" "}
                          {c.user?.name || "Unknown"}
                        </p>
                      </div>

                      <div className="task-sla">
                        <Link
                          to={`/user/complaint/${c.complaintId}`}
                          className="btn btn-primary btn-sm mb-1"
                        >
                          Review & Assign
                        </Link>

                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => verify(c)}
                        >
                          Quick Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ALL COMPLAINTS */}
              <div className="dashboard-card mt-4">
                <div className="card-heading">
                  <div>
                    <h5>All Complaints</h5>
                    <p>{complaints.length} complaints found</p>
                  </div>

                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ minWidth: "150px" }}
                    >
                      <option value="">All Statuses</option>
                      {STATUSES.map((s) => (
                        <option value={s} key={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {complaints.length === 0 ? (
                  <p className="text-muted text-center py-5 mb-0">
                    No complaints found.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table complaint-table align-middle">
                      <thead>
                        <tr>
                          <th>Complaint</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                          <th>Date</th>
                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {complaints.map((c) => (
                          <tr key={c._id}>
                            <td>
                              <Link
                                to={`/user/complaint/${c.complaintId}`}
                                className="complaint-title-link"
                              >
                                <strong>{c.title}</strong>
                              </Link>
                              <small>#{c.complaintId}</small>
                            </td>

                            <td>{c.category}</td>

                            <td>
                              <span
                                className={`priority priority-${c.priority.toLowerCase()}`}
                              >
                                {c.priority}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`status status-${c.status
                                  .toLowerCase()
                                  .replaceAll(" ", "-")}`}
                              >
                                {c.status}
                              </span>
                            </td>

                            <td>
                              {c.assignedTo?.name ? (
                                c.assignedTo.name
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>

                            <td>{fmtDate(c.createdAt)}</td>

                            <td>
                              <Link
                                to={`/user/complaint/${c.complaintId}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* STAFF */}
              <div className="dashboard-card mt-4">
                <div className="card-heading">
                  <div>
                    <h5>Staff Members</h5>
                    <p>{staff.length} staff accounts</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table complaint-table align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Phone</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {staff.map((s) => (
                        <tr key={s._id}>
                          <td>
                            <strong>{s.name}</strong>
                          </td>

                          <td>{s.email}</td>

                          <td>{s.department?.name || "—"}</td>

                          <td>{s.phone || "—"}</td>

                          <td>
                            <span
                              className={`status ${
                                s.active
                                  ? "status-resolved"
                                  : "status-rejected"
                              }`}
                            >
                              {s.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
