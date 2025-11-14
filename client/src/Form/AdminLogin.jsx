import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./style/AdminLogin.module.css";

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
            const res = await axios.post(
                "http://localhost:5000/api/auth/login-admin",
                formData
            );

            if (res.data.success) {
                setMessage({ text: res.data.message, type: "success" });

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role);
                localStorage.setItem("id", res.data.adminId);

                setTimeout(() => navigate("/admin-dashboard", { replace: true }), 1200);
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
        <div className={styles.adminLoginWrapper}>
            <div className={styles.adminCard}>
                <img src="/images/avtar/cat.png" className={styles.brandIcon} alt="Admin" />

                <h3 className={styles.adminTitle}>Skillify Admin</h3>
                <p className={styles.adminSubtitle}>Sign in to access your dashboard</p>

                {message.text && (
                    <div
                        className={`${styles.alertBox} text-center ${message.type === "success" ? "alert alert-success" : "alert alert-danger"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className={styles.formLabel}>Email</label>
                        <input
                            type="email"
                            name="admin_email"
                            className={styles.formControl}
                            value={formData.admin_email}
                            onChange={handleChange}
                            placeholder="Enter admin email"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className={styles.formLabel}>Password</label>
                        <input
                            type="password"
                            name="admin_password"
                            className={styles.formControl}
                            value={formData.admin_password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.loginBtn}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
