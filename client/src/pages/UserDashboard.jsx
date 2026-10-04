import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const timeGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

function UserDashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, complaintsRes] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/complaints"),
        ]);

        setSummary(summaryRes.data.summary);
        setComplaints(complaintsRes.data.complaints);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const recent = complaints.slice(0, 5);

  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <DashboardLayout
      portal="USER PORTAL"
      title={`${timeGreeting()}, ${firstName}`}
      active="dashboard"
    >
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h4 className="fw-bold mb-1">Complaint Overview</h4>

              <p className="text-muted mb-0">Track and manage your complaints.</p>
            </div>

            <Link to="/user/new-complaint" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              New Complaint
            </Link>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="bi bi-files"></i>
                </div>

                <span>Total Complaints</span>

                <h3>{summary?.total ?? 0}</h3>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="bi bi-clock"></i>
                </div>

                <span>Pending</span>

                <h3>{summary?.open ?? 0}</h3>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="bi bi-arrow-repeat"></i>
                </div>

                <span>In Progress</span>

                <h3>{summary?.inProgress ?? 0}</h3>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="bi bi-check-circle"></i>
                </div>

                <span>Resolved</span>

                <h3>{summary?.resolved ?? 0}</h3>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h5>Recent Complaints</h5>
                <p>Your latest complaint activity</p>
              </div>

              <Link
                to="/user/complaints"
                className="btn btn-sm btn-outline-secondary"
              >
                View All
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted display-6"></i>

                <p className="text-muted mt-2 mb-3">
                  No complaints yet. Submit your first complaint.
                </p>

                <Link to="/user/new-complaint" className="btn btn-primary">
                  <i className="bi bi-plus-lg me-2"></i>
                  New Complaint
                </Link>
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
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recent.map((complaint) => (
                      <tr key={complaint._id}>
                        <td>
                          <Link
                            to={`/user/complaint/${complaint.complaintId}`}
                            className="complaint-title-link"
                          >
                            <strong>{complaint.title}</strong>
                          </Link>

                          <small>#{complaint.complaintId}</small>
                        </td>

                        <td>{complaint.category}</td>

                        <td>
                          <span
                            className={`priority priority-${complaint.priority.toLowerCase()}`}
                          >
                            {complaint.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status status-${complaint.status
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {complaint.status}
                          </span>
                        </td>

                        <td>{fmtDate(complaint.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="row g-4 mt-1">
            <div className="col-md-4">
              <Link
                to="/user/new-complaint"
                className="quick-action-card text-decoration-none"
              >
                <div className="quick-action-icon">
                  <i className="bi bi-plus-circle"></i>
                </div>

                <div>
                  <h6>Submit Complaint</h6>
                  <p>Report a new issue or problem.</p>
                </div>

                <i className="bi bi-arrow-right ms-auto"></i>
              </Link>
            </div>

            <div className="col-md-4">
              <Link
                to="/user/complaints"
                className="quick-action-card text-decoration-none"
              >
                <div className="quick-action-icon">
                  <i className="bi bi-search"></i>
                </div>

                <div>
                  <h6>Track Complaints</h6>
                  <p>View complaint status and timeline.</p>
                </div>

                <i className="bi bi-arrow-right ms-auto"></i>
              </Link>
            </div>

            <div className="col-md-4">
              <Link
                to="/user/new-complaint"
                className="quick-action-card text-decoration-none"
              >
                <div className="quick-action-icon">
                  <i className="bi bi-headset"></i>
                </div>

                <div>
                  <h6>Need Help?</h6>
                  <p>Report another issue anytime.</p>
                </div>

                <i className="bi bi-arrow-right ms-auto"></i>
              </Link>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default UserDashboard;
