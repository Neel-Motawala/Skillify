import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Styles/TestPage/MyActivity.module.css";

export default function MyActivity() {
    const [groupedTests, setGroupedTests] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const userId = localStorage.getItem("id");
                const res = await axios.get(`http://localhost:5000/api/user-test/user/${userId}`);

                const sorted = (res.data || []).sort(
                    (a, b) => new Date(b.test_created_at) - new Date(a.test_created_at)
                );

                const grouped = sorted.reduce((acc, test) => {
                    const date = new Date(test.test_created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
                    (acc[date] ||= []).push(test);
                    return acc;
                }, {});

                setGroupedTests(grouped);
            } catch (err) {
                console.error("Error fetching user tests:", err);
            }
        };

        fetchTests();
    }, []);

    const handleAction = (test) => {
        const type = test.test_type?.toLowerCase();
        const course = test.course_id;
        const id = test.id;
        const status = test.latest_status;

        // ✅ CODE TEST LOGIC
        if (type === "code") {
            if (status === "in_progress") {
                // Continue Code Test
                if (window.confirm("Do you want to continue your test?")) {
                    navigate(`/dashboard/course/${course}/code/${id}`, { replace: true });
                }
            } else if (status === "complete") {
                // Show Code Result Page (if you have one)
                navigate(`/dashboard/course/${course}/code/${id}/result`, { replace: true });
            } else if (status === "abort") {
                (window.confirm("This test was aborted! You can not view results"))
            } else {
                // Start New Code Test
                navigate(`/dashboard/course/${course}/code/${id}`, { replace: true });
            }
            return;
        }

        // ✅ MCQ / THEORY LOGIC
        switch (status) {
            case "in_progress":
                if (window.confirm("Do you want to continue your test?")) {
                    navigate(`/dashboard/course/${course}/test/${id}`, { replace: true });
                }
                break;

            case "complete":
                navigate(`/dashboard/course/${course}/result/${id}`, { replace: true });
                break;

            case "abort":
                (window.confirm("This test was aborted! You can not view results"))
                break;

            default:
                navigate(`/dashboard/course/${course}/test/${id}`, { replace: true });
        }
    };


    const dates = Object.keys(groupedTests);

    return (
        <div className={styles.activityContainer}>
            <div className={styles.headerRow}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate("/", { replace: true })}
                >
                    ← Back
                </button>
                <div className={styles.centerBlock}>
                    <span className={styles.testCount}>
                        Total Tests: {dates.reduce((sum, d) => sum + groupedTests[d].length, 0)}
                    </span>
                    <h2 className={styles.title}>My Activity</h2>
                </div>
            </div>


            {dates.length === 0 ? (
                <p className={styles.noData}>No test records found.</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.testTable}>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Type</th>
                                <th>Stage</th>
                                <th>Mode</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dates.map((date) => (
                                <React.Fragment key={date}>
                                    <tr>
                                        <td colSpan="7" className={styles.dateRow}>
                                            {date === new Date().toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                                ? "Today"
                                                : date}
                                        </td>
                                    </tr>

                                    {groupedTests[date].map((test) => (
                                        <tr
                                            key={test.id}
                                            className={styles.testRow}
                                            onClick={() => handleAction(test)}
                                        >
                                            <td>{test.course_name}</td>

                                            <td className={styles.typeText}>
                                                {test.test_type.toUpperCase()}
                                            </td>

                                            <td>{test.stage}</td>
                                            <td>{test.test_mode}</td>

                                            <td>{new Date(test.test_created_at).toLocaleString()}</td>

                                            <td>
                                                {test.end_time
                                                    ? new Date(test.end_time).toLocaleString()
                                                    : "Still Active"}
                                            </td>

                                            <td>
                                                <span
                                                    className={`${styles.statusBadge} ${test.latest_status === "complete"
                                                        ? styles.completed
                                                        : test.latest_status === "abort"
                                                            ? styles.aborted
                                                            : styles.inProgress
                                                        }`}
                                                >
                                                    {test.latest_status === "complete"
                                                        ? "Completed"
                                                        : test.latest_status === "abort"
                                                            ? "Test Aborted"
                                                            : "Continue Test"}
                                                </span>
                                            </td>

                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
