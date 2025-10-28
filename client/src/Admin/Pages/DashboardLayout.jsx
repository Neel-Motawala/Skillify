import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Page Components 
import Navbar from "../Components/DashboarLayout/Navbar";
import Sidebar from "../Components/DashboarLayout/Sidebar";
import MainContent from "../Components/DashboarLayout/MainContent";

// Css Files / Modules
import styles from "../Styles/DashboardLayout/DashboardLayout.module.css";

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Access control
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") navigate("/admin-login");
    }, [navigate]);

    // Sidebar toggle handler
    const handleToggleSidebar = () => setIsCollapsed((prev) => !prev);

    return (
        <div className={styles.dashboardLayout}>
            {/* Fixed Header */}
            <header className={styles.dashboardHeader}>
                <Navbar />
            </header>

            {/* Body below header */}
            <div
                className={`${styles.dashboardBody} ${isCollapsed ? styles.collapsed : ""
                    }`}
            >
                <aside
                    className={`${styles.dashboardSidebar} ${isCollapsed ? styles.collapsed : ""
                        }`}
                >
                    <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
                </aside>

                <main className={styles.dashboardMain}>
                    <h3 className={styles.welcomeText}>Welcome to Admin Dashboard</h3>
                    <MainContent /> {/* ✅ Added here */}
                </main>
            </div>
        </div>
    );
}
