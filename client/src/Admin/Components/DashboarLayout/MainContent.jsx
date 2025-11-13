import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/DashboardLayout/MainContent.module.css";

export default function MainContent() {
    const [userCount, setUserCount] = useState(0);
    const [courseCount, setCourseCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [usersRes, coursesRes] = await Promise.all([
                    fetch("http://localhost:5000/api/admin/users/count"),
                    fetch("http://localhost:5000/api/course/count"),
                ]);

                const usersData = await usersRes.json();
                const coursesData = await coursesRes.json();

                setUserCount(usersData.count || 0);
                setCourseCount(coursesData.count || 0);
            } catch (err) {
                console.error("Error fetching counts:", err);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="container-fluid py-4">
            {/* Row 1: Total Users + Manage Course */}
            <div className="row justify-content-start g-4 mb-3">
                {/* Total Users Card */}
                <div className="col-md-3 col-sm-8">
                    <div
                        className={`${styles.card} border-0 shadow-sm text-white`}
                        onClick={() => navigate("/admin-dashboard/view-users", { replace: true })}
                    >
                        <div
                            className={`${styles.cardBody} d-flex align-items-center justify-content-between`}
                        >
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

                {/* Manage Course Card */}
                <div className="col-md-3 col-sm-10">
                    <div
                        className={`${styles.card} border-0 shadow-sm text-white`}
                        onClick={() => navigate("/admin-dashboard/manage-courses", { replace: true })}
                    >
                        <div
                            className={`${styles.cardBody} d-flex align-items-center justify-content-between`}
                        >
                            <div className={styles.iconWrapper}>
                                <i className="bi bi-journal-bookmark fs-3 text-light"></i>
                            </div>
                            <div className="text-end">
                                <h6 className="mb-1 text-light opacity-75">Manage Course</h6>
                                <h2 className="fw-bold mb-0 text-white">{courseCount}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: User Tests */}
            <div className="row g-4">
                <div className="col-md-3 col-sm-6 col-lg-3">
                    <div
                        className={`${styles.card} border-0 shadow-sm text-white`}
                        style={{
                            background: "linear-gradient(135deg, #2a3b8e, #1e2749)",
                            height: "120px",
                        }}
                        onClick={() => navigate("/admin-dashboard/user-tests", { replace: true })}
                    >
                        <div
                            className={`${styles.cardBody} d-flex align-items-center justify-content-between`}
                        >
                            <div>
                                <h6 className="text-light opacity-75 mb-1">Admin Option</h6>
                                <h5 className="fw-bold text-white mb-0">User Tests</h5>
                            </div>
                            <i className="bi bi-clipboard-check fs-3 text-light opacity-75"></i>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6 col-lg-3">
                    <div
                        className={`${styles.card} border-0 shadow-sm text-white`}
                        style={{
                            background: "linear-gradient(135deg, #2a3b8e, #1e2749)",
                            height: "120px",
                        }}
                        onClick={() => navigate("/admin-dashboard/user-report", { replace: true })}
                    >
                        <div
                            className={`${styles.cardBody} d-flex align-items-center justify-content-between`}
                        >
                            <div>
                                <h6 className="text-light opacity-75 mb-1">Test</h6>
                                <h5 className="fw-bold text-white mb-0">Report</h5>
                            </div>
                            <i className="bi bi-clipboard-check fs-3 text-light opacity-75"></i>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6 col-lg-3">
                    <div
                        className={`${styles.card} border-0 shadow-sm text-white`}
                        style={{
                            background: "linear-gradient(135deg, #2a3b8e, #1e2749)",
                            height: "120px",
                        }}
                        onClick={() => navigate("/admin-dashboard/user-tests", { replace: true })}
                    >
                        <div
                            className={`${styles.cardBody} d-flex align-items-center justify-content-between`}
                        >
                            <div>
                                <h6 className="text-light opacity-75 mb-1">Test</h6>
                                <h5 className="fw-bold text-white mb-0">Analysis</h5>
                            </div>
                            <i className="bi bi-clipboard-check fs-3 text-light opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
