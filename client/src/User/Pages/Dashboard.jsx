import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Dashboard/Navbar";
import Sidebar from "../Components/Dashboard/Sidebar";
import MainContent from "../Components/Dashboard/MainContent";
import styles from "../Styles/Dashboard/DashboardLayout.module.css";

export default function DashboardLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("role");
        if (!storedUser) navigate("/login", { replace: true });
    }, [navigate]);

    return (
        <div className={styles.dashboardLayout}>
            <header className={styles.dashboardHeader}>
                <Navbar />
            </header>

            <div className={styles.dashboardBody}>
                <aside className={styles.dashboardSidebar}>
                    <Sidebar />
                </aside>

                <main className={styles.dashboardMain}>
                    <MainContent />
                </main>
            </div>
        </div>
    );
}
