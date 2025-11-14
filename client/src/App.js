import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Login and Registration Forms
import AdminLogin from "./Form/AdminLogin";
import LoginForm from "./Form/UserLogin";
import RegisterForm from "./Form/UserRegistration";

// Admin Pages 
import AdminDashboardLayout from "./Admin/Pages/DashboardLayout";
import ViewUsers from "./Admin/Pages/Users";
import ViewCourses from "./Admin/Pages/ViewCourses";
import ManageCourse from "./Admin/Pages/ManageCourse";
import AddQuestions from "./Admin/Pages/AddQuestions";
import UserTest from "./Admin/Pages/UserTest";
import UserReport from "./Admin/Pages/UserReport";
import ViewUserTest from "./Admin/Components/User/ViewUserTest";
import DetailUserTest from "./Admin/Pages/DetailUserTest";
import ViewUserResult from "./Admin/Pages/ViewUserResult";

import { UserProvider } from "./Admin/Context/UserContext";

// User Pages 
import UserDashboard from "./User/Pages/Dashboard";
import CourseDetail from "./User/Pages/CourseDetail";
import TestPage from "./User/Pages/TestPage";
import MyActivity from "./User/Pages/MyActivity";
import PreviewPage from "./User/Pages/PreviewPage";
import ViewResult from "./User/Pages/ViewResult";
import MyAnalytics from "./User/Pages/MyAnalytics";
import Profile from "./User/Pages/Profile";
import Progress from "./User/Pages/Progress";
import CodePlayground from "./User/Pages/CodePlayground";
import CodeTestPage from "./User/Pages/CodeTestPage";
import Settings from "./User/Pages/Setting";
import ViewCodeResult from "./User/Pages/ViewCodeResult";

import MCQ from "./Extra/mcq";

function App() {
  // ✅ ProtectedRoute with role verification
  const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) return <Navigate to="/login" replace />;

    if (role && userRole !== role) {
      return <Navigate to={userRole === "admin" ? "/admin-dashboard" : "/"} replace />;
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
          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute role="admin">
                <UserProvider>
                  <Routes>
                    <Route path="" element={<AdminDashboardLayout />} />
                    <Route path="view-users" element={<ViewUsers />} />
                    <Route path="manage-courses" element={<ViewCourses />} />
                    <Route path="manage-courses/:id" element={<ManageCourse />} />
                    <Route path="manage-courses/:id/add" element={<AddQuestions />} />
                    <Route path="user-tests" element={<UserTest />} />
                    <Route path="user-tests/:userId" element={<ViewUserTest />} />
                    <Route path="user-tests/:userId/result/:userTestId" element={<ViewUserResult />} />


                    <Route path="user-report" element={<UserReport />} />
                    <Route path="user-report/:userId" element={<DetailUserTest />} />
                  </Routes>
                </UserProvider>
              </ProtectedRoute>
            }
          />

          {/* ---------- User Routes ---------- */}
          <Route path="/"
            element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>}
          />

          <Route path="/dashboard/course/:id"
            element={<ProtectedRoute role="user"><CourseDetail /></ProtectedRoute>}
          />

          <Route path="/dashboard/course/:id/test/:userTestId"
            element={<ProtectedRoute role="user"><TestPage /></ProtectedRoute>}
          />

          <Route path="/dashboard/course/:id/test/:userTestId/preview"
            element={<ProtectedRoute role="user"><PreviewPage /></ProtectedRoute>}
          />

          <Route path="/dashboard/activity"
            element={<ProtectedRoute role="user"><MyActivity /></ProtectedRoute>}
          />

          <Route path="/dashboard/course/:id/result/:userTestId"
            element={<ProtectedRoute role="user"><ViewResult /></ProtectedRoute>}
          />

          <Route path="/dashboard/course/:id/code/:codeTestId/result"
            element={<ProtectedRoute role="user"><ViewCodeResult /></ProtectedRoute>}
          />

          <Route path="/dashboard/analytics"
            element={<ProtectedRoute role="user"><MyAnalytics /></ProtectedRoute>}
          />

          <Route path="/dashboard/profile"
            element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>}
          />

          <Route path="/dashboard/progress"
            element={<ProtectedRoute role="user"><Progress /></ProtectedRoute>}
          />

          <Route path="/dashboard/course/:courseId/code/:userTestId"
            element={<ProtectedRoute role="user"><CodeTestPage /></ProtectedRoute>}
          />

          <Route path="/dashboard/course/:courseId/code/:userTestId/q/:questionId"
            element={<ProtectedRoute role="user"><CodePlayground /></ProtectedRoute>}
          />

          <Route path="/dashboard/settings"
            element={<ProtectedRoute role="user"><Settings /></ProtectedRoute>}
          />

          {/* ---------- Extra Routes ---------- */}
          <Route path="/mcq" element={<MCQ />} />


          {/* ---------- Fallback ---------- */}
          {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
