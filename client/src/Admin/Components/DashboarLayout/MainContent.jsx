import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../Styles/DashboardLayout/MainContent.module.css";

export default function MainContent() {
    const [userCount, setUserCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user count from backend API
        fetch('http://localhost:5000/api/users/count')
            .then(res => res.json())
            .then(data => setUserCount(data.count))
            .catch(err => console.error('Error fetching user count:', err));
    }, []);

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-start">
                {/* Admin Options */}

                {/* 1. Total Users Card */}
                <div className="col-md-3 col-sm-8">
                    <div
                        className={`${styles.card} border-0 shadow-sm text-white`}
                        onClick={() => navigate("/admin-dashboard/view-users")}
                    >
                        <div className={`${styles.cardBody} d-flex align-items-center justify-content-between`}>
                            <div className={styles.iconWrapper}>
                                <i className="bi bi-people fs-3 text-light"></i>
                            </div>
                            <div className="text-end">
                                <h6 className="mb-1 text-light opacity-75">Total Users</h6>
                                <h2 className="fw-bold mb-0 text-white">{userCount}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add More Options */}
            </div>
        </div>
    );
}
