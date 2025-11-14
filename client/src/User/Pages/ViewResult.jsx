import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Styles/TestPage/ViewResult.module.css";

export default function ViewResult() {
    const { userTestId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const handlePopState = (e) => {
            e.preventDefault();
            navigate("/dashboard/activity", { replace: true });
            // navigate("/dashboard/activity");
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/results/${userTestId}`);
                setResults(res.data || []);
            } catch (err) {
                console.error("Error fetching results:", err);
                setError("Failed to load results.");
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [userTestId]);

    if (loading) return <p className={styles.loading}>Loading results...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (results.length === 0) return <p className={styles.noData}>No results available.</p>;

    return (
        <div className={styles.resultContainer}>
            <div className={styles.header}>
                <h2 className={styles.heading}>Test Result Summary</h2>
                <button
                    className={styles.backButton}
                    onClick={() => navigate("/dashboard/activity", { replace: true })}
                // onClick={() => navigate("/dashboard/activity")}
                >
                    ← Back
                </button>
            </div>

            <table className={styles.resultTable}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Your Answer</th>
                        <th>Correct Answer</th>
                        <th style={{ width: "160px" }}>Result</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, idx) => (
                        <tr key={r?.question_id || idx}>
                            <td>{idx + 1}</td>
                            <td className={styles.question}>{r?.question || "—"}</td>
                            <td>{r?.user_answer || "—"}</td>
                            <td>{r?.correct_answer || "—"}</td>
                            <td
                                className={
                                    r?.type === "mcq"
                                        ? r?.is_correct
                                            ? styles.correctCell
                                            : styles.wrongCell
                                        : r?.answer_score < 5
                                            ? styles.redCell
                                            : r?.answer_score < 8
                                                ? styles.yellowCell
                                                : styles.greenCell
                                }
                            >
                                {r?.type === "mcq" ? (
                                    r?.is_correct ? "Correct" : "Incorrect"
                                ) : (
                                    r?.answer_score !== null
                                        ? `${r.answer_score.toFixed(1)} / 10`
                                        : "—"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
