# Smart Complaint Management System

A centralized, role-based web platform for registering, managing, tracking, assigning, and resolving complaints with **SLA monitoring, smart classification, analytics, and complete complaint history**.

## 🚀 Project Overview

The **Smart Complaint Management System** provides a digital platform where users can register complaints and track their progress, while administrators and staff can verify, assign, manage, resolve, and monitor complaints efficiently.

The system is designed to replace fragmented complaint handling through phone calls, paper registers, WhatsApp messages, and other informal channels with a centralized web-based solution.

### 🎯 Objectives

* Centralize complaint registration and tracking.
* Provide role-based complaint management.
* Automatically suggest complaint category and priority.
* Track complaints against predefined SLA deadlines.
* Highlight overdue complaints.
* Maintain a complete complaint timeline and audit history.
* Provide analytics for complaint and service performance.
* Improve transparency between complainants, administrators, and staff.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* User registration and login.
* JWT-based authentication.
* Secure password hashing using bcrypt.
* Role-based access control.
* Protected frontend routes.
* Separate dashboards for User, Staff, and Admin.

### 📝 Complaint Management

Users can submit complaints with:

* Complaint title
* Category
* Priority
* Location
* Description
* Supporting attachment

Each complaint receives a unique ID in the format:

```text
CMP-YYYY-NNNNN
```

### 🤖 Smart Classification

The system provides rule-based suggestions for:

* Complaint category
* Complaint priority

Urgency keywords can automatically suggest priorities such as:

* Critical
* High
* Medium
* Low

Users can review and override the suggested classification before submission.

### 🔄 Complaint Lifecycle

```text
SUBMITTED
    ↓
VERIFIED
    ↓
ASSIGNED
    ↓
IN PROGRESS
    ↓
RESOLVED
    ↓
CLOSED
```

Rejected complaints follow:

```text
SUBMITTED → REJECTED
```

Resolved complaints can be reopened:

```text
RESOLVED → REOPENED → VERIFICATION
```

Every status transition is recorded in the complaint timeline.

### ⏱️ SLA Management

| Priority |       SLA |
| -------- | --------: |
| Critical |  24 Hours |
| High     |  48 Hours |
| Medium   |  72 Hours |
| Low      | 120 Hours |

The system classifies active complaints as:

* Within SLA
* Due Soon
* Overdue

Overdue complaints are highlighted for management attention.

### ⭐ Feedback

After resolution, users can provide:

* 1–5 star rating
* Optional feedback comment

### 🔎 Search & Filtering

Users and administrators can search and filter complaints based on relevant fields such as:

* Status
* Category
* Priority
* Complaint text

### 📊 Analytics & Reporting

The system provides analytics including:

* Total complaints
* Open complaints
* In-progress complaints
* Resolved complaints
* Complaints by category
* Complaints by department
* Monthly complaint statistics
* SLA performance
* Overdue complaints
* Due-soon complaints
* Average resolution time

---

## 👥 User Roles

### 👤 User

* Register and login
* Submit complaints
* Track complaints
* View complaint timeline
* Reopen resolved complaints
* Close resolved complaints
* Submit feedback

### 🧑‍💼 Staff

* View assigned complaints
* Start complaint work
* Update complaint status
* Resolve complaints
* Add resolution notes

### 🛡️ Admin

* Manage users
* Create staff accounts
* Verify complaints
* Reject complaints
* Assign complaints to staff
* Reassign complaints
* Monitor SLA
* View all complaints
* View analytics

---

## 🛠️ Technology Stack

### Frontend

* React 19
* Vite 8
* React Router
* Axios
* Bootstrap 5
* Bootstrap Icons

### Backend

* Node.js
* Express.js
* Mongoose
* JWT
* bcryptjs
* Multer
* express-validator
* Morgan
* dotenv
* CORS

### Database

* MongoDB
* MongoDB Atlas

### Architecture

```text
React Frontend
      │
      │ REST API
      ▼
Express.js Backend
      │
      ▼
MongoDB Database
```

---

## 📁 Project Structure

```text
SmartComplaintManagementSystem/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── ...
│   ├── uploads/
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── REQUIREMENTS.md
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/sushant-0611/SmartComplaintManagementSystem.git
```

```bash
cd SmartComplaintManagementSystem
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

## 🔐 Environment Configuration

Create:

```text
server/.env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

**Never commit the real `.env` file to GitHub.**

---

## ▶️ Running the Project

### Start Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔌 API Overview

| Method   | Endpoint                       | Access        |
| -------- | ------------------------------ | ------------- |
| POST     | `/api/auth/register`           | Public        |
| POST     | `/api/auth/login`              | Public        |
| GET      | `/api/auth/me`                 | Authenticated |
| POST     | `/api/complaints`              | User/Admin    |
| POST     | `/api/complaints/suggest`      | Authenticated |
| GET      | `/api/complaints`              | Authenticated |
| GET      | `/api/complaints/:id`          | Authenticated |
| PATCH    | `/api/complaints/:id/verify`   | Admin         |
| PATCH    | `/api/complaints/:id/reject`   | Admin         |
| PATCH    | `/api/complaints/:id/assign`   | Admin         |
| PATCH    | `/api/complaints/:id/status`   | Staff/Admin   |
| PATCH    | `/api/complaints/:id/reopen`   | User          |
| PATCH    | `/api/complaints/:id/close`    | User          |
| POST     | `/api/complaints/:id/feedback` | User          |
| GET      | `/api/analytics/summary`       | Authenticated |
| GET/POST | `/api/users/staff`             | Admin         |
| GET      | `/api/users`                   | Admin         |
| PATCH    | `/api/users/:id/status`        | Admin         |

---

## 📎 File Upload

The system supports one attachment per complaint.

Supported formats:

```text
JPG
PNG
GIF
WEBP
PDF
DOC
DOCX
```

Maximum file size:

```text
5 MB
```

---

## 🔒 Security

The project implements:

* JWT authentication
* bcrypt password hashing
* Role-based authorization
* Protected API endpoints
* Input validation
* CORS configuration
* File type validation
* File size restriction
* Environment-based configuration
* Centralized error handling

---

## 📊 Database Collections

The system uses MongoDB collections including:

```text
User
Complaint
Department
Counter
```

The Complaint model stores complaint information, assignment, SLA details, timeline, resolution information, and feedback.

---

## 🔮 Future Scope

Future enhancements can include:

* Email notifications
* In-app notifications
* SLA breach alerts
* Automatic complaint assignment
* Duplicate complaint detection
* PDF/Excel report generation
* Multi-organization support
* Advanced analytics
* AI/ML-based complaint classification

---

## 🎓 Project Type

**Final Year B.E. / B.Tech Computer Engineering Project**

### Domain

```text
Web Application
Software Engineering
Complaint Management
Data Analytics
Role-Based Systems
```

---

## 👨‍💻 Developed By

### **SushTech Innovations**
| Hardware | AI | Project Support|

**Smart Complaint Management System**

> Designed and developed as a modern, centralized complaint management platform with role-based workflows, SLA monitoring, smart classification, and analytics.

Website: https://sushant-0611.github.io/ Email: sushtech.service@gmail.com
---

## 📄 License

This project is developed for educational, academic, and demonstration purposes.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**GitHub Repository:**

https://github.com/sushant-0611/SmartComplaintManagementSystem
