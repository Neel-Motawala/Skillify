import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/TestPage/UserTest.module.css";

export default function UserTest({ userId, courseId, testType, stage, testMode, userTestId }) {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);

    // strict-check states
    const [violations, setViolations] = useState(0);
    const [lastEvent, setLastEvent] = useState("");
    const [showWarning, setShowWarning] = useState(false);
    const [aborted, setAborted] = useState(false);

    const navigate = useNavigate();

    // ==================================================
    // Fetch Questions
    // ==================================================
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/questions/${courseId}/questions`,
                    { params: { type: testType, stage } }
                );
                setQuestions(res.data.questions || []);
            } catch (err) {
                console.error("Error fetching questions:", err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && testType && stage) fetchQuestions();
    }, [courseId, testType, stage]);

    // ==================================================
    // Strict Checking
    // ==================================================

    // Custom messages
    const violationMessages = {
        TAB_CHANGE: "You switched the tab",
        TAB_HIDDEN: "You left the test window",
        WINDOW_RESIZED: "You resized or split the screen",
        FULLSCREEN_EXIT: "You exited fullscreen mode",
        INSPECT_BLOCKED: "Inspecting browser elements is not allowed",
        RIGHT_CLICK_BLOCKED: "Right-click or Inspecting Browser is disabled during the test",
    };

    // Report violation with custom message
    const reportViolation = (code) => {
        const msg = violationMessages[code] || "Violation detected";
        setLastEvent(msg);
        setViolations((v) => v + 1);
        setShowWarning(true);
    };

    // =========================================
    // Strict Checking (single combined effect)
    // =========================================
    useEffect(() => {
        if (testMode !== "Attempt") return;

        // Events
        const canCheck = () => !showWarning && !aborted;

        const onBlur = () => {
            if (!canCheck()) return;
            reportViolation("TAB_CHANGE");
        };

        const onHidden = () => {
            if (!canCheck()) return;
            if (document.hidden) reportViolation("TAB_HIDDEN");
        };

        const onResize = () => {
            if (!canCheck()) return;
            if (window.innerWidth < 900 || window.innerHeight < 600)
                reportViolation("WINDOW_RESIZED");
        };


        const onFullscreenExit = () => {
            if (!canCheck()) return;
            reportViolation("FULLSCREEN_EXIT");
        };


        const onRightClick = (e) => {
            if (!canCheck()) return;
            e.preventDefault();
            reportViolation("RIGHT_CLICK_BLOCKED");
        };


        const onKeyInspect = (e) => {
            if (!canCheck()) return;

            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
                (e.ctrlKey && e.key === "U")
            ) {
                e.preventDefault();
                reportViolation("INSPECT_BLOCKED");
            }
        };


        // Attach listeners
        window.addEventListener("blur", onBlur);
        document.addEventListener("visibilitychange", onHidden);
        window.addEventListener("resize", onResize);
        document.addEventListener("fullscreenchange", onFullscreenExit);
        document.addEventListener("contextmenu", onRightClick);
        window.addEventListener("keydown", onKeyInspect);

        // Cleanup
        return () => {
            window.removeEventListener("blur", onBlur);
            document.removeEventListener("visibilitychange", onHidden);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("fullscreenchange", onFullscreenExit);
            document.removeEventListener("contextmenu", onRightClick);
            window.removeEventListener("keydown", onKeyInspect);
        };
    }, [testMode]);

    // =========================================
    // Auto abort logic (keep as is)
    // =========================================
    useEffect(() => {
        if (testMode === "Attempt" && violations >= 3) {
            setAborted(true);
        }
    }, [violations, testMode]);


    // ==================================================
    // Abort Screen
    // ==================================================
    if (aborted) {
        const handleAbortConfirm = async () => {
            try {
                await axios.post(
                    `http://localhost:5000/api/results/test-aborted/${userTestId}`,
                    {
                        status: "abort",
                        status_detail: lastEvent,
                    }
                );
            } catch (err) {
                console.error("Abort log error:", err);
            }

            navigate("/dashboard/activity", { replace: true });
        };

        return (
            <div className={styles.abortBackdrop}>
                <div className={styles.abortBox}>
                    <h2>Test Aborted</h2>
                    <p>Your test has been aborted due to the following reason:</p>
                    <p className={styles.abortReason}>{lastEvent}</p>

                    <button
                        className={styles.abortConfirmBtn}
                        onClick={handleAbortConfirm}
                    >
                        Confirm & Exit
                    </button>
                </div>
            </div>
        );
    }


    // ==================================================
    // Handlers
    // ==================================================
    const handleSelectOption = (qid, optionText) => {
        setAnswers((prev) => ({ ...prev, [qid]: optionText }));
    };

    const handleTextAnswer = (qid, value) => {
        setAnswers((prev) => ({ ...prev, [qid]: value }));
    };

    const handleFinish = () => {
        const finalAnswers = { ...answers };
        questions.forEach((q) => {
            if (!(q.id in finalAnswers)) finalAnswers[q.id] = null;
        });

        navigate(`/dashboard/course/${courseId}/test/${userTestId}/preview`, {
            state: { questions, answers: finalAnswers, testType, userTestId }, replace: true
        });
    };

    const handleQuit = () => {
        if (window.confirm("Are you sure you want to quit?"))
            navigate("/dashboard/activity", { replace: true });
    };

    // ==================================================
    // Loading
    // ==================================================
    if (loading) return <p className={styles.loading}>Loading questions...</p>;
    if (questions.length === 0)
        return <p className={styles.noData}>No questions found for this test.</p>;

    const q = questions[currentIndex];
    const userAnswer = answers[q.id] || "";

    // ==================================================
    // UI
    // ==================================================
    return (
        <div>

            {/* Warning Modal */}
            {showWarning && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <h3>Warning</h3>
                        <p>{lastEvent} detected. Please follow test rules.</p>
                        <button
                            onClick={() => setShowWarning(false)}
                            className={styles.closeModalBtn}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.testTitle}>
                            {testType.toUpperCase()} Test — Stage {stage}
                        </h2>
                        <p className={styles.subHeader}>
                            <strong>Mode:</strong> {testMode} |{" "}
                            <strong>Question:</strong> {currentIndex + 1} / {questions.length}
                        </p>
                    </div>

                    <button className={styles.quitButton} onClick={handleQuit}>
                        Quit
                    </button>
                </div>

                {/* Question */}
                <div className={styles.questionCard}>
                    <h4 className={styles.questionText}>{q.question}</h4>

                    {/* MCQ */}
                    {testType === "mcq" && q.options && (
                        <div className={styles.optionList}>
                            {q.options.map((opt, idx) => (
                                <label key={idx} className={styles.optionItem}>
                                    <input
                                        type="radio"
                                        name={`q_${q.id}`}
                                        value={opt.option_text}
                                        checked={userAnswer === opt.option_text}
                                        onChange={() => handleSelectOption(q.id, opt.option_text)}
                                        className={styles.radioInput}
                                    />
                                    <span className={styles.optionLabel}>{opt.option_text}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Theory + Code */}
                    {(testType === "theory" || testType === "code") && (
                        <textarea
                            className={styles.textArea}
                            rows="5"
                            placeholder="Type your answer here..."
                            value={userAnswer}
                            onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                        />
                    )}
                </div>

                {/* Navigation */}
                <div className={styles.navigation}>
                    <button
                        className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ""}`}
                        onClick={() => currentIndex > 0 && setCurrentIndex((i) => i - 1)}
                        disabled={currentIndex === 0}
                    >
                        Previous
                    </button>

                    <button
                        className={`${styles.navButton} ${currentIndex === questions.length - 1 ? styles.disabled : ""}`}
                        onClick={() =>
                            currentIndex < questions.length - 1 && setCurrentIndex((i) => i + 1)
                        }
                        disabled={currentIndex === questions.length - 1}
                    >
                        Skip
                    </button>

                    {currentIndex < questions.length - 1 ? (
                        <button
                            className={styles.primaryButton}
                            onClick={() =>
                                currentIndex < questions.length - 1 &&
                                setCurrentIndex((i) => i + 1)
                            }
                        >
                            Next
                        </button>
                    ) : (
                        <button className={styles.finishButton} onClick={handleFinish}>
                            Finish & Preview
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
