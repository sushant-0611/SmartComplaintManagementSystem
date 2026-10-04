import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, dashboardPath } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
    navigate("/");
  };

  return (
    <nav className="complaints-navbar navbar navbar-expand-lg border-bottom sticky-top">
      <div className="container py-2">
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 fw-bold"
          onClick={close}
        >
          <span className="brand-icon">
            <i className="bi bi-chat-square-text-fill"></i>
          </span>

          <span>
            Smart<span className="brand-highlight">Complaint</span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${open ? "show" : ""}`}
          id="mainNavbar"
        >
          <ul className="navbar-nav mx-auto gap-lg-3">
            <li className="nav-item">
              <Link className="nav-link active" to="/" onClick={close}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#features"
                onClick={close}
              >
                Features
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#workflow"
                onClick={close}
              >
                How It Works
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#organizations"
                onClick={close}
              >
                Organizations
              </a>
            </li>
          </ul>

          {user ? (
            <div className="d-flex gap-2 align-items-center">
              <Link
                to={dashboardPath}
                className="btn btn-outline-dark px-3"
                onClick={close}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Link>

              <button className="btn btn-primary px-4" onClick={handleLogout}>
                <i className="bi bi-box-arrow-left me-2"></i>
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link
                to="/login"
                className="btn btn-outline-dark px-4"
                onClick={close}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-primary px-4"
                onClick={close}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
