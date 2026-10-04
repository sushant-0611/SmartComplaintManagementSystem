import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";

import NewComplaint from "./pages/NewComplaint";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

const TITLE_RULES = [
  [/^\/$/, "SmartComplaint — Smart Complaint Management System"],
  [/^\/login/, "Login | SmartComplaint"],
  [/^\/register/, "Create Account | SmartComplaint"],
  [/^\/user\/dashboard/, "User Dashboard | SmartComplaint"],
  [/^\/user\/complaints/, "My Complaints | SmartComplaint"],
  [/^\/user\/new-complaint/, "New Complaint | SmartComplaint"],
  [/^\/user\/complaint\//, "Complaint Details | SmartComplaint"],
  [/^\/admin\/dashboard/, "Admin Dashboard | SmartComplaint"],
  [/^\/staff\/dashboard/, "Staff Dashboard | SmartComplaint"],
];

function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = TITLE_RULES.find(([pattern]) => pattern.test(pathname));

    document.title = match ? match[1] : "Page Not Found | SmartComplaint";
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RouteEffects />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute roles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/complaints"
          element={
            <ProtectedRoute roles={["user"]}>
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/new-complaint"
          element={
            <ProtectedRoute roles={["user", "admin"]}>
              <NewComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/complaint/:id"
          element={
            <ProtectedRoute roles={["user", "staff", "admin"]}>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute roles={["staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
