import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const user = await login(email, password);

      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "staff") navigate("/staff/dashboard");
      else navigate("/user/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">

        <div className="auth-side">
          <div>
            <div className="auth-side-brand">
              <span className="brand-icon">
                <i className="bi bi-chat-square-text-fill"></i>
              </span>
              Smart<span className="brand-highlight">Complaint</span>
            </div>
          </div>

          <div>
            <h3>Welcome back to smarter complaint resolution.</h3>

            <p>
              Login to track your complaints, check SLA status and manage
              resolutions in real time.
            </p>

            <ul className="auth-side-points">
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Real-time complaint tracking with full timeline
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                SLA deadlines with automatic overdue alerts
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Smart auto-classification of category & priority
              </li>
            </ul>
          </div>

          <div className="auth-side-quote">
            <p>
              "Every complaint gets a tracking ID, a department and a deadline.
              Nothing gets lost anymore."
            </p>
            <small>— Facility Team, VertexCorp</small>
          </div>
        </div>

        <div className="auth-form-pane">
          <div className="auth-form-inner">

            <div className="text-center mb-4">
              <div className="auth-logo">
                <i className="bi bi-shield-check"></i>
              </div>

              <h2 className="fw-bold mt-3">
                Welcome Back
              </h2>

              <p className="text-muted">
                Login to your Smart Complaint account
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>

              <div className="mb-3">
                <label className="form-label">
                  Email Address
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">
                  Password
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex="-1"
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </>
                )}
              </button>

            </form>

            <div className="text-center mt-4">
              <span className="text-muted">
                Don't have an account?
              </span>{" "}

              <Link
                to="/register"
                className="text-decoration-none fw-semibold"
              >
                Create Account
              </Link>
            </div>

            <div className="text-center mt-3">
              <Link
                to="/"
                className="text-muted small text-decoration-none"
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back to Home
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
