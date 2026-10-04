import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-7">
              <div className="hero-badge mb-4">
                <i className="bi bi-stars me-2"></i>
                Smart • Trackable • Accountable
              </div>

              <h1 className="hero-title">
                Manage Complaints.
                <br />
                <span>Resolve Problems.</span>
                <br />
                Build Trust.
              </h1>

              <p className="hero-description">
                A centralized complaint management platform that helps
                organizations register, classify, assign, track and resolve
                complaints efficiently — with SLA tracking, auto-classification
                and real-time status updates.
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link to="/register" className="btn btn-primary btn-lg px-4">
                  Get Started Free
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>

                <a
                  href="#workflow"
                  className="btn btn-outline-dark btn-lg px-4"
                >
                  <i className="bi bi-play-circle me-2"></i>
                  See How It Works
                </a>
              </div>

              <div className="hero-stats mt-5">
                <div>
                  <strong>24/7</strong>
                  <span>Complaint Tracking</span>
                </div>

                <div>
                  <strong>AI-Assist</strong>
                  <span>Smart Classification</span>
                </div>

                <div>
                  <strong>SLA</strong>
                  <span>Priority Deadlines</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="complaint-preview">
                <div className="preview-header">
                  <div>
                    <small>COMPLAINT</small>
                    <h5>#CMP-2026-00124</h5>
                  </div>

                  <span className="status-badge">
                    <i className="bi bi-circle-fill"></i>
                    In Progress
                  </span>
                </div>

                <hr />

                <h5>Water leakage in Block B</h5>

                <p className="text-muted">
                  Leakage reported near the staircase on the second floor.
                </p>

                <div className="preview-info">
                  <div>
                    <small>Category</small>
                    <strong>
                      <i className="bi bi-tools me-2"></i>
                      Maintenance
                    </strong>
                  </div>

                  <div>
                    <small>Priority</small>
                    <strong className="text-danger">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      High
                    </strong>
                  </div>
                </div>

                <div className="progress mt-4">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: "68%" }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between mt-2 small">
                  <span>Assigned to Maintenance</span>
                  <span>68%</span>
                </div>

                <div className="timeline-mini mt-4">
                  <div className="timeline-item done">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Complaint Submitted</span>
                  </div>

                  <div className="timeline-item done">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Verified & Assigned</span>
                  </div>

                  <div className="timeline-item active">
                    <i className="bi bi-arrow-right-circle-fill"></i>
                    <span>Staff Working</span>
                  </div>

                  <div className="timeline-item">
                    <i className="bi bi-circle"></i>
                    <span>Resolution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-3">
              <span className="trust-strip-label">
                Trusted across organizations
              </span>
            </div>

            <div className="col-lg-9">
              <div className="trust-logos">
                <span className="trust-logo">
                  <i className="bi bi-building"></i> VertexCorp
                </span>
                <span className="trust-logo">
                  <i className="bi bi-mortarboard"></i> Sunridge College
                </span>
                <span className="trust-logo">
                  <i className="bi bi-hospital"></i> CityCare Hospital
                </span>
                <span className="trust-logo">
                  <i className="bi bi-houses"></i> GreenPark Society
                </span>
                <span className="trust-logo">
                  <i className="bi bi-bank"></i> Metro Civic Dept.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ORGANIZATIONS */}
      <section id="organizations" className="section-padding">
        <div className="container">
          <Reveal>
            <div className="text-center section-heading">
              <span className="section-label">ONE PLATFORM</span>

              <h2>
                Built for <span>Every Organization</span>
              </h2>

              <p>
                The same complaint lifecycle can be configured for different
                organizations and service environments.
              </p>
            </div>
          </Reveal>

          <div className="row g-4 mt-3">
            {[
              ["bi-building", "Companies", "IT, HR, facilities & maintenance"],
              [
                "bi-houses",
                "Housing Societies",
                "Water, parking, security & cleanliness",
              ],
              [
                "bi-mortarboard",
                "Colleges & Schools",
                "Campus, hostel, lab & transport issues",
              ],
              [
                "bi-bank",
                "Public Services",
                "Roads, water, garbage & civic services",
              ],
              [
                "bi-hospital",
                "Hospitals",
                "Facilities, equipment & housekeeping",
              ],
              [
                "bi-building-check",
                "Hotels & Businesses",
                "Service, room & maintenance complaints",
              ],
            ].map(([icon, title, description], idx) => (
              <div className="col-md-6 col-lg-4" key={title}>
                <Reveal delay={idx * 70}>
                  <div className="organization-card">
                    <div className="organization-icon">
                      <i className={`bi ${icon}`}></i>
                    </div>

                    <h5>{title}</h5>

                    <p>{description}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section-padding bg-light">
        <div className="container">
          <Reveal>
            <div className="section-heading">
              <span className="section-label">SMART FEATURES</span>

              <h2>
                More Than a <span>Complaint Form</span>
              </h2>

              <p>
                Intelligent workflow and transparent tracking from submission
                to resolution.
              </p>
            </div>
          </Reveal>

          <div className="row g-4 mt-3">
            {[
              [
                "bi-cpu",
                "Automatic Classification",
                "Suggest complaint category and department from complaint details.",
              ],
              [
                "bi-lightning-charge",
                "Priority Detection",
                "Identify urgency using severity, impact and organizational rules.",
              ],
              [
                "bi-diagram-3",
                "Auto Assignment",
                "Route complaints to the appropriate department or staff.",
              ],
              [
                "bi-alarm",
                "SLA & Escalation",
                "Highlight overdue complaints and trigger escalation.",
              ],
              [
                "bi-copy",
                "Duplicate Detection",
                "Identify similar complaints and recurring issues.",
              ],
              [
                "bi-bar-chart",
                "Analytics & Insights",
                "Understand complaint trends, hotspots and resolution performance.",
              ],
            ].map(([icon, title, description], idx) => (
              <div className="col-md-6 col-lg-4" key={title}>
                <Reveal delay={idx * 70}>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <i className={`bi ${icon}`}></i>
                    </div>

                    <h5>{title}</h5>

                    <p>{description}</p>

                    <span className="feature-arrow">
                      <i className="bi bi-arrow-up-right"></i>
                    </span>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-strip">
        <div className="container">
          <Reveal>
            <div className="text-center section-heading">
              <span className="section-label">PROVEN AT SCALE</span>

              <h2>
                Numbers that <span>build confidence</span>
              </h2>

              <p>
                Organizations using structured complaint workflows see faster
                resolutions and happier users.
              </p>
            </div>
          </Reveal>

          <div className="stats-grid">
            {[
              ["12,400+", "Complaints resolved"],
              ["94%", "SLA compliance rate"],
              ["2.4x", "Faster resolution"],
              ["4.8/5", "Average user rating"],
            ].map(([value, label], idx) => (
              <Reveal key={label} delay={idx * 90}>
                <div className="stat-tile">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="section-padding workflow-section">
        <div className="container">
          <Reveal>
            <div className="text-center section-heading">
              <span className="section-label">COMPLAINT LIFECYCLE</span>

              <h2>
                From Complaint to <span>Resolution</span>
              </h2>

              <p>
                A transparent end-to-end process keeps everyone informed.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="workflow">
              {[
                ["01", "Submit", "User submits a complaint"],
                ["02", "Validate", "System validates & creates ID"],
                ["03", "Classify", "Category & priority detected"],
                ["04", "Assign", "Admin assigns department/staff"],
                ["05", "Resolve", "Staff investigates & updates"],
                ["06", "Feedback", "User confirms resolution"],
              ].map(([number, title, description]) => (
                <div className="workflow-step" key={number}>
                  <div className="workflow-number">{number}</div>
                  <h5>{title}</h5>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-padding">
        <div className="container">
          <Reveal>
            <div className="text-center section-heading">
              <span className="section-label">LOVED BY USERS</span>

              <h2>
                What our <span>users say</span>
              </h2>

              <p>
                Real feedback from users, staff and administrators using
                SmartComplaint every day.
              </p>
            </div>
          </Reveal>

          <div className="row g-4 mt-3">
            {[
              {
                name: "Ananya Deshmukh",
                role: "Student, Sunridge College",
                color: "#315efb",
                quote:
                  "I reported a broken lab socket and could track every step — verified, assigned, resolved — all within a day. The transparency is amazing.",
              },
              {
                name: "Rajesh Kulkarni",
                role: "Facility Manager, VertexCorp",
                color: "#6a3df5",
                quote:
                  "The dashboard gives me SLA status at a glance. Overdue complaints are highlighted automatically, so nothing slips through the cracks.",
              },
              {
                name: "Priya Nair",
                role: "Society Member, GreenPark",
                color: "#0e9f6e",
                quote:
                  "Gone are the days of complaint registers and follow-up calls. Everything is online now, with proof and timestamps.",
              },
            ].map((t, idx) => (
              <div className="col-md-4" key={t.name}>
                <Reveal delay={idx * 90}>
                  <div className="testimonial-card">
                    <div className="testimonial-stars">
                      ★★★★★
                    </div>

                    <p className="testimonial-quote">"{t.quote}"</p>

                    <div className="testimonial-author">
                      <div
                        className="testimonial-avatar"
                        style={{ background: t.color }}
                      >
                        {t.name.charAt(0)}
                      </div>

                      <div>
                        <strong>{t.name}</strong>
                        <small>{t.role}</small>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container text-center">
          <span className="section-label">GET STARTED</span>

          <h2>Turn scattered complaints into a structured process.</h2>

          <p>
            Give users transparency and give management actionable insights.
          </p>

          <Link to="/register" className="btn btn-light btn-lg px-5">
            Create Your Account
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <h5 className="footer-brand">
                <span className="brand-icon">
                  <i className="bi bi-chat-square-text-fill"></i>
                </span>
                Smart<span className="brand-highlight">Complaint</span>
              </h5>

              <p>
                Smart, trackable and accountable complaint management for
                modern organizations. Register, classify, assign, track and
                resolve — all in one platform.
              </p>
            </div>

            <div className="col-6 col-lg-2">
              <div className="footer-heading">Product</div>

              <ul className="footer-links">
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#workflow">How It Works</a>
                </li>
                <li>
                  <a href="#organizations">Organizations</a>
                </li>
              </ul>
            </div>

            <div className="col-6 col-lg-2">
              <div className="footer-heading">Account</div>

              <ul className="footer-links">
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Create Account</Link>
                </li>
              </ul>
            </div>

            <div className="col-lg-4">
              <div className="footer-heading">Contact</div>

              <ul className="footer-links">
                <li>
                  <a href="mailto:support@smartcomplaint.com">
                    <i className="bi bi-envelope me-2"></i>
                    support@smartcomplaint.com
                  </a>
                </li>
                <li>
                  <a href="tel:+911800123456">
                    <i className="bi bi-telephone me-2"></i>
                    1800-123-456 (toll free)
                  </a>
                </li>
                <li>
                  <span>
                    <i className="bi bi-geo-alt me-2"></i>
                    Pune, Maharashtra, India
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <small>
              © 2026 Smart Complaint Management System. All rights reserved.
            </small>

            <small>Smart • Trackable • Accountable • Scalable</small>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
