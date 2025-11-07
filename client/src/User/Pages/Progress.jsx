import React, { useState, useEffect } from "react";
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

                // ✅ Fetch MCQ/Theory progress
                const profileRes = await axios.get(
                    `http://localhost:5000/api/results/profile/${userId}`
                );
                const baseCourses = profileRes.data.courses || [];

                // ✅ Fetch Coding submissions of all tests
                const codeRes = await axios.get(
                    `http://localhost:5000/api/results/user-code/all/${userId}`
                );
                const codingData = codeRes.data || [];

                // ✅ Group coding submissions by course_id
                const codingMap = {}; // { courseId: { solved, total } }

                codingData.forEach((record) => {
                    const cid = record.test.course_id;

                    if (!codingMap[cid]) {
                        codingMap[cid] = { solved: 0, total: 0 };
                    }

                    const solved =
                        record.submissions.length > 0 &&
                        record.submissions[0].is_correct === 1;

                    codingMap[cid].total += 1;
                    if (solved) codingMap[cid].solved += 1;
                });

                // ✅ Merge MCQ/Theory + Coding into final course object
                const mergedCourses = baseCourses.map((course) => {
                    const codeStats = codingMap[course.course_id] || {
                        solved: 0,
                        total: 0,
                    };

                    const codePercent =
                        codeStats.total > 0
                            ? Math.round((codeStats.solved / codeStats.total) * 100)
                            : 0;

                    // ✅ final progress calculation (equal weighting MCQ+Theory & Code)
                    const finalProgress = Math.round(
                        (course.progress_percent + codePercent) / 2
                    );

                    return {
                        ...course,
                        code_solved: codeStats.solved,
                        code_total: codeStats.total,
                        code_progress_percent: codePercent,
                        final_progress_percent: finalProgress,
                    };
                });

                setCourses(mergedCourses);
            } catch (err) {
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

    // ✅ Calculate overall average progress across all courses
    const avgProgress =
        courses.reduce((sum, c) => sum + c.final_progress_percent, 0) /
        courses.length;

    return (
        <div className={styles.fullContainer}>

            {/* Header */}
            <div className={styles.headerBar}>
                <button className={styles.backButton} onClick={() => navigate("/", { replace: true })}>
                    ← Back
                </button>
                <h2 className={styles.title}>My Progress</h2>
            </div>

            {/* ✅ Overall Progress Section (Bigger and on top) */}
            <div className={styles.overallSection}>
                <h3 className={styles.overallTitle}>Overall Progress</h3>

                <div className={styles.overallBarOuter}>
                    <div
                        className={styles.overallBarFill}
                        style={{ width: `${avgProgress.toFixed(1)}%` }}
                    ></div>
                </div>

                <p className={styles.overallPercent}>{avgProgress.toFixed(1)}%</p>
            </div>

            {/* ✅ Two-column Course Cards */}
            <div className={styles.courseGrid}>
                {courses.map((course) => (
                    <div key={course.course_id} className={styles.courseCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardInfo}>
                                <img
                                    src={`http://localhost:5000${course.image_url}`}
                                    alt={course.course_name}
                                    className={styles.cardImage}
                                />
                                <span className={styles.cardName}>
                                    {course.course_name}
                                </span>
                            </div>

                            <span className={styles.cardPercent}>
                                {course.final_progress_percent}%
                            </span>
                        </div>

                        <div className={styles.progressBarOuter}>
                            <div
                                className={styles.progressBarFill}
                                style={{
                                    width: `${course.final_progress_percent}%`,
                                }}
                            ></div>
                        </div>

                        <div className={styles.cardStats}>
                            <span>MCQ/Theory: {course.progress_percent}%</span>
                            <span>Code: {course.code_progress_percent}%</span>
                            <span>Stages: {course.completed_stages}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}
