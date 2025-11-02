import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../Styles/CourseDetail/TestOption.module.css";

export default function TestOption({ courseId, courseName }) {
    const [selected, setSelected] = useState("mcq");
    const [stages, setStages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);
    const [testMode, setTestMode] = useState("");
    const navigate = useNavigate();

    const options = [
        { label: "MCQs", value: "mcq" },
        { label: "Theory", value: "theory" },
        { label: "Code", value: "code" },
    ];

    // Example: replace with actual logged-in user ID
    const userId = localStorage.getItem("user_id") || 1;

    const fetchStages = async (type) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/questions/${courseId}?type=${type}`);
            setStages(res.data || []);
        } catch (err) {
            console.error("Error fetching stages:", err);
            setStages([]);
        }
    };

    useEffect(() => {
        fetchStages("mcq");
    }, []);

    const handleTypeSelect = (type) => {
        setSelected(type);
        fetchStages(type);
    };

    const openStageModal = (stage) => {
        setSelectedStage(stage);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedStage(null);
    };

    const handleModeSelect = (mode) => {
        setTestMode(mode);
        setShowModal(false);
        setConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setConfirmModal(false);
        setTestMode("");
    };

    // Handle start test and insert entries
    const handleStartTest = async () => {
        try {
            const testRes = await axios.post("http://localhost:5000/api/user-test/start", {
                user_id: userId,
                course_id: courseId,
                test_type: selected,
                test_mode: testMode,
                stage: selectedStage,
            });

            const userTestId = testRes.data.user_test_id;

            // Call second API to mark "in_progress"
            await axios.post("http://localhost:5000/api/user-test/progress", {
                user_test_id: userTestId,
            });

            alert("Test started successfully!");
            setConfirmModal(false);

            // Redirect to test page
            navigate(`/dashboard/course/${courseId}/test/${userTestId}`);
        } catch (err) {
            console.error("Error starting test:", err);
            alert("Failed to start test. Please try again.");
        }
    };



    return (
        <div>
            {/* Type Options */}
            <div className={styles.optionContainer}>
                {options.map((opt) => (
                    <div
                        key={opt.value}
                        className={`${styles.optionBox} ${selected === opt.value ? styles.selected : ""}`}
                        onClick={() => handleTypeSelect(opt.value)}
                    >
                        {opt.label}
                    </div>
                ))}
            </div>

            {/* Stage Display */}
            {selected && (
                <div className={styles.stageContainer}>
                    <h4 className={styles.stageTitle}>Available Stages ({selected})</h4>
                    {stages.length > 0 ? (
                        <div className={styles.stageGrid}>
                            {stages.map((s) => (
                                <div
                                    key={s.stage}
                                    className={styles.stageCard}
                                    onClick={() => openStageModal(s.stage)}
                                >
                                    Stage {s.stage}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noStage}>No stages found for this type.</p>
                    )}
                </div>
            )}

            {/* Test Mode Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${styles.leftAligned}`}>
                        <h3>Stage {selectedStage}</h3>
                        <p>Choose how you want to proceed:</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.practiceBtn}
                                onClick={() => handleModeSelect("Practice")}
                            >
                                Practice Test
                            </button>
                            <button
                                className={styles.practiceBtn}
                                onClick={() => handleModeSelect("Attempt")}
                            >
                                Attempt Test
                            </button>
                        </div>
                        <button className={styles.closeBtn} onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${styles.leftAligned}`}>
                        <h3>Confirm Test Details</h3>
                        <div className={styles.detailBox}>
                            <p><strong>Course:</strong> {courseName}</p>
                            <p><strong>Type:</strong> {selected}</p>
                            <p><strong>Stage:</strong> {selectedStage}</p>
                            <p><strong>Mode:</strong> {testMode}</p>
                            <p><strong>Start Time:</strong> {new Date().toLocaleString()}</p>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={`${styles.btn} ${styles.startBtn}`}
                                onClick={handleStartTest}
                            >
                                Start Test
                            </button>
                            <button
                                className={`${styles.btn} ${styles.cancelBtn}`}
                                onClick={closeConfirmModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
