import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import "../Styles/dashboardLayout.css";

export default function DashboardLayout() {
    const navigate = useNavigate();

    // Redirect if no user
    useEffect(() => {
        const storedUser = localStorage.getItem("userName");
        if (!storedUser) navigate("/login");
    }, [navigate]);

    return (
        <div className="dashboard-layout">
            <header className="dashboard-header">
                <Navbar />
            </header>

            <div className="dashboard-body">
                <aside className="dashboard-sidebar">
                    <Sidebar />
                </aside>

                <main className="dashboard-main">
                    <MainContent />
                </main>
            </div>
        </div>
    );
}
