import React, { useState, useEffect } from "react";
import styles from "../../Styles/DashboardLayout/Sidebar.module.css";

export default function Sidebar({ isCollapsed, onToggle }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <aside
            className={[
                styles.sidebar,
                isCollapsed ? styles.collapsed : styles.expanded,
                isMobile && isCollapsed ? styles.hidden : "",
            ].join(" ")}
        >
            {/* Header */}
            <div className={styles.sidebarHeader}>
                {!isCollapsed && <h4 className={styles.sidebarTitle}>Admin Panel</h4>}
                <button className={styles.toggleBtn} onClick={onToggle}>
                    <i className={`bi ${isCollapsed ? "bi-list" : "bi-x-lg"}`}></i>
                </button>
            </div>

            {/* Menu */}
            <ul className={styles.sidebarMenu}>
                {[
                    { icon: "bi-speedometer2", label: "Overview", href: "#overview" },
                    { icon: "bi-graph-up", label: "Reports", href: "#reports" },
                    { icon: "bi-bar-chart-line", label: "Analytics", href: "#analytics" },
                    { icon: "bi-gear", label: "Settings", href: "#settings" },
                ].map((item) => (
                    <li key={item.label} className={styles.sidebarItem}>
                        <a href={item.href} className={styles.sidebarLink}>
                            <i className={`bi ${item.icon}`}></i>
                            {!isCollapsed && <span>{item.label}</span>}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
