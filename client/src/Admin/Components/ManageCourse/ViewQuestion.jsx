import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../Styles/ManageCourse/ViewQuestion.module.css";

export default function ViewQuestion({ courseId, stage, type }) {
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/questions/${courseId}/questions?type=${type}&stage=${stage}`
                );
                setQuestions(res.data.questions || []);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setQuestions([]);
            }
        };

        if (courseId && type && stage) fetchQuestions();
    }, [courseId, type, stage]);

    return (
        <div className={styles.container}>
            {/* Back Button */}
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left-circle"></i>
                <span>Back</span>
            </button>

            {/* Course Info */}
            <div className={styles.infoBox}>
                <p><strong>Course ID:</strong> {courseId}</p>
                <p><strong>Stage:</strong> {stage}</p>
                <p><strong>Type:</strong> {type}</p>
            </div>

            {/* Questions Section */}
            <div className={styles.questionSection}>
                <h3 className={styles.sectionTitle}>Available Questions</h3>
                {questions.length > 0 ? (
                    <ul className={styles.questionList}>
                        {questions.map((q) => (
                            <li key={q.id} className={styles.questionItem}>
                                <div className={styles.questionBlock}>
                                    <p className={styles.questionText}><strong>Q:</strong> {q.question}</p>

                                    {/* Show answers differently based on type */}
                                    {type === "mcq" && q.options?.length > 0 && (
                                        <ul className={styles.optionList}>
                                            {q.options.map((opt, i) => (
                                                <li
                                                    key={i}
                                                    className={`${styles.optionItem} ${opt.is_correct ? styles.correct : ""}`}
                                                >
                                                    {opt.option_text}
                                                    {opt.is_correct && <span className={styles.correctTag}>✔</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {type === "theory" && q.answer && (
                                        <p className={styles.answerText}>
                                            <strong>Answer:</strong> {q.answer}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noQuestions}>No questions found for this stage and type.</p>
                )}
            </div>
        </div>
    );
}
