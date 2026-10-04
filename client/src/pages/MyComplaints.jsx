import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";

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

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/complaints", { params });
      setComplaints(res.data.complaints);
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

  const hasFilters = Boolean(statusFilter || search.trim());

  return (
    <DashboardLayout
      portal="USER PORTAL"
      title="My Complaints"
      active="my-complaints"
    >
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="dashboard-card">
        <div className="card-heading">
          <div>
            <h5>All Complaints</h5>
            <p>
              {loading
                ? "Loading complaints..."
                : `${complaints.length} complaint${
                    complaints.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap">
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
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: "180px" }}
            />

            <Link to="/user/new-complaint" className="btn btn-primary btn-sm">
              <i className="bi bi-plus-lg me-1"></i>
              New
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox text-muted display-6"></i>

            <p className="text-muted mt-2 mb-3">
              {hasFilters
                ? "No complaints match your filters."
                : "No complaints yet. Submit your first complaint."}
            </p>

            {hasFilters ? (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setStatusFilter("");
                  setSearch("");
                }}
              >
                Clear Filters
              </button>
            ) : (
              <Link to="/user/new-complaint" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>
                New Complaint
              </Link>
            )}
          </div>
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
    </DashboardLayout>
  );
}

export default MyComplaints;
