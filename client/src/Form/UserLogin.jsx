import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../Images/logo.jpg"; // update path as needed
import "./style/loginForm.css";

export default function LoginForm() {
    const [formData, setFormData] = useState({
        user_name: "",
        user_password: "",
    });

    const [message, setMessage] = useState({ text: "", type: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        try {
            const response = await axios.post("http://localhost:5000/api/auth/login-user", formData);

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("id", response.data.userId);
                setTimeout(() => navigate("/"), 1000);
            } else {
                setMessage({ text: response.data.error || "Login failed.", type: "error" });
            }
        } catch (error) {
            setMessage({
                text: error.response?.data?.error || "An error occurred. Please try again.",
                type: "error",
            });
        }
    };

    // Auto-hide message after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                // Start fade-out before removal
                const fadeTimer = setTimeout(() => setMessage({ text: "", type: "" }), 500);
                return () => clearTimeout(fadeTimer);
            }, 2500); // total ~3s visible (2.5s show + 0.5s fade)
            return () => clearTimeout(timer);
        }
    }, [message.text]);

    return (
        <div
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={{
                backgroundColor: "#e9ecef",
                padding: "40px 0",
            }}
        >
            <div
                className="d-flex flex-column flex-md-row shadow rounded-4 overflow-hidden"
                style={{
                    width: "75%",
                    maxWidth: "1000px",
                    backgroundColor: "#fff",
                }}
            >
                {/* Left Side - Login Form */}
                <div
                    className="d-flex flex-column justify-content-center align-items-start px-4 px-md-5 py-5"
                    style={{ flex: 1, backgroundColor: "#ffffff" }}
                >
                    <div className="w-100" style={{ maxWidth: "360px", margin: "0 auto" }}>
                        <div className="text-center mb-4">
                            <img
                                src={logo}
                                alt="Logo"
                                style={{ width: "70px", height: "70px", marginBottom: "10px" }}
                            />
                            <h4 className="fw-semibold text-dark mb-2">Welcome Back</h4>
                            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                                Please sign in to your account
                            </p>
                        </div>

                        {message.text && (
                            <div
                                className={`alert text-center py-2 ${message.type === "success" ? "alert-success" : "alert-danger"
                                    } ${!message.text ? "hide" : ""}`}
                            >
                                {message.text}
                            </div>
                        )}


                        <form onSubmit={handleSubmit} className="w-100 text-start">
                            <div className="mb-3">
                                <label className="form-label fw-medium text-secondary">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="user_name"
                                    placeholder="Enter your username"
                                    value={formData.user_name}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    required
                                    style={{ borderRadius: "8px" }}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-medium text-secondary">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="user_password"
                                    placeholder="Enter your password"
                                    value={formData.user_password}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    required
                                    style={{ borderRadius: "8px" }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 text-white fw-semibold"
                                style={{
                                    backgroundColor: "#007bff",
                                    borderRadius: "8px",
                                    padding: "10px 0",
                                }}
                            >
                                Sign In
                            </button>

                            <p
                                className="text-center mt-4 mb-0"
                                style={{ fontSize: "0.9rem", color: "#6c757d" }}
                            >
                                Don’t have an account?{" "}
                                <Link to="/register" className="text-primary fw-medium">
                                    Register
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                {/* Right Side - Welcome Section */}
                <div
                    className="d-none d-md-flex flex-column justify-content-center align-items-center text-white"
                    style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #0056b3, #00b4d8)",
                        textAlign: "center",
                        padding: "50px",
                    }}
                >
                    <h1 className="fw-bold mb-3">Hello Again!</h1>
                    <p style={{ fontSize: "1rem", maxWidth: "350px" }}>
                        Log in to continue your journey with us.
                    </p>
                </div>
            </div>

            <style>
                {`
            @media (max-width: 425px) {
                .min-vh-100 {
                    height: auto !important;
                }
                .shadow {
                    box-shadow: none !important;
                }
                .rounded-4 {
                    border-radius: 0 !important;
                }
            }
        `}
            </style>
        </div>
    );
}
