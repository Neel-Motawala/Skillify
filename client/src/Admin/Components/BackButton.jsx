// src/components/BackButton.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to = "/", label = "Back" }) {
    const navigate = useNavigate();

    return (
        <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center"
            onClick={() => navigate(to, { replace: true })}
            style={{
                borderRadius: "6px",
                fontWeight: 500,
                letterSpacing: "0.3px",
                transition: "all 0.15s ease-in-out",
            }}
        >
            <i className="bi bi-arrow-left me-1"></i>
            {label}
        </button>
    );
}
