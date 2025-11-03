import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/TestPage/UserTest.module.css";

export default function UserTest({ userId, courseId, testType, stage, testMode, userTestId }) {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const handleSelectOption = (qid, optionText) => {
        setAnswers((prev) => {
            if (prev[qid] === optionText) {
                const newAnswers = { ...prev };
                delete newAnswers[qid];
                return newAnswers;
            }
            return { ...prev, [qid]: optionText };
        });
    };

    const handleTextAnswer = (qid, value) => {
        setAnswers((prev) => ({ ...prev, [qid]: value }));
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
    };

    const prevQuestion = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    const skipQuestion = () => nextQuestion();

    const handleFinish = () => {
        const finalAnswers = { ...answers };
        questions.forEach((q) => {
            if (!(q.id in finalAnswers)) finalAnswers[q.id] = null;
        });

        navigate(`/dashboard/course/${courseId}/test/${userTestId}/preview`, {
            state: {
                questions,
                answers: finalAnswers,
                testType,
                userTestId,
            },
        });
    };

    const handleQuit = () => {
        const confirmQuit = window.confirm("Are you sure you want to quit?");
        if (confirmQuit) navigate("/dashboard/activity", { replace: true });
    };

    if (loading) return <p className={styles.loading}>Loading questions...</p>;
    if (questions.length === 0) return <p className={styles.noData}>No questions found for this test.</p>;

    const q = questions[currentIndex];
    const userAnswer = answers[q.id] || "";

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.testTitle}>{testType.toUpperCase()} Test — Stage {stage}</h2>
                    <p className={styles.subHeader}>
                        <strong>Mode:</strong> {testMode} |{" "}
                        <strong>Question:</strong> {currentIndex + 1} / {questions.length}
                    </p>
                </div>
                <button className={styles.quitButton} onClick={handleQuit}>
                    Quit
                </button>
            </div>


            <div className={styles.questionCard}>
                <h4 className={styles.questionText}>{q.question}</h4>

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

            <div className={styles.navigation}>
                <button
                    className={`${styles.navButton} ${currentIndex === 0 ? styles.disabled : ""}`}
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                >
                    Previous
                </button>
                <button
                    className={`${styles.navButton} ${currentIndex === questions.length - 1 ? styles.disabled : ""}`}
                    onClick={skipQuestion}
                    disabled={currentIndex === questions.length - 1}
                >
                    Skip
                </button>
                {currentIndex < questions.length - 1 ? (
                    <button className={styles.primaryButton} onClick={nextQuestion}>
                        Next
                    </button>
                ) : (
                    <button className={styles.finishButton} onClick={handleFinish}>
                        Finish & Preview
                    </button>
                )}
            </div>
        </div>
    );
}
