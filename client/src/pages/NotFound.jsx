import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function NotFound() {
  const { user, dashboardPath } = useAuth();

  return (
    <>
      <Navbar />

      <div className="not-found-page">
        <div className="container text-center py-5">
          <div className="not-found-code">404</div>

          <h1 className="fw-bold mt-3 mb-3">Page not found</h1>

          <p className="text-muted mx-auto mb-4 not-found-text">
            The page you are looking for doesn’t exist or may have been moved.
            Check the URL or head back to a safe place.
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/" className="btn btn-outline-dark px-4">
              <i className="bi bi-house me-2"></i>
              Back to Home
            </Link>

            {user ? (
              <Link to={dashboardPath} className="btn btn-primary px-4">
                <i className="bi bi-speedometer2 me-2"></i>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary px-4">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
