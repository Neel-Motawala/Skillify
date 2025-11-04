import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/Dashboard/Navbar.module.css";

export default function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>Skillify</div>

            <div className={styles.dropdown} ref={menuRef}>
                <button
                    className={styles.avatarBtn}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <img
                        src="/images/avtar/bear.png"
                        alt="account"
                        className={styles.avatarImg}
                    />
                </button>

                {menuOpen && (
                    <ul className={styles.dropdownMenu}>
                        <li>
                            <button
                                className={styles.dropdownItem}
                                onClick={() => navigate("/dashboard/profile")}
                            >
                                Profile
                            </button>
                        </li>
                        <li>
                            <button
                                className={styles.dropdownItem}
                                onClick={() => navigate("/setting")}
                            >
                                Settings
                            </button>
                        </li>
                        <li><hr className={styles.divider} /></li>
                        <li>
                            <button
                                className={`${styles.dropdownItem} ${styles.logout}`}
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    );
}
