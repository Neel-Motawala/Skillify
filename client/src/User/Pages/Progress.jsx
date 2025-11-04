import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/TestPage/MyProgress.module.css";

export default function Progress() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = localStorage.getItem("id");
                const { data } = await axios.get(
                    `http://localhost:5000/api/results/profile/${userId}`
                );
                setCourses(data.courses || []);
            } catch (err) {
                console.error("Error fetching progress:", err);
                setError("Unable to load progress data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!courses.length)
        return <div className={styles.error}>No progress records found.</div>;

    const avgProgress =
        courses.reduce((sum, c) => sum + c.progress_percent, 0) / courses.length;

    return (
        <div className={styles.fullContainer}>
            {/* Header */}
            <div className={styles.headerBar}>
                <button className={styles.backButton} onClick={() => navigate("/")}>
                    ← Back
                </button>
                <h2 className={styles.title}>My Progress</h2>
            </div>

            {/* Course Progress Cards */}
            <div className={styles.progressGrid}>
                {courses.map((course) => (
                    <div key={course.course_id} className={styles.progressCard}>
                        <div className={styles.courseHeader}>
                            <div className={styles.courseInfo}>
                                <img
                                    src={`http://localhost:5000${course.image_url}`}
                                    alt={course.course_name}
                                    className={styles.courseImage}
                                />
                                <span className={styles.courseName}>
                                    {course.course_name}
                                </span>
                            </div>
                            <span className={styles.percentText}>
                                {course.progress_percent}%
                            </span>
                        </div>

                        <div className={styles.progressBarOuter}>
                            <div
                                className={styles.progressBarFill}
                                style={{
                                    width: `${course.progress_percent}%`,
                                }}
                            ></div>
                        </div>

                        <div className={styles.statsRow}>
                            <span>Questions: {course.total_questions}</span>
                            <span>Attempted: {course.attempted_questions}</span>
                            <span>Stages: {course.completed_stages}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overall Progress */}
            <div className={styles.avgProgressBox}>
                <h4>Overall Progress</h4>
                <div className={styles.progressBarOuter}>
                    <div
                        className={styles.avgProgressFill}
                        style={{
                            width: `${avgProgress.toFixed(1)}%`,
                        }}
                    ></div>
                </div>
                <p className={styles.avgProgressText}>{avgProgress.toFixed(1)}%</p>
            </div>
        </div>
    );
}
