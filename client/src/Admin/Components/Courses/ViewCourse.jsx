import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../Styles/Courses/ViewCourse.module.css";

export default function ManageCourse() {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/course");
                setCourses(res.data);
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className={styles.pageContainer}>
            {/* Header Section */}
            <div className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={() => navigate("/admin-dashboard", { replace: true })}
                >
                    <i className="bi bi-arrow-left"></i> Back
                </button>
                <h1 className={styles.pageTitle}>
                    <i className="bi bi-journal-bookmark me-2"></i>
                    Course Management
                </h1>
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <p className={styles.noData}>No courses available.</p>
            ) : (
                <div className={styles.gridContainer}>
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className={styles.card}
                            onClick={() =>
                                navigate(`/admin-dashboard/manage-courses/${course.id}`, {
                                    replace: true,
                                })
                            }
                        >
                            {course.image_url && (
                                <div className={styles.imageWrapper}>
                                    <object
                                        data={`http://localhost:5000${course.image_url}`}
                                        type="image/svg+xml"
                                        aria-label={course.course_name}
                                        className={styles.svgImage}
                                    >
                                        <img
                                            src={`http://localhost:5000${course.image_url}`}
                                            alt={course.course_name}
                                            className={styles.fallbackImage}
                                        />
                                    </object>
                                </div>
                            )}

                            <div className={styles.cardBody}>
                                <h5 className={styles.courseTitle}>{course.course_name}</h5>
                                <p className={styles.courseDesc}>
                                    {course.course_desc?.slice(0, 90) || "No description available"}…
                                </p>
                                <button
                                    className={styles.viewBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                            `/admin-dashboard/manage-courses/${course.id}`,
                                            { replace: true }
                                        );
                                    }}
                                >
                                    Manage
                                    <i className="bi bi-arrow-right-short ms-1"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
