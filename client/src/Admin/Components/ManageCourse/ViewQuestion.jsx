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
                let res;

                if (type === "code") {
                    // ✅ Correct API for code questions
                    res = await axios.get(
                        `http://localhost:5000/api/code/${courseId}/${stage}`
                    );

                    setQuestions(res.data.questions || []);
                } else {
                    // ✅ MCQ + Theory API
                    res = await axios.get(
                        `http://localhost:5000/api/questions/${courseId}/questions?type=${type}&stage=${stage}`
                    );

                    setQuestions(res.data.questions || []);
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
                setQuestions([]);
            }
        };


        if (stage && type) fetchQuestions();
    }, [courseId, stage, type]);

    return (
        <div className={styles.container}>

            {/* Back Button */}
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left-circle"></i>
                <span>Back</span>
            </button>

            {/* Info Box */}
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

                                    {/* ✅ Question Text */}
                                    <p className={styles.questionText}>
                                        <strong>Q:</strong> {q.question_title || q.question}
                                    </p>

                                    <p className={styles.questionTextSmall}>
                                        {q.question}
                                    </p>

                                    {/* ✅ MCQ OPTIONS */}
                                    {type === "mcq" && q.options?.length > 0 && (
                                        <ul className={styles.optionList}>
                                            {q.options.map((opt, i) => (
                                                <li
                                                    key={i}
                                                    className={`${styles.optionItem} ${opt.is_correct ? styles.correct : ""
                                                        }`}
                                                >
                                                    {opt.option_text}
                                                    {opt.is_correct && (
                                                        <span className={styles.correctTag}>✔</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* ✅ THEORY ANSWER */}
                                    {type === "theory" && q.answer && (
                                        <p className={styles.answerText}>
                                            <strong>Answer:</strong> {q.answer}
                                        </p>
                                    )}

                                    {/* ✅ CODE QUESTION VIEW */}
                                    {type === "code" && (
                                        <div className={styles.codeBlock}>

                                            {/* QUESTION TITLE */}
                                            {/* <div className={styles.section}>
                                                <h4 className={styles.sectionTitle}>Question Title</h4>
                                                <p className={styles.sectionText}>{q.question_title}</p>
                                            </div> */}

                                            {/* QUESTION DESCRIPTION */}
                                            {/* <div className={styles.section}>
                                                <h4 className={styles.sectionTitle}>Description</h4>
                                                <p className={styles.sectionText}>{q.question}</p>
                                            </div> */}

                                            {/* IMPORTS */}
                                            {q.require_import && (
                                                <div className={styles.section}>
                                                    <h4 className={styles.sectionTitle}>Required Imports</h4>
                                                    <pre className={styles.codePre}>{q.require_import}</pre>
                                                </div>
                                            )}

                                            {/* FUNCTION TEMPLATE */}
                                            <div className={styles.section}>
                                                <h4 className={styles.sectionTitle}>Function Template</h4>
                                                <pre className={styles.codePre}>{q.function_template}</pre>
                                            </div>

                                            {/* USER INPUT TEMPLATE */}
                                            {q.user_input && (
                                                <div className={styles.section}>
                                                    <h4 className={styles.sectionTitle}>User Input Template</h4>
                                                    <pre className={styles.codePre}>{q.user_input}</pre>
                                                </div>
                                            )}

                                            {/* RETURN TYPE */}
                                            <div className={styles.section}>
                                                <h4 className={styles.sectionTitle}>Return Type</h4>
                                                <p className={styles.sectionText}>{q.return_type}</p>
                                            </div>

                                            {/* TIME LIMIT + MEMORY LIMIT */}
                                            <div className={styles.sectionRow}>
                                                <div>
                                                    <h4 className={styles.sectionTitle}>Time Limit</h4>
                                                    <p className={styles.sectionText}>{q.time_limit_ms} ms</p>
                                                </div>
                                                <div>
                                                    <h4 className={styles.sectionTitle}>Memory Limit</h4>
                                                    <p className={styles.sectionText}>{q.memory_limit_kb} KB</p>
                                                </div>
                                            </div>

                                            {/* FRONTEND TEMPLATES */}
                                            {(q.html_template || q.css_template || q.js_template) && (
                                                <div className={styles.section}>
                                                    <h4 className={styles.sectionTitle}>Frontend Templates</h4>

                                                    {q.html_template && (
                                                        <>
                                                            <h5 className={styles.subTitle}>HTML</h5>
                                                            <pre className={styles.codePre}>{q.html_template}</pre>
                                                        </>
                                                    )}

                                                    {q.css_template && (
                                                        <>
                                                            <h5 className={styles.subTitle}>CSS</h5>
                                                            <pre className={styles.codePre}>{q.css_template}</pre>
                                                        </>
                                                    )}

                                                    {q.js_template && (
                                                        <>
                                                            <h5 className={styles.subTitle}>JavaScript</h5>
                                                            <pre className={styles.codePre}>{q.js_template}</pre>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* TEST CASES */}
                                            <div className={styles.section}>
                                                <h4 className={styles.sectionTitle}>Test Cases</h4>

                                                <ul className={styles.testCaseList}>
                                                    {q.test_cases?.map((tc) => (
                                                        <li key={tc.id} className={styles.testCaseItem}>
                                                            <p><strong>Input:</strong> {tc.input}</p>
                                                            <p><strong>Expected:</strong> {tc.expected_output}</p>
                                                            {tc.rule_type && <p><strong>Rule:</strong> {tc.rule_type} = {tc.rule_value}</p>}
                                                            {tc.is_sample === 1 && <span className={styles.sampleTag}>Sample</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* CREATED DATE */}
                                            <div className={styles.section}>
                                                <h4 className={styles.sectionTitle}>Created At</h4>
                                                <p className={styles.sectionText}>
                                                    {new Date(q.created_at).toLocaleString()}
                                                </p>
                                            </div>

                                        </div>
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
