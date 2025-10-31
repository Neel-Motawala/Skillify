import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../Components/CourseDetail/Title";
import TestOption from "../Components/CourseDetail/TestOption";

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [courseName, setCourseName] = useState("");

    useEffect(() => {
        const fetchCourseName = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/course/${id}`);
                const data = await response.json();
                setCourseName(data.course_name || "Unknown Course");
            } catch (error) {
                console.error("Error fetching course:", error);
                setCourseName("Unknown Course");
            }
        };
        fetchCourseName();
    }, [id]);

    return (
        <div className="container mt-4">
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="card shadow-sm p-4">
                <Title courseId={id} />
                <TestOption courseId={id} courseName={courseName} />
            </div>
        </div>
    );
}
