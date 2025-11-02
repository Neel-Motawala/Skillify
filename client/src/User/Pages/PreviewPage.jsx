import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Styles/TestPage/PreviewPage.module.css";

export default function PreviewPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { userTestId, questions, answers } = state || {};

    const [editableAnswers, setEditableAnswers] = useState({ ...answers });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const handlePopState = (e) => {
            e.preventDefault();
            navigate("/dashboard/activity", { replace: true });
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate]);

    if (!questions || !answers) return <p>No data available</p>;

    const handleEdit = (qid, value) => {
        setEditableAnswers((prev) => ({ ...prev, [qid]: value }));
        setMessage("Answer updated successfully");
        setTimeout(() => setMessage(""), 2000);
    };

    const handleSubmit = async () => {
        const mcqData = [];
        const theoryData = [];

        questions.forEach((q) => {
            const ans = editableAnswers[q.id];
            if (q.type === "mcq") {
                mcqData.push({
                    user_test_id: userTestId,
                    question_id: q.id,
                    user_answer: ans,
                    answered_at: new Date().toISOString(),
                });
            } else if (q.type === "theory") {
                theoryData.push({
                    user_test_id: userTestId,
                    question_id: q.id,
                    user_answer: ans,
                    timestamp: new Date().toISOString(),
                });
            }
        });

        try {
            if (mcqData.length > 0)
                await axios.post("http://localhost:5000/api/user-response/mcq", mcqData);
            if (theoryData.length > 0)
                await axios.post("http://localhost:5000/api/user-theory-ans/process", theoryData);

            alert("Answers submitted successfully.");

            // Redirect to ViewResult page
            navigate(`/dashboard/course/${state?.courseId}/result/${userTestId}`, { replace: true });
        } catch (error) {
            console.error("Error submitting answers:", error);
            alert("Failed to submit answers. Check console for details.");
        }

    };

    return (
        <div className={styles.previewContainer}>
            <h2>Preview Your Answers</h2>
            <table className={styles.previewTable}>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Question</th>
                        <th>Your Answer</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map((q, idx) => (
                        <tr key={q.id}>
                            <td>{idx + 1}</td>
                            <td>{q.question}</td>
                            <td>
                                {q.type === "mcq" ? (
                                    <select
                                        className={styles.dropdown}
                                        value={editableAnswers[q.id] || ""}
                                        onChange={(e) => handleEdit(q.id, e.target.value)}
                                    >
                                        <option value="">Select answer</option>
                                        {q.options?.map((opt, i) => (
                                            <option key={i} value={opt.option_text}>
                                                {opt.option_text}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <textarea
                                        rows="3"
                                        className={styles.textarea}
                                        value={editableAnswers[q.id] || ""}
                                        onChange={(e) => handleEdit(q.id, e.target.value)}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {message && <p className={styles.successMessage}>{message}</p>}

            <button className={styles.submitButton} onClick={handleSubmit}>
                Submit Final Answers
            </button>
        </div>
    );
}
