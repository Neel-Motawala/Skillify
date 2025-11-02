import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Styles/MyActivity.module.css";

export default function MyActivity() {
    const [tests, setTests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const userId = localStorage.getItem("id");
                const res = await axios.get(`http://localhost:5000/api/user-test/user/${userId}`);
                setTests(res.data || []);
            } catch (err) {
                console.error("Error fetching user tests:", err);
            }
        };
        fetchTests();
    }, []);

    const handleAction = (test) => {
        switch (test.latest_status) {
            case "in_progress":
                const confirmContinue = window.confirm("Do you want to continue your test?");
                if (confirmContinue) {
                    navigate(`/dashboard/course/${test.course_id}/test/${test.id}`);
                }
                break;
            case "complete":
                navigate(`/dashboard/course/${test.course_id}/result/${test.id}`);
                break;
            default:
                navigate(`/dashboard/course/${test.course_id}/test/${test.id}`);
                break;
        }
    };

    return (
        <div className={`${styles.activityContainer} container-fluid py-4`}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <button
                    className={styles.backButton}
                    onClick={() => navigate("/", { replace: true })}
                >
                    <i className="bi bi-arrow-left me-2"></i> Back
                </button>
                <h4 className="fw-semibold m-0">My Activity</h4>
                <span className={styles.testCount}>
                    Total Tests: {tests.length}
                </span>
            </div>

            {tests.length === 0 ? (
                <p className="text-muted text-center mt-5">No test records found.</p>
            ) : (
                <div className="row g-4">
                    {tests.map((test) => (
                        <div
                            key={test.id}
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12"
                        >
                            <div
                                className={`${styles.testCard} card h-100 shadow-sm border-0`}
                                onClick={() => handleAction(test)}
                            >
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div>
                                        <h6 className="fw-bold mb-2 text-truncate text-primary">
                                            {test.test_type.toUpperCase()} Test
                                        </h6>
                                        <p className="text-muted mb-1 small">
                                            Mode: {test.test_mode}
                                        </p>
                                        <p className="text-muted mb-1 small">
                                            Stage: {test.stage}
                                        </p>
                                        <p className="text-muted mb-1 small">
                                            Started: {new Date(test.timestamp).toLocaleString()}
                                        </p>
                                        <p className="text-muted mb-2 small">
                                            {test.end_time
                                                ? `Ended: ${new Date(test.end_time).toLocaleString()}`
                                                : "Still Active"}
                                        </p>
                                    </div>

                                    <div className="mt-2">
                                        <div className={styles.statusRow}>
                                            <span
                                                className={`${styles.statusBadge} ${test.latest_status === "complete"
                                                    ? styles.completed
                                                    : styles.inProgress
                                                    }`}
                                            >
                                                {test.latest_status === "complete"
                                                    ? "Completed"
                                                    : "Continue Test"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
