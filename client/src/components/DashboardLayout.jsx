import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PORTAL_LABEL = {
  admin: "ADMIN PORTAL",
  staff: "STAFF PORTAL",
  user: "USER PORTAL",
};

export const ROLE_LABEL = {
  admin: "Admin",
  staff: "Staff",
  user: "User",
};

function DashboardLayout({ portal, title, active = "", children }) {
  const { user, logout } = useAuth();
  const role = user?.role || "user";

  const dashboardPath =
    role === "admin"
      ? "/admin/dashboard"
      : role === "staff"
        ? "/staff/dashboard"
        : "/user/dashboard";

  const links = [
    { key: "dashboard", to: dashboardPath, icon: "bi-grid", label: "Dashboard" },
    ...(role !== "staff"
      ? [
          {
            key: "new-complaint",
            to: "/user/new-complaint",
            icon: "bi-plus-circle",
            label: "New Complaint",
          },
        ]
      : []),
    ...(role === "user"
      ? [
          {
            key: "my-complaints",
            to: "/user/complaints",
            icon: "bi-list-check",
            label: "My Complaints",
          },
        ]
      : []),
  ];

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-icon">
            <i className="bi bi-chat-square-text-fill"></i>
          </span>

          <strong>SmartComplaint</strong>
        </div>

        <nav>
          {links.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              className={`sidebar-link ${active === link.key ? "active" : ""}`}
            >
              <i className={`bi ${link.icon}`}></i>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link
            className="sidebar-link"
            to="/"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            <i className="bi bi-box-arrow-left"></i>
            Logout
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <small>{portal || PORTAL_LABEL[role]}</small>
            <h2>{title}</h2>
          </div>

          <div className="user-profile">
            <div className="avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <small>{ROLE_LABEL[role]}</small>
            </div>
          </div>
        </header>

        <section className="dashboard-content">{children}</section>
      </main>
    </div>
  );
}

export default DashboardLayout;
