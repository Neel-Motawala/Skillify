import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/DashboardLayout/Navbar.module.css";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/admin-login", { replace: true });
    };

    return (
        <header className={styles.navbarWrapper}>
            <nav className={styles.navbar}>
                {/* Brand */}
                <div className={styles.brandSection}>
                    <h4 className={styles.brandText}>Skillify Admin</h4>
                </div>

                {/* Profile */}
                <div className={styles.profileSection}>
                    <button
                        className={styles.profileButton}
                        id="accountMenu"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <img
                            src="/images/avtar/cat.png"
                            alt="Admin Avatar"
                            className={styles.avatar}
                        />
                        <span className={styles.username}>Admin</span>
                        <i className={`bi bi-caret-down-fill ${styles.dropdownIcon}`}></i>
                    </button>

                    <ul
                        className={`dropdown-menu dropdown-menu-end ${styles.dropdownMenu}`}
                        aria-labelledby="accountMenu"
                    >
                        <li>
                            <button className={styles.dropdownItem}>
                                <i className="bi bi-person me-2"></i> Profile
                            </button>
                        </li>
                        <li>
                            <button className={styles.dropdownItem}>
                                <i className="bi bi-gear me-2"></i> Settings
                            </button>
                        </li>
                        <li><hr className={styles.dropdownDivider} /></li>
                        <li>
                            <button
                                className={`${styles.dropdownItem} ${styles.logout}`}
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i> Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}
