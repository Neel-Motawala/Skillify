import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


// Login and Registration Forms
import AdminLogin from "./Form/AdminLogin";
import LoginForm from "./Form/UserLogin";
import RegisterForm from "./Form/UserRegistration";

// Admin Pages 
import AdminDashboardLayout from "./Admin/Pages/DashboardLayout";
import ViewUsers from "./Admin/Pages/Users";

// User Pages 
import UserDashboard from "./User/Pages/Dashboard";
import CourseDetail from "./User/Pages/CourseDetail";

function App() {
  // ✅ ProtectedRoute with role verification
  const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    // If not logged in
    if (!token) return <Navigate to="/login" replace />;

    // If role doesn't match
    if (role && userRole !== role) {
      return <Navigate to={userRole === "admin" ? "/admin-dashboard" : "/"} />;
    }

    return children;
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* ---------- Public Routes ---------- */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/admin-login" element={<AdminLogin />} />


          {/* ---------- Admin Routes ---------- */}
          <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboardLayout /></ProtectedRoute>} />
          <Route path="/admin-dashboard/view-users" element={<ProtectedRoute role="admin"><ViewUsers /></ProtectedRoute>} />


          {/* ---------- User Routes ---------- */}
          <Route path="/" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/course/:CId" element={<ProtectedRoute role="user"><CourseDetail /></ProtectedRoute>} />


          {/* ---------- Fallback ---------- */}
          {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
