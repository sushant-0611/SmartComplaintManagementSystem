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

const fmtSla = (slaDueAt) => {
  const diff = new Date(slaDueAt).getTime() - Date.now();

  if (diff <= 0) return { text: "Overdue", overdue: true };

  const hours = Math.floor(diff / (3600 * 1000));
  const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));

  const text = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return { text, overdue: false };
};

const OPEN_STATUSES = ["Submitted", "Verified", "Assigned", "In Progress", "Reopened"];

function StaffDashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

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

  const openTasks = complaints.filter((c) => OPEN_STATUSES.includes(c.status));
  const closedTasks = complaints.filter(
    (c) => !OPEN_STATUSES.includes(c.status)
  );

  const visible = showCompleted ? closedTasks : openTasks;

  return (
    <DashboardLayout
      portal="STAFF PORTAL"
      title={`Welcome back, ${(user?.name || "there").split(" ")[0]}`}
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
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="bi bi-inbox"></i>
                </div>
                <span>Open Tasks</span>
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
                <div className="stat-icon orange">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <span>Overdue</span>
                <h3>{summary?.overdue ?? 0}</h3>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="bi bi-check-circle"></i>
                </div>
                <span>Completed</span>
                <h3>{summary?.resolved ?? 0}</h3>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h5>Assigned Complaints</h5>
                <p>
                  {showCompleted
                    ? "Completed work history"
                    : "Complaints requiring your action"}
                </p>
              </div>

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowCompleted((v) => !v)}
              >
                {showCompleted ? "View Open Tasks" : "View Completed"}
              </button>
            </div>

            {visible.length === 0 ? (
              <p className="text-muted text-center py-5 mb-0">
                {showCompleted
                  ? "No completed complaints yet."
                  : "No open tasks assigned to you right now."}
              </p>
            ) : (
              visible.map((c) => {
                const sla = OPEN_STATUSES.includes(c.status)
                  ? fmtSla(c.slaDueAt)
                  : null;

                return (
                  <div className="staff-task" key={c._id}>
                    <div>
                      <span
                        className={`priority priority-${c.priority.toLowerCase()}`}
                      >
                        {c.priority.toUpperCase()}
                      </span>

                      <h5>{c.title}</h5>

                      <p>
                        #{c.complaintId} • {c.category} • {c.location} •{" "}
                        {fmtDate(c.createdAt)}
                      </p>
                    </div>

                    <div className="task-sla">
                      {sla ? (
                        <>
                          <small>SLA Remaining</small>

                          <strong className={sla.overdue ? "text-danger" : ""}>
                            {sla.text}
                          </strong>
                        </>
                      ) : (
                        <>
                          <small>Status</small>
                          <strong>{c.status}</strong>
                        </>
                      )}

                      <Link
                        to={`/user/complaint/${c.complaintId}`}
                        className="btn btn-primary btn-sm"
                      >
                        Update
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default StaffDashboard;
