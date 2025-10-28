import React, { useState, useEffect } from "react";
import styles from "../../Styles/Dashboard/Sidebar.module.css";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

    const toggleSidebar = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 320);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className={`${styles.sidebar} 
                ${isOpen ? styles.sidebarExpanded : styles.sidebarCollapsed} 
                ${isMobile && !isOpen ? styles.sidebarHidden : ""}`}
        >
            {/* Toggle Button */}
            <button
                className={`${styles.toggleBtn} ${isOpen ? styles.expanded : styles.collapsed} btn btn-link`}
                onClick={toggleSidebar}
            >
                <span className="icon-wrapper">
                    <i className={`bi ${isOpen ? "bi-x-lg" : "bi-list"}`}></i>
                </span>
            </button>

            {/* Sidebar Menu */}
            <ul className={`nav flex-column ${styles.nav}`}>
                {[
                    { icon: "bi-speedometer2", label: "Overview", href: "#overview" },
                    { icon: "bi-graph-up", label: "Reports", href: "#reports" },
                    { icon: "bi-bar-chart-line", label: "Analytics", href: "#analytics" },
                    { icon: "bi-gear", label: "Settings", href: "#settings" },
                ].map((item) => (
                    <li key={item.label} className="nav-item mb-3 me-3">
                        <a href={item.href} className={`${styles.navLink} d-flex align-items-center`}>
                            <i className={`bi ${item.icon} fs-4`}></i>
                            {isOpen && <span className="ms-2">{item.label}</span>}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
