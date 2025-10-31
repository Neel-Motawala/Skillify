import React from "react";
import { useParams, useLocation } from "react-router-dom";
import ViewQuestion from "../Components/ManageCourse/ViewQuestion";

export default function AddQuestions() {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const stage = queryParams.get("stage");
    const type = queryParams.get("type");

    return (
        <div>
            <ViewQuestion courseId={id} stage={stage} type={type} />
        </div>
    );
}
