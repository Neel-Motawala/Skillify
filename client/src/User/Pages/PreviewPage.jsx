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
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // <- disable button

    useEffect(() => {
        const handlePopState = (e) => {
            e.preventDefault();
            navigate("/dashboard/activity", { replace: true });
            // navigate("/dashboard/activity");
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
        setIsSubmitting(true);     // disable button
        setLoading(true);          // show modal

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
            if (mcqData.length > 0) {
                await axios.post("http://localhost:5000/api/user-response/mcq", mcqData);
            }

            if (theoryData.length > 0) {
                await axios.post("http://localhost:5000/api/user-response/theory", theoryData);
            }

            setTimeout(() => {
                setLoading(false);
                navigate(`/dashboard/course/${state?.courseId}/result/${userTestId}`, {
                    replace: true,
                });
            }, 1000);

        } catch (error) {
            console.error("Error submitting answers:", error);
            setLoading(false);
            setIsSubmitting(false); // allow retry on failure
            alert("Failed to submit answers.");
        }
    };

    return (
        <div className={styles.previewContainer}>
            {/* Loading Modal */}
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingCard}>
                        <div className={styles.loader}></div>
                        <p>Please wait... Submitting your answers</p>
                    </div>
                </div>
            )}

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

            {/* Disable button & show loading text */}
            <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
            >
                {isSubmitting ? "Submitting..." : "Submit Final Answers"}
            </button>
        </div>
    );
}
