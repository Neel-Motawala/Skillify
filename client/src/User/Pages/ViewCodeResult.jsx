import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Styles/TestPage/ViewCodeResult.module.css";

export default function ViewCodeResult() {
    const { id, codeTestId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/user-test/code-result/${id}/ut/${codeTestId}`
                );
                setData(res.data);
            } catch (err) {
                console.error("Error fetching code result:", err);
                setError("Failed to load results");
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id, codeTestId]);

    if (loading) return <p className={styles.loading}>Loading result...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!data) return <p className={styles.noData}>No result data available.</p>;

    const { test, submissions } = data;

    const courseName =
        submissions?.[0]?.code_language?.toUpperCase() || "UNKNOWN";

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate("/dashboard/activity")}>
                    ← Back
                </button>
                <h2 className={styles.pageTitle}>Code Test Result</h2>
            </div>

            {/* Test Info */}
            {test && (
                <div className={styles.testInfo}>
                    <h3 className={styles.sectionTitle}>Test Details</h3>
                    <div className={styles.infoGrid}>
                        <p><strong>Course:</strong> {courseName}</p>
                        <p><strong>Stage:</strong> {test.stage}</p>
                        <p><strong>Mode:</strong> {test.test_mode}</p>
                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(test.timestamp).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>
                    </div>
                </div>
            )}

            {/* Submissions */}
            {submissions && submissions.length > 0 ? (
                <div className={styles.submissionSection}>
                    <h3 className={styles.sectionTitle}>Submitted Questions</h3>

                    {submissions.map((sub, index) => (
                        <div key={sub.id} className={styles.card}>

                            {/* Header */}
                            <div className={styles.cardHeader}>
                                <h4 className={styles.questionTitle}>
                                    {index + 1}. {sub.question_title || "Untitled Question"}
                                </h4>

                                <span
                                    className={`${styles.statusBadge} ${sub.is_correct ? styles.correct : styles.incorrect
                                        }`}
                                >
                                    {sub.is_correct ? "Correct" : "Incorrect"}
                                </span>
                            </div>

                            {/* Question */}
                            <p className={styles.questionText}>
                                {sub.question || "No description available."}
                            </p>

                            {/* Meta */}
                            <div className={styles.meta}>
                                <p>
                                    <strong>Language:</strong>{" "}
                                    {sub.code_language?.toUpperCase()}
                                </p>
                                <p>
                                    <strong>Runtime:</strong>{" "}
                                    {sub.runtime_ms ?? 0} ms
                                </p>
                                <p>
                                    <strong>Memory Used:</strong>{" "}
                                    {sub.memory_kb ?? 0} KB
                                </p>
                                <p>
                                    <strong>Submitted:</strong>{" "}
                                    {new Date(sub.timestamp).toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </p>
                            </div>

                            {/* Code */}
                            <details className={styles.details}>
                                <summary>View Code</summary>
                                <pre className={styles.codeBlock}>{sub.user_code}</pre>
                            </details>

                        </div>
                    ))}
                </div>
            ) : (
                <p className={styles.noData}>No code submissions found.</p>
            )}
        </div>
    );
}
