import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../Styles/Dashboard/MainContent.module.css";

export default function MainContent() {
    const [courseCards, setCourseCards] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/course");
                setCourseCards(res.data);
            } catch (err) {
                console.error("Error fetching courses:", err);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className={`${styles.mainContainer} container-fluid py-4`}>
            <div className="row g-4">
                {courseCards.length > 0 ? (
                    courseCards.map((course) => (
                        <div
                            key={course.id}
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12"
                        >
                            <div
                                className={`${styles.courseCard} card shadow-sm h-100`}
                                onClick={() => navigate(`/dashboard/course/${course.id}`)}
                            >
                                <div className="card-body d-flex align-items-center justify-content-between p-3">
                                    <div className="flex-grow-1 text-start">
                                        <h6 className={`${styles.courseTitle} mb-1 text-truncate`}>
                                            {course.course_name}
                                        </h6>
                                        <p className={`${styles.courseSubtitle} mb-0 small`}>
                                            View Details
                                        </p>
                                    </div>

                                    {course.image_url && (
                                        <div className={`${styles.courseImgWrapper} ms-3`}>
                                            <img
                                                src={`http://localhost:5000${course.image_url}`}
                                                alt={course.course_name}
                                                className={styles.courseImg}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted fs-5">No courses available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
