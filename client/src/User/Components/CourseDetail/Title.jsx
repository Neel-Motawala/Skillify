import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../Styles/CourseDetail/title.module.css";
import { useNavigate } from "react-router-dom";

export default function Title({ courseId }) {
    const [course, setCourse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/course/${courseId}`);
                setCourse(response.data);
            } catch (error) {
                console.error("Error fetching course:", error);
            }
        };

        if (courseId) fetchCourse();
    }, [courseId]);

    if (!course) return <p>Loading course details...</p>;

    return (
        <div className={styles.titleContainer}>
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>
            <h2 className={styles.courseTitle}>{course.course_name}</h2>
            <p className={styles.courseDescription}>{course.course_desc}</p>
        </div>
    );
}
