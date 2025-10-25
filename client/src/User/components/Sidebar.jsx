import React, { useState, useEffect } from "react";
import "../Styles/sidebar.css";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Detect screen size change
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 320);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className={`sidebar ${isOpen ? "sidebar-expanded" : "sidebar-collapsed"} ${isMobile && !isOpen ? "sidebar-hidden" : ""
                }`}
        >
            {/* Toggle Button */}
            <button
                className={`toggle-btn btn btn-link ${isOpen ? "expanded" : "collapsed"}`}
                onClick={toggleSidebar}
            >
                <span className="icon-wrapper">
                    <i className={`bi ${isOpen ? "bi-x-lg" : "bi-list"}`}></i>
                </span>
            </button>


            {/* Sidebar Menu */}
            <ul className="nav flex-column">
                {[
                    { icon: "bi-speedometer2", label: "Overview", href: "#overview" },
                    { icon: "bi-graph-up", label: "Reports", href: "#reports" },
                    { icon: "bi-bar-chart-line", label: "Analytics", href: "#analytics" },
                    { icon: "bi-gear", label: "Settings", href: "#settings" },
                ].map((item) => (
                    <li key={item.label} className="nav-item mb-3 me-3">
                        <a href={item.href} className="nav-link d-flex align-items-center">
                            <i className={`bi ${item.icon} fs-4`}></i>
                            {isOpen && <span className="ms-2">{item.label}</span>}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
