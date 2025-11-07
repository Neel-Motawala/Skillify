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
                    fetch("http://localhost:5000/api/users/count"),
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
            <div className="row justify-content-start g-4">
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
                <div className="col-md-3 col-sm-8">
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
        </div>
    );
}
