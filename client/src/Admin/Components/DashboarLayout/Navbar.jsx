import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/DashboardLayout/Navbar.module.css";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/admin-login");
    };

    return (
        <nav className={`${styles.adminNavbar} d-flex align-items-center justify-content-between px-4 shadow-sm`}>
            {/* Left Section */}
            <div className={`${styles.navbarLeft} d-flex align-items-center gap-3`}>
                <h4 className={styles.navbarBrandText}>Skillify Admin</h4>
            </div>

            {/* Right Section */}
            <div className="dropdown">
                <button
                    className="btn d-flex align-items-center p-0 border-0 bg-transparent"
                    id="accountMenu"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <img
                        src="/images/avtar/cat.png"
                        alt="Admin Avatar"
                        className={`${styles.navbarAvatar} rounded-circle`}
                        width="40"
                        height="40"
                    />
                    <span className="ms-2 fw-medium text-dark d-none d-md-inline">Admin</span>
                    <i className="bi bi-caret-down-fill ms-1 text-muted small"></i>
                </button>

                <ul className="dropdown-menu dropdown-menu-end mt-2 shadow-sm" aria-labelledby="accountMenu">
                    <li><button className="dropdown-item">Profile</button></li>
                    <li><button className="dropdown-item">Settings</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
