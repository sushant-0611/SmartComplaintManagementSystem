import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/user/dashboard");
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
            <h3>Start resolving complaints the smart way.</h3>

            <p>
              Create your free account and submit, track and resolve
              complaints with full transparency.
            </p>

            <ul className="auth-side-points">
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Submit complaints in under a minute
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Get a unique tracking ID for every complaint
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Follow progress on a live status timeline
              </li>
            </ul>
          </div>

          <div className="auth-side-quote">
            <p>
              "I raised a water leakage complaint and could see exactly when
              it was assigned and resolved. Total transparency."
            </p>
            <small>— Ananya Deshmukh, GreenPark Society</small>
          </div>
        </div>

        <div className="auth-form-pane">
          <div className="auth-form-inner">

            <div className="text-center mb-4">
              <div className="auth-logo">
                <i className="bi bi-person-plus"></i>
              </div>

              <h2 className="fw-bold mt-3">
                Create Account
              </h2>

              <p className="text-muted">
                Register for Smart Complaint Management
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>

              <div className="mb-3">
                <label className="form-label">
                  Full Name
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person"></i>
                  </span>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

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
                    name="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Password
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    placeholder="Create password (min 6 characters)"
                    value={form.password}
                    onChange={handleChange}
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

              <div className="mb-4">
                <label className="form-label">
                  Confirm Password
                </label>

                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock-fill"></i>
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Create Account
                  </>
                )}
              </button>

            </form>

            <div className="text-center mt-4">
              <span className="text-muted">
                Already have an account?
              </span>{" "}

              <Link
                to="/login"
                className="text-decoration-none fw-semibold"
              >
                Login
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

export default Register;
