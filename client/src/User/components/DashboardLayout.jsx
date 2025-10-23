import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

export default function DashboardLayout() {
    const navigate = useNavigate();

    // Redirect if no user
    useEffect(() => {
        const storedUser = localStorage.getItem("userName");
        if (!storedUser) navigate("/login");
    }, [navigate]);

    // Logout handler
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
    };

    return (
        <>
            <div className="dashboard-layout d-flex flex-column vh-100">
                {/* Navbar at top */}
                <header>
                    <Navbar handleLogout={handleLogout} />
                </header>

                {/* Body: sidebar + main content */}
                <div
                    className="d-flex flex-grow-1"
                    style={{ minHeight: 'calc(100vh - 3.5rem)' }} // navbar height in rem
                >
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main Content */}
                    <main className="flex-grow-1 bg-light p-4">
                        <MainContent />
                    </main>
                </div>
            </div>
        </>
    );
}
