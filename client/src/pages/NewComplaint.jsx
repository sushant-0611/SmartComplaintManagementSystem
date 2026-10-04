import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout, { PORTAL_LABEL } from "../components/DashboardLayout";

function NewComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    category: "",
    location: "",
    priority: "Medium",
    description: "",
    attachment: null,
  });

  const [suggestion, setSuggestion] = useState({
    category: "",
    priority: "",
  });

  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const suggestTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(suggestTimer.current);
  }, []);

  const fetchSuggestion = (description) => {
    clearTimeout(suggestTimer.current);

    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await api.post("/complaints/suggest", { description });
        setSuggestion(res.data.suggestion);
        setApplied(false);
      } catch {
        /* suggestion is best-effort; ignore failures */
      }
    }, 600);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (name === "description" && value.trim().length > 5) {
      fetchSuggestion(value);
    }
  };

  const applySuggestion = (field) => {
    if (field === "category" && suggestion.category) {
      setForm((prev) => ({ ...prev, category: suggestion.category }));
    }

    if (field === "priority" && suggestion.priority) {
      setForm((prev) => ({ ...prev, priority: suggestion.priority }));
    }

    setApplied(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.category || !form.location || !form.description) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("category", form.category);
      data.append("location", form.location);
      data.append("priority", form.priority);
      data.append("description", form.description);

      if (form.attachment) {
        data.append("attachment", form.attachment);
      }

      const res = await api.post("/complaints", data);

      navigate(`/user/complaint/${res.data.complaint.complaintId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      portal={PORTAL_LABEL[user?.role] || "USER PORTAL"}
      title="Submit a New Complaint"
      active="new-complaint"
    >
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="complaint-form-card">
                <form onSubmit={handleSubmit}>
                  <div className="form-section-title">
                    <i className="bi bi-file-earmark-text"></i>
                    Complaint Information
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Complaint Title <span>*</span>
                    </label>

                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Water leakage in Block A"
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">
                        Category <span>*</span>
                      </label>

                      <select
                        className="form-select"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                      >
                        <option value="">Select category</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Electrical">Electrical</option>
                        <option value="IT / Network">IT / Network</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Security">Security</option>
                        <option value="Facilities">Facilities</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Priority
                      </label>

                      <select
                        className="form-select"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Location <span>*</span>
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-geo-alt"></i>
                      </span>

                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Block A, Ground Floor, Room 102"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Description <span>*</span>
                    </label>

                    <textarea
                      className="form-control"
                      rows="6"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe the problem in detail..."
                    ></textarea>

                    <div className="form-text">
                      Include relevant details such as location, issue,
                      frequency and any immediate impact.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Attachment
                    </label>

                    <div className="upload-box">
                      <i className="bi bi-cloud-arrow-up"></i>

                      <div className="mt-2">
                        <strong>
                          Upload supporting evidence
                        </strong>
                      </div>

                      <small className="text-muted">
                        Images or documents (max 5 MB) can be attached.
                      </small>

                      <input
                        type="file"
                        className="form-control mt-3"
                        name="attachment"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleChange}
                      />

                      {form.attachment && (
                        <div className="selected-file mt-2">
                          <i className="bi bi-paperclip me-2"></i>
                          {form.attachment.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-3 justify-content-end">
                    <Link
                      to="/user/dashboard"
                      className="btn btn-light px-4"
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Submit Complaint
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="smart-assist-card">
                <div className="smart-icon">
                  <i className="bi bi-stars"></i>
                </div>

                <h5 className="fw-bold mt-3">
                  Smart Assistance
                </h5>

                <p className="text-muted small">
                  The system suggests complaint category and priority
                  based on the complaint description.
                </p>

                <div className="suggestion-box">
                  <small className="text-muted d-block mb-1">
                    Suggested Category
                  </small>

                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <strong>
                      {suggestion.category || "Waiting for description"}
                    </strong>

                    {suggestion.category && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => applySuggestion("category")}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>

                <div className="suggestion-box">
                  <small className="text-muted d-block mb-1">
                    Suggested Priority
                  </small>

                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <strong>
                      {suggestion.priority || "Waiting for description"}
                    </strong>

                    {suggestion.priority && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => applySuggestion("priority")}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>

                {applied && (
                  <small className="text-success d-block mt-2">
                    <i className="bi bi-check-lg me-1"></i>
                    Suggestion applied
                  </small>
                )}
              </div>

              <div className="info-card mt-4">
                <div className="d-flex gap-3">
                  <i className="bi bi-info-circle-fill"></i>

                  <div>
                    <h6 className="fw-bold">
                      What happens next?
                    </h6>

                    <p className="small text-muted mb-0">
                      Your complaint will receive a unique complaint ID.
                      It can then be verified, assigned to the appropriate
                      department and tracked through its resolution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
}

export default NewComplaint;
