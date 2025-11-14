import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../Styles/TestPage/CodeTestPage.module.css";

// ✅ Correct import path (must point to your hooks folder)
import useStrictTestMonitoring from "./hooks/useStrictTestMonitoring";

export default function CodeTestPage() {
    const { courseId, userTestId } = useParams();
    const navigate = useNavigate();

    const [stage, setStage] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [testMode, setTestMode] = useState(null);
    const [solveStatus, setSolveStatus] = useState({});
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [serverMsg, setServerMsg] = useState("");

    const [violations, setViolations] = useState(0);
    const [lastEvent, setLastEvent] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [aborted, setAborted] = useState(false);

    // ✅ Clean message list
    const violationMessages = {
        TAB_CHANGE: "You switched the tab",
        TAB_HIDDEN: "You left the test window",
        WINDOW_RESIZED: "You resized or split-screen",
        FULLSCREEN_EXIT: "You exited fullscreen mode",
        INSPECT_BLOCKED: "Inspecting the browser is blocked",
        RIGHT_CLICK_BLOCKED: "Right-click is disabled during the test",
    };

    // ✅ Format the violation
    const reportViolation = (code) => {
        const msg = violationMessages[code] || "Violation detected";
        setLastEvent(msg);
        setViolations((v) => v + 1);
        setShowWarning(true);
    };

    // ✅ Strict browser monitoring hook
    const { pauseChecking } = useStrictTestMonitoring({
        testMode,
        disabled: testMode !== "Attempt" || aborted || showWarning,
        onViolation: reportViolation,
    });



    // ✅ Auto-abort after violations
    useEffect(() => {
        if (testMode === "Attempt" && violations >= 3) {
            setAborted(true);
        }
    }, [violations, testMode]);



    // ✅ Fetch test + questions
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/user-test/test/${userTestId}`
                );

                const testStage = res.data?.stage;
                setStage(testStage);

                const testMode = res.data?.test_mode;
                setTestMode(testMode);

                let questionList = [];

                if (testStage) {
                    const qRes = await axios.get(
                        `http://localhost:5000/api/code/${courseId}/${testStage}`
                    );

                    questionList = qRes.data.questions || [];
                    setQuestions(questionList);
                }

                const codeRes = await axios.get(
                    `http://localhost:5000/api/results/user-code/${userTestId}`
                );

                const submissions = codeRes.data?.submissions || [];
                const map = {};

                submissions.forEach((s) => {
                    if (s.is_correct === 1) map[s.question_id] = true;
                });

                setSolveStatus(map);

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

    // ✅ Abort UI
    if (aborted) {
        return (
            <div className={styles.abortBackdrop}>
                <div className={styles.abortBox}>
                    <h2>Test Aborted</h2>
                    <p>Your test has been aborted due to the following reason:</p>
                    <p className={styles.abortReason}>{lastEvent}</p>

                    <button
                        className={styles.abortConfirmBtn}
                        onClick={() => navigate("/dashboard/activity", { replace: true })}
                    // onClick={() => navigate("/dashboard/activity")}
                    >
                        Confirm & Exit
                    </button>
                </div>
            </div>
        );
    }

    if (loading)
        return <p className={styles.loading}>Loading test data...</p>;

    return (
        <div className={styles.page}>

            {/* ✅ Strict Warning Popup */}
            {showWarning && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <h3>Warning</h3>
                        <p>{lastEvent}</p>
                        <button
                            className={styles.closeModalBtn}
                            onClick={() => setShowWarning(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <button className={styles.backBtn} onClick={() => {
                pauseChecking();
                navigate(`/dashboard/activity`, { replace: true });
                // navigate(`/dashboard/activity`);
            }}>
                <i className="bi bi-arrow-left"></i> Back
            </button>

            {/* Header */}
            <div className={styles.headerBox}>
                <h1 className={styles.pageTitle}>Code Assessment</h1>
                <p className={styles.meta}>
                    Course <strong>{courseId}</strong> |
                    Stage <strong>{stage}</strong> |
                    Test ID <strong>{userTestId}</strong> |
                    Test Mode <strong>{testMode}</strong>
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
                                    pauseChecking();
                                    if (solveStatus[q.id]) {
                                        navigate(`/dashboard/code/result/c/${courseId}/s/${stage}/ut/${userTestId}/q/${q.id}`, { replace: true });
                                    } else {
                                        navigate(`/dashboard/course/${courseId}/code/${userTestId}/q/${q.id}`, { replace: true });
                                    }
                                }}
                            >
                                <div className={styles.cardHeader}>
                                    <span className={styles.qBadge}>Que:</span>
                                    <h3 className={styles.cardTitle}>{q.question_title}</h3>

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

            {/* Completion Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Congratulation!</h2>

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

                                        setTimeout(() => {
                                            navigate("/dashboard/activity", { replace: true });
                                            // navigate("/dashboard/activity");
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
