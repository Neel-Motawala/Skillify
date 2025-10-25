// Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


export default function Navbar() {
    const navigate = useNavigate();

    // Logout handler
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-light bg-white shadow-sm px-3 fixed-top" style={{ height: "56px" }}>
            <div className="d-flex align-items-center">
                <h4 className="mb-0 text-primary">Skillify</h4>
            </div>

            <div className="dropdown">
                <img
                    src="/images/avtar/bear.png"
                    width="45"
                    height="45"
                    alt="account"
                    className="rounded-circle me-3"
                    style={{ cursor: "pointer" }}
                    id="accountMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                />
                <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="accountMenu"
                >
                    <li>
                        <button className="dropdown-item">Profile</button>
                    </li>
                    <li>
                        <button className="dropdown-item">Settings</button>
                    </li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <button
                            className="dropdown-item text-danger"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
