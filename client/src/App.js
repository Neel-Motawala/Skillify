import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from './Form/AdminLogin';
import LoginForm from './Form/UserLogin';
import RegisterForm from './Form/UserRegistration';
import UserDashboard from './User/components/DashboardLayout';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/login" replace />;

  return children;
};


function App() {

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/admin-login" element={<AdminLogin />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
