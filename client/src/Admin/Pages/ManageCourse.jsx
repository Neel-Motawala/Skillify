import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CourseOption from "../Components/ManageCourse/CourseOption";

export default function ManageCourse() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/course/${id}`);
                setCourse(res.data);
            } catch (err) {
                console.error("Error fetching course detail:", err);
            }
        };

        if (id) fetchCourse();
    }, [id]);

    return (
        <div>
            {course ? (
                <CourseOption courseId={id} courseName={course.course_name} />
            ) : (
                <p style={{ textAlign: "center", marginTop: "2rem", color: "#666" }}>
                    Loading course details...
                </p>
            )}
        </div>
    );
}
