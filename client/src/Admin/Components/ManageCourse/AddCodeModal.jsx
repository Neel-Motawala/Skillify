import React, { useState } from "react";
import axios from "axios";
import styles from "../../Styles/ManageCourse/AddCodeModal.module.css";

export default function AddCodeModal({ courseId, onClose, onAdded }) {
    const [mode, setMode] = useState("backend");
    const [stage, setStage] = useState("");
    const [questionTitle, setQuestionTitle] = useState("");
    const [question, setQuestion] = useState("");

    // Backend placeholders
    const [requireImport, setRequireImport] = useState("");
    const [functionTemplate, setFunctionTemplate] = useState(
        "static int functionName(int x) {\n   \n}"
    );
    const [userInput, setUserInput] = useState("");

    const [returnType, setReturnType] = useState("int");
    const [timeLimit, setTimeLimit] = useState(2000);
    const [memoryLimit, setMemoryLimit] = useState(65536);

    // Frontend fields
    const [htmlTemplate, setHtmlTemplate] = useState("");
    const [cssTemplate, setCssTemplate] = useState("");
    const [jsTemplate, setJsTemplate] = useState("");

    const [testCases, setTestCases] = useState([
        { input: "", expected_output: "", rule_type: "", rule_value: "", is_sample: 0 }
    ]);

    const addTestCase = () => {
        setTestCases([
            ...testCases,
            { input: "", expected_output: "", rule_type: "", rule_value: "", is_sample: 0 }
        ]);
    };

    const updateTestCase = (index, key, value) => {
        const updated = [...testCases];
        updated[index][key] = value;
        setTestCases(updated);
    };

    const removeTestCase = (index) => {
        if (testCases.length === 1) return;
        const updated = [...testCases];
        updated.splice(index, 1);
        setTestCases(updated);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                course_id: courseId,
                stage,
                question_title: questionTitle,
                question,

                return_type: mode === "backend" ? returnType : "",
                time_limit_ms: timeLimit,
                memory_limit_kb: memoryLimit,

                // Backend fields
                require_import: mode === "backend" ? requireImport : "",
                function_template: mode === "backend" ? functionTemplate : "",
                user_input: mode === "backend" ? userInput : "",


                // Frontend fields
                html_template: mode === "frontend" ? htmlTemplate : "",
                css_template: mode === "frontend" ? cssTemplate : "",
                js_template: mode === "frontend" ? jsTemplate : ""
            };

            const qRes = await axios.post("http://localhost:5000/api/code/add_code", payload);
            const questionId = qRes.data.question_id;

            // Test cases only for backend questions
            if (mode === "backend") {
                await axios.post("http://localhost:5000/api/code/add_test_code", {
                    question_id: questionId,
                    test_cases: testCases
                });
            }

            onAdded?.();
            onClose?.();
        } catch (err) {
            console.error(err);
            alert("Error adding code question");
        }
    };


    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Add Code Question</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>

                    {/* ===== BASIC DETAILS ===== */}
                    <h3 className={styles.sectionTitle}>Basic Info</h3>
                    <div className={styles.gridFour}>
                        <div className={styles.formGroup}>
                            <label>Stage</label>
                            <input
                                type="number"
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Return Type</label>
                            <input
                                type="text"
                                value={returnType}
                                onChange={(e) => setReturnType(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Time Limit (ms)</label>
                            <input
                                type="number"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Memory Limit (KB)</label>
                            <input
                                type="number"
                                value={memoryLimit}
                                onChange={(e) => setMemoryLimit(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.gridTwo}>
                        <div className={styles.formGroup}>
                            <label>Question Title</label>
                            {/* <input
                                type="text"
                                value={questionTitle}
                                onChange={(e) => setQuestionTitle(e.target.value)}
                            /> */}
                            <textarea
                                value={questionTitle}
                                onChange={(e) => setQuestionTitle(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.toggleRow}>
                        <button
                            className={mode === "backend" ? styles.activeTab : styles.tab}
                            onClick={() => setMode("backend")}
                        >
                            Backend
                        </button>

                        <button
                            className={mode === "frontend" ? styles.activeTab : styles.tab}
                            onClick={() => setMode("frontend")}
                        >
                            Frontend
                        </button>
                    </div>


                    {/* ===== BACKEND TEMPLATE ===== */}
                    {mode === "backend" && (
                        <>
                            <h3 className={styles.sectionTitle}>Backend Template</h3>

                            <div className={styles.gridTwo}>
                                <div className={styles.formGroup}>
                                    <label>Required Imports</label>
                                    <textarea
                                        rows={4}
                                        value={requireImport}
                                        onChange={(e) => setRequireImport(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>User Input (stdin)</label>
                                    <textarea
                                        rows={4}
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Function Template</label>
                                <textarea
                                    rows={4}
                                    value={functionTemplate}
                                    onChange={(e) => setFunctionTemplate(e.target.value)}
                                />
                            </div>
                        </>
                    )}


                    {/* ===== FRONTEND TEMPLATE ===== */}
                    {mode === "frontend" && (
                        <>
                            <h3 className={styles.sectionTitle}>Frontend Template</h3>

                            <div className={styles.gridThree}>
                                <div className={styles.formGroup}>
                                    <label>HTML Template</label>
                                    <textarea
                                        rows={4}
                                        value={htmlTemplate}
                                        onChange={(e) => setHtmlTemplate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>CSS Template</label>
                                    <textarea
                                        rows={4}
                                        value={cssTemplate}
                                        onChange={(e) => setCssTemplate(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>JavaScript Template</label>
                                    <textarea
                                        rows={4}
                                        value={jsTemplate}
                                        onChange={(e) => setJsTemplate(e.target.value)}
                                    />
                                </div>
                            </div>

                        </>
                    )}


                    {/* ===== TEST CASES ===== */}
                    <h3 className={styles.sectionTitle}>Test Cases</h3>

                    {testCases.map((tc, i) => (
                        <div key={i} className={styles.testCaseCard}>

                            <div className={styles.gridTwo}>
                                <div className={styles.formGroup}>
                                    <label>Input</label>
                                    <input
                                        value={tc.input}
                                        onChange={(e) => updateTestCase(i, "input", e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Expected Output</label>
                                    <input
                                        value={tc.expected_output}
                                        onChange={(e) =>
                                            updateTestCase(i, "expected_output", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className={styles.gridThree}>
                                <div className={styles.formGroup}>
                                    <label>Rule Type</label>
                                    <input
                                        value={tc.rule_type}
                                        onChange={(e) =>
                                            updateTestCase(i, "rule_type", e.target.value)
                                        }
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Rule Value</label>
                                    <input
                                        value={tc.rule_value}
                                        onChange={(e) =>
                                            updateTestCase(i, "rule_value", e.target.value)
                                        }
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Is Sample?</label>
                                    <select
                                        value={tc.is_sample}
                                        onChange={(e) =>
                                            updateTestCase(i, "is_sample", e.target.value)
                                        }
                                    >
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                className={styles.removeCaseBtn}
                                onClick={() => removeTestCase(i)}
                                disabled={testCases.length === 1}
                            >
                                Remove Test Case
                            </button>
                        </div>
                    ))}

                    <button className={styles.addCaseBtn} onClick={addTestCase}>
                        + Add Test Case
                    </button>

                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSubmit}>Save Question</button>
                </div>
            </div>
        </div >
    );
}
