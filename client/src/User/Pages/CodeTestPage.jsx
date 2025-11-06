import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../Styles/TestPage/CodeTestPage.module.css";

export default function CodeTestPage() {
    const { courseId, userTestId } = useParams();
    const navigate = useNavigate();

    const [stage, setStage] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [solveStatus, setSolveStatus] = useState({});
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [serverMsg, setServerMsg] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get test details
                const res = await axios.get(
                    `http://localhost:5000/api/user-test/test/${userTestId}`
                );

                const testStage = res.data?.stage;
                setStage(testStage);

                // Get questions
                let questionList = [];
                if (testStage) {
                    const qRes = await axios.get(
                        `http://localhost:5000/api/code/${courseId}/${testStage}`
                    );
                    questionList = qRes.data.questions || [];
                    setQuestions(questionList);
                }

                // Get solved status
                const codeRes = await axios.get(
                    `http://localhost:5000/api/results/user-code/${userTestId}`
                );

                const submissions = codeRes.data?.submissions || [];
                const map = {};
                submissions.forEach((s) => {
                    if (s.is_correct === 1) {
                        map[s.question_id] = true;
                    }
                });

                setSolveStatus(map);

                // ✅ Check if ALL questions solved
                if (
                    questionList.length > 0 &&
                    Object.keys(map).length === questionList.length
                ) {
                    setShowModal(true);
                }
            } catch (err) {
                console.error("Error loading test:", err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && userTestId) fetchData();
    }, [courseId, userTestId]);

    if (loading)
        return <p className={styles.loading}>Loading test data...</p>;

    return (
        <div className={styles.page}>

            {/* Back Button */}
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i> Back
            </button>

            {/* Header */}
            <div className={styles.headerBox}>
                <h1 className={styles.pageTitle}>Code Assessment</h1>
                <p className={styles.meta}>
                    Course <strong>{courseId}</strong> |
                    Stage <strong>{stage}</strong> |
                    Test ID <strong>{userTestId}</strong>
                </p>
            </div>

            {/* Question List */}
            <div className={styles.questionWrapper}>
                <h2 className={styles.sectionTitle}>Questions</h2>

                {questions.length === 0 ? (
                    <p className={styles.noData}>No questions available for this stage.</p>
                ) : (
                    <div className={styles.cardList}>
                        {questions.map((q) => (
                            <div
                                key={q.id}
                                className={styles.card}
                                onClick={() => {
                                    if (solveStatus[q.id]) {
                                        navigate(
                                            `/dashboard/code/result/c/${courseId}/s/${stage}/ut/${userTestId}/q/${q.id}`
                                        );
                                    } else {
                                        navigate(
                                            `/dashboard/course/${courseId}/code/${userTestId}/q/${q.id}`
                                        );
                                    }
                                }}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.qBadge}>Que:</span>
                                    <h3 className={styles.cardTitle}>{q.question_title}</h3>

                                    {/* ✅ Solved badge */}
                                    {solveStatus[q.id] && (
                                        <span className={styles.solvedBadge}>Solved</span>
                                    )}
                                </div>

                                <p className={styles.cardDesc}>{q.question}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ✅ Completion Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Congratulation!</h2>

                        {/* Default message or server message */}
                        <p>{serverMsg || "You successfully completed all code questions."}</p>

                        {!serverMsg && (
                            <button
                                className={styles.continueBtn}
                                onClick={async () => {
                                    try {
                                        const res = await axios.post(
                                            `http://localhost:5000/api/code/test-complete/${userTestId}`
                                        );

                                        setServerMsg(res.data?.message || "Completed");

                                        // Keep modal visible for 2 seconds
                                        setTimeout(() => {
                                            navigate("/dashboard/activity");
                                        }, 2000);

                                    } catch (err) {
                                        console.error("Error completing test:", err);
                                    }
                                }}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
