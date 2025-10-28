import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../Components/CourseDetail/Title";

export default function CourseDetail() {
    const { CId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="container mt-4">
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="card shadow-sm p-4">
                <Title courseId={CId} />
            </div>
        </div>
    );
}
