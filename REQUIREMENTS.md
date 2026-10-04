# SmartComplaint — Software Requirements Specification


|-------------|------------------------------------------------|
| **Project** | Smart Complaint Management System              |
| **Type**    | Final Year B.E. Project (Computer Engineering) |
| **Stack**   | MERN — MongoDB, Express.js, React, Node.js     |
| **Version** | 1.0                                            |
| **Date**    | October 2026                                   |

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements of the **Smart Complaint Management System** — a centralized, role-based web platform through which members of an organization (students, employees, residents, citizens) register complaints, and management verifies, assigns, tracks and resolves them with measurable SLAs.

### 1.2 Problem Statement
Traditional complaint handling is fragmented and slow:

- Complaints arrive through scattered channels (phone calls, paper registers, WhatsApp) — nothing is centralized.
- Complainants have no visibility into who received the complaint or when it will be resolved.
- Complaints get forwarded to the wrong department, causing delays.
- Management has no reliable data on recurring issues and resolution times.
- There is no complete audit history of actions and status changes.

### 1.3 Objectives
1. Centralize complaint registration and tracking in one platform.
2. Enforce a transparent, role-based workflow (User → Admin → Staff).
3. Auto-classify complaints (category + priority) using smart keyword logic.
4. Track every complaint against a time-bound SLA and highlight overdue cases.
5. Provide analytics to identify recurring problems and service performance.

### 1.4 Intended Users & Deployment Context
The same system can be configured for any organization:

| Organization                 | Typical complaints                             |
|------------------------------|------------------------------------------------|
| Colleges / Schools           | Lab, classroom, hostel, campus issues          |
| Housing Societies            | Water, lift, parking, security, cleanliness    |
| Companies                    | IT issues, HR facilities, office maintenance   |
| Hospitals                    | Facility, housekeeping, equipment, service     |
| Hotels / Businesses          | Room, service, maintenance, customer complaints|
| Municipal / Public Services  | Streetlights, garbage, roads, civic issues     |

---

## 2. System Overview

### 2.1 Roles (Actors)

| Role      | Description                                                           | Account creation     |
|-----------|-----------------------------------------------------------------------|----------------------|
| **User**  | The complainant — registers and tracks complaints                     | Self-registration    |
| **Staff** | The resolver — works on assigned complaints and records resolutions   | Created by Admin     |
| **Admin** | The manager — verifies, assigns, monitors SLAs, views analytics       | Provisioned at setup |

### 2.2 Complaint Lifecycle

```
SUBMITTED → VERIFIED → ASSIGNED → IN PROGRESS → RESOLVED → CLOSED
                |
             REJECTED (with reason, visible to user)
                              RESOLVED → REOPENED → back to verification
```

Every status change is recorded in the complaint **timeline** with the actor and a note, creating a complete audit history.

### 2.3 SLA Rules
Each priority level carries a fixed resolution deadline:

| Priority | SLA       |
|----------|-----------|
| Critical | 24 hours  |
| High     | 48 hours  |
| Medium   | 72 hours  |
| Low      | 120 hours |

The SLA clock starts at submission. Open complaints are classified live as **Within SLA**, **Due Soon** (< 24 h left) or **Overdue**; overdue cases are highlighted in red on every dashboard.

### 2.4 Complaint Categories
Maintenance, Electrical, IT / Network, Cleaning, Security, Facilities, Other — mapped one-to-one with system departments.

---

## 3. Functional Requirements

### FR-1 — Authentication & User Management
- FR-1.1 Users shall be able to register with name, email and password; the default role is **User**.
- FR-1.2 All roles shall log in with email + password and receive a JWT token.
- FR-1.3 Passwords shall be stored hashed (bcrypt); plain-text passwords shall never be persisted.
- FR-1.4 Every API request shall be authenticated; invalid tokens → 401, insufficient role → 403.
- FR-1.5 The Admin shall be able to list all users, create staff accounts, and activate/deactivate accounts.
- FR-1.6 The frontend shall route each role to its own dashboard after login and guard every route by role.

### FR-2 — Complaint Registration
- FR-2.1 A User shall be able to submit a complaint with: title, category, priority, location and description.
- FR-2.2 The User shall be able to attach one supporting file (photo / document) per complaint.
- FR-2.3 Allowed attachment types: JPG, PNG, GIF, WEBP, PDF, DOC, DOCX; maximum size 5 MB.
- FR-2.4 The system shall generate a unique, human-readable Complaint ID in the format `CMP-YYYY-NNNNN`.
- FR-2.5 On submission the system shall compute the SLA due date from the final priority and set status to **Submitted**.

### FR-3 — Smart Classification
- FR-3.1 While the description is being typed, the system shall suggest a **category** using rule-based keyword analysis.
- FR-3.2 The system shall suggest a **priority** from urgency keywords (e.g., fire, emergency, accident → Critical; urgent, severe, not working at all → High).
- FR-3.3 The User shall be able to apply or override each suggestion before submitting.
- FR-3.4 The server shall re-run classification on submit and flag auto-classified complaints.

### FR-4 — Complaint Lifecycle Management
- FR-4.1 **Admin** shall verify a submitted complaint (status → **Verified**) or reject it with a mandatory reason (status → **Rejected**).
- FR-4.2 **Admin** shall assign a verified complaint to a staff member (status → **Assigned**); reassignment shall be supported at any open stage.
- FR-4.3 **Staff** shall mark an assigned complaint as **In Progress** (Start Work).
- FR-4.4 **Staff** shall resolve a complaint with a mandatory resolution note (status → **Resolved**).
- FR-4.5 The **User** shall be able to reopen a resolved complaint (status → **Reopened**); reopened complaints return to the Admin's verification queue.
- FR-4.6 The **User** (or Admin) shall close a resolved complaint (status → **Closed**).
- FR-4.7 Every transition shall append an entry to the complaint timeline (status, actor, timestamp, note).

### FR-5 — SLA Management
- FR-5.1 The system shall store the SLA hours and due date per complaint.
- FR-5.2 Dashboards and complaint details shall display the live remaining SLA time.
- FR-5.3 Complaints past their due date shall be flagged **Overdue** and visually highlighted.
- FR-5.4 SLA statistics (within SLA / due soon / overdue, resolved-within-SLA percentage) shall be computed for analytics.

### FR-6 — Feedback
- FR-6.1 After resolution, the User shall be able to submit feedback: star rating (1–5) and an optional comment.
- FR-6.2 Feedback shall be stored with the complaint and visible to Admin and Staff.

### FR-7 — Search, Filter & Tracking
- FR-7.1 The User shall see only their own complaints; the Staff shall see only complaints assigned to them; the Admin shall see all complaints.
- FR-7.2 The User shall be able to filter complaints by status and search by text.
- FR-7.3 The Admin complaint table shall support filtering by status, category, priority and search.
- FR-7.4 The complaint details page shall show the full timeline, SLA status, assignment details, attachment and feedback.

### FR-8 — Analytics & Reporting
- FR-8.1 The system shall provide a role-scoped analytics summary: total, open, in-progress, resolved counts.
- FR-8.2 Aggregations shall be provided by status, category, department and month.
- FR-8.3 SLA analytics shall include: overdue count, due-soon count, resolved-within-SLA count and average resolution time.
- FR-8.4 The Admin dashboard shall present the analytics with KPI cards, a category chart, an SLA overview and a pending-verification queue.

---

## 4. Non-Functional Requirements

| Category              | Requirement                                                                    |
|-----------------------|--------------------------------------------------------------------------------|
| **Security**          | JWT authentication on all private endpoints; bcrypt password hashing; role-based authorization (401/403); CORS restricted to the configured client origin; server-side input validation (express-validator) |
| **File Safety**       | Attachment type whitelist and 5 MB size limit; sanitized filenames; files served only from the uploads directory |
| **Usability**         | Responsive professional UI (desktop / tablet / mobile); consistent dashboard layout per role; color-coded priority and status badges; live SLA countdown |
| **Performance**       | Client build optimized via Vite; paginated/filtered queries on the complaint list; lean analytics aggregation   |
| **Reliability**       | Centralized error handling with consistent JSON error responses; request logging (morgan) |
| **Maintainability**   | Layered architecture (routes → controllers → models); environment-based configuration (`.env`); seed script for repeatable demo data |
| **Portability**       | API base URL configurable via `VITE_API_URL` for deployment; client and server deployable independently |

---

## 5. System Requirements

### 5.1 Technology Stack

| Layer       | Technology                                                             |
|-------------|------------------------------------------------------------------------|
| Frontend    | React 19, Vite 8, React Router 7, Axios, Bootstrap 5 + Bootstrap Icons |
| Backend     | Node.js (v20+), Express 5, Mongoose 9                                  |
| Database    | MongoDB (Atlas)                                                        |
| Auth        | JSON Web Tokens + bcryptjs                                             |
| File Upload | Multer (disk storage)                                                  |
| Validation  | express-validator                                                      |

### 5.2 Software Requirements
- Node.js ≥ 20 with npm
- Modern browser (Chrome / Edge / Firefox)
- MongoDB Atlas cluster (connection string in `server/.env`)

- cd D:\Clients\SmartComplaintManagementSystem\SmartComplaintManagementSystem\server
- npm.cmd install express mongoose cors dotenv bcryptjs jsonwebtoken multer morgan express-validator
- npm.cmd install --save-dev nodemon

- cd D:\Clients\SmartComplaintManagementSystem\SmartComplaintManagementSystem\client
- npm.cmd install react react-dom react-router-dom axios bootstrap bootstrap-icons
- npm.cmd install --save-dev vite @vitejs/plugin-react

### 5.3 Hardware Requirements
- Client: any device capable of running a modern browser
- Server: standard machine / cloud instance with ~1 GB RAM for the Node process

### 5.4 Run Configuration
- Server: port **5000** (`cd server && npm.cmd run dev`)
- Client: port **5173** (`cd client && npm.cmd run dev`)
- Demo data: `cd server && npm run seed`

---

## 6. Data Model (MongoDB Collections)

| Collection | Key Fields |
|---|---|
| **User** | name, email, passwordHash, role (user/staff/admin), department, active |
| **Complaint** | complaintId, title, description, category, priority, status, location, user, department, assignedTo, attachment, slaHours, slaDueAt, resolvedAt, rejectedReason, resolutionNote, timeline[], feedback{} |
| **Department** | name, description |
| **Counter** | year, sequence (for Complaint ID generation) |

## 7. REST API Summary

| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create user account |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/auth/me` | Any | Current user profile |
| POST | `/api/complaints` | User/Admin | Submit complaint (+attachment) |
| POST | `/api/complaints/suggest` | Any | Smart category/priority suggestion |
| GET | `/api/complaints` | Any | List complaints (role-scoped, filterable) |
| GET | `/api/complaints/:id` | Any | Complaint details + timeline |
| PATCH | `/api/complaints/:id/verify` | Admin | Verify complaint |
| PATCH | `/api/complaints/:id/reject` | Admin | Reject with reason |
| PATCH | `/api/complaints/:id/assign` | Admin | Assign staff |
| PATCH | `/api/complaints/:id/status` | Staff/Admin | In Progress / Resolved |
| PATCH | `/api/complaints/:id/reopen` | User | Reopen resolved complaint |
| PATCH | `/api/complaints/:id/close` | User | Close resolved complaint |
| POST | `/api/complaints/:id/feedback` | User | Submit feedback |
| GET | `/api/analytics/summary` | Any | Role-scoped analytics |
| GET/POST | `/api/users/staff` | Admin | List / create staff |
| GET | `/api/users` | Admin | List users |
| PATCH | `/api/users/:id/status` | Admin | Activate / deactivate user |

---

## 8. Constraints & Assumptions
- One attachment per complaint (extendable).
- SLA hours are fixed per priority (configurable in the model).
- Notifications are out of scope for v1 (see Future Scope).
- The system is single-tenant in v1 (one organization per deployment).

## 9. Future Scope (from project vision)
- Email / in-app notifications and SLA-breach alerts (warning at 80% of SLA).
- Automatic assignment using category, location and staff workload.
- Duplicate-complaint grouping to reveal recurring issues.
- Report export (PDF/Excel) for management.
- Multi-organization (tenant) support with data isolation.

---

*All requirements in Sections FR-1 to FR-8 are implemented and verified in the current build (end-to-end browser tested, build clean).*
