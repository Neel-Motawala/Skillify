import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        admin_email: "",
        admin_password: "",
    });

    const [message, setMessage] = useState({ text: "", type: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login-admin", formData);

            if (res.data.success) {
                setMessage({ text: res.data.message, type: "success" });
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role);
                localStorage.setItem("id", res.data.adminId);
                setTimeout(() => navigate("/admin-dashboard", { replace: true }), 1000);
            } else {
                setMessage({ text: res.data.error || "Login failed.", type: "error" });
            }
        } catch (err) {
            setMessage({
                text: err.response?.data?.error || "An error occurred. Please try again.",
                type: "error",
            });
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: "400px" }}>
                <h3 className="text-center mb-3">Admin Login</h3>

                {message.text && (
                    <div
                        className={`alert text-center py-2 ${message.type === "success" ? "alert-success" : "alert-danger"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="admin_email"
                            className="form-control"
                            value={formData.admin_email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="admin_password"
                            className="form-control"
                            value={formData.admin_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
