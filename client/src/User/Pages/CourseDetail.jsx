import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TestOption from "../Components/CourseDetail/TestOption";

export default function CourseDetail() {
    const { id } = useParams();
    const [courseName, setCourseName] = useState("");

    useEffect(() => {
        const fetchCourseName = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/course/${id}`);
                const data = await response.json();
                setCourseName(data?.course_name || "Unknown Course");
            } catch (error) {
                console.error("Error fetching course:", error);
                setCourseName("Unknown Course");
            }
        };
        if (id) fetchCourseName();
    }, [id]);

    return (
        <div className="card shadow-sm p-4" style={{ minHeight: "100vh" }}>
            <TestOption courseId={id} courseName={courseName} />
        </div>
    );
}
