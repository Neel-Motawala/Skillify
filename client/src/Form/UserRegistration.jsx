import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../Images/logo.jpg"; // replace with your logo path

export default function UserRegistration() {
    const [formData, setFormData] = useState({
        user_fullname: "",
        user_name: "",
        user_email: "",
        user_contact: "",
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

        if (formData.user_password !== formData.confirm_password) {
            setMessage({ text: "Passwords do not match", type: "error" });
            return;
        }


        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/register-user",
                formData
            );

            if (response.data.success) {
                setMessage({ text: response.data.message, type: "success" });
                setTimeout(() => navigate("/login"), 1500);
            } else {
                setMessage({ text: response.data.error || "Registration failed", type: "error" });
            }
        } catch (error) {
            if (error.response?.data?.error) {
                setMessage({ text: error.response.data.error, type: "error" });
            } else {
                setMessage({ text: "An error occurred. Please try again.", type: "error" });
            }
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={{ backgroundColor: "#e9ecef", padding: "40px 0" }}
        >
            <div
                className="d-flex flex-column flex-md-row shadow rounded-4 overflow-hidden w-75 mx-auto"
                style={{ backgroundColor: "#fff" }}
            >
                {/* Left Side - Registration Form */}
                <div
                    className="d-flex flex-column justify-content-center align-items-start px-4 px-md-5 py-5"
                    style={{ flex: 1, backgroundColor: "#ffffff" }}
                >
                    <div className="w-100" style={{ maxWidth: "500px", margin: "0 auto" }}>
                        <div className="text-center mb-4">
                            <img
                                src={logo}
                                alt="Logo"
                                style={{ width: "70px", height: "70px", marginBottom: "10px" }}
                            />
                            <h4 className="fw-semibold text-dark mb-2">Create Account</h4>
                            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                                Please fill in the details to register
                            </p>
                        </div>

                        {message.text && (
                            <div
                                className={`alert text-center py-2 ${message.type === "success" ? "alert-success" : "alert-danger"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-100 text-start">
                            {/* Row 1: Fullname + Username */}
                            <div className="row g-3 mb-3">
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-medium text-secondary">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="user_fullname"
                                        placeholder="Full Name"
                                        value={formData.user_fullname}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                    />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-medium text-secondary">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="user_name"
                                        placeholder="Username"
                                        value={formData.user_name}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                    />
                                </div>
                            </div>

                            {/* Row 2: Email + Contact */}
                            <div className="row g-3 mb-3">
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-medium text-secondary">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="user_email"
                                        placeholder="Email"
                                        value={formData.user_email}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                    />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-medium text-secondary">
                                        Contact Number
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="user_contact"
                                        placeholder="Contact"
                                        value={formData.user_contact}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                    />
                                </div>
                            </div>

                            {/* Row 3: Password + Confirm Password */}
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-medium text-secondary">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="user_password"
                                        placeholder="Password"
                                        value={formData.user_password}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="col-12 col-sm-6">
                                    <label className="form-label fw-medium text-secondary">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirm_password"
                                        placeholder="Confirm Password"
                                        value={formData.confirm_password || ""}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                        autoComplete="off"
                                    />
                                </div>
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
                                Register
                            </button>

                            <p
                                className="text-center mt-4 mb-0"
                                style={{ fontSize: "0.9rem", color: "#6c757d" }}
                            >
                                Already have an account?{" "}
                                <Link to="/login" className="text-primary fw-medium">
                                    Login
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                {/* Right Side - Welcome Panel (hidden <768px) */}
                <div
                    className="d-none d-lg-flex flex-column justify-content-center align-items-center text-white"
                    style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #0056b3, #00b4d8)",
                        textAlign: "center",
                        padding: "50px",
                    }}
                >
                    <h1 className="fw-bold mb-3">Join Us!</h1>
                    <p style={{ fontSize: "1rem", maxWidth: "350px" }}>
                        Create an account and start your journey with us today.
                    </p>
                </div>

            </div>

            {/* Responsive adjustments */}
            <style>
                {`
            @media (max-width: 425px) {
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
