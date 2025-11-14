import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../Styles/Users/ViewUserResult.module.css";

export default function ViewUserResult() {
    const { userId, userTestId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/admin/users/user-tests/${userId}/result/${userTestId}`
                );
                setData(res.data);
            } catch (err) {
                console.error("Error loading results:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId, userTestId]);

    if (loading) return <p className={styles.loading}>Loading...</p>;
    if (!data) return <p>No result found</p>;

    const { test, logs, mcq, theory, code } = data;

    const lastStatus = logs?.length ? logs[logs.length - 1].status : null;

    const isAborted = lastStatus === "abort";

    return (
        <div className={styles.page}>

            {/* Back Button */}
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                ← Back
            </button>

            {/* TITLE */}
            <h1 className={styles.pageTitle}>User Test Result</h1>
            <h2 className={styles.courseName}>{test.course_name.toUpperCase()}</h2>

            {/* Heading Row */}
            <div className={styles.headingRow}>
                <h3 className={styles.leftHeading}>User Answers</h3>
                <h3 className={styles.rightHeading}>Test Details & Timeline</h3>
            </div>

            <div className={styles.layout}>

                {/* LEFT SIDE — ANSWERS */}
                <div className={styles.leftPane}>

                    {/* MCQ */}
                    {mcq.answers.length > 0 && (
                        <div className={styles.block}>
                            <h3 className={styles.blockTitle}>MCQ Answers</h3>
                            {mcq.answers.map((ans, i) => {
                                const q = mcq.questions.find(q => q.id === ans.question_id);
                                return (
                                    <div className={styles.questionCard} key={i}>
                                        <h4>{q?.question}</h4>
                                        <p><strong>Your Answer:</strong> {ans.user_answer}</p>
                                        <p><strong>Correct:</strong> {ans.is_correct ? "Yes" : "No"}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* THEORY */}
                    {theory.answers.length > 0 && (
                        <div className={styles.block}>
                            <h3 className={styles.blockTitle}>Theory Answers</h3>
                            {theory.answers.map((ans, i) => {
                                const q = theory.questions.find(q => q.id === ans.question_id);
                                return (
                                    <div key={i} className={styles.questionCard}>
                                        <h4>{q?.question}</h4>
                                        <p><strong>Your Answer:</strong></p>
                                        <p className={styles.answerBox}>{ans.user_answer}</p>
                                        <p><strong>Score:</strong> {ans.answer_score}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* CODE */}
                    {code.answers.length > 0 && (
                        <div className={styles.block}>
                            <h3 className={styles.blockTitle}>Code Answers</h3>
                            {code.answers.map((ans, i) => {
                                const q = code.questions.find(q => q.id === ans.question_id);
                                return (
                                    <div key={i} className={styles.questionCard}>
                                        <h4>{q?.question_title}</h4>
                                        <p>{q?.question}</p>

                                        <details>
                                            <summary className={styles.codeSummary}>View Submitted Code</summary>
                                            <pre className={styles.codeBlock}>{ans.user_code}</pre>
                                        </details>

                                        <p><strong>Correct:</strong> {ans.is_correct ? "Yes" : "No"}</p>
                                        <p><strong>Runtime:</strong> {ans.runtime_ms}ms</p>
                                        <p><strong>Memory:</strong> {ans.memory_kb} KB</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE — TEST DETAILS & TIMELINE */}
                <div className={styles.rightPane}>

                    {/* Test Info */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>Test Details</h2>
                        <p><strong>Course:</strong> {test.course_name}</p>
                        <p><strong>Stage:</strong> {test.stage}</p>
                        <p><strong>Type:</strong> {test.test_type}</p>
                        <p><strong>Mode:</strong> {test.test_mode}</p>
                        <p><strong>Date:</strong> {new Date(test.timestamp).toLocaleString()}</p>
                    </div>

                    {/* Timeline */}
                    <div className={styles.card}>
                        <h2 className={styles.sectionTitle}>Activity Timeline</h2>

                        <div className={styles.timeline}>
                            {logs.map((log, i) => (
                                <div key={i} className={styles.timelineItem}>
                                    <div className={styles.dot}></div>
                                    <div>
                                        <p className={styles.timelineStatus}>{log.status}</p>
                                        <p className={styles.statusDetail}>{log.status_detail}</p>
                                        <span className={styles.timestamp}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
