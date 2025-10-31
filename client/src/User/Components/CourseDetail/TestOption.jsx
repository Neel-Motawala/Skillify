import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../Styles/CourseDetail/TestOption.module.css";

export default function TestOption({ courseId, courseName }) {
    const [selected, setSelected] = useState("mcq");
    const [stages, setStages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);
    const [testMode, setTestMode] = useState("");

    const options = [
        { label: "MCQs", value: "mcq" },
        { label: "Theory", value: "theory" },
        { label: "Code", value: "code" },
    ];

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
                                onClick={() => handleModeSelect("Practice Test")}
                            >
                                Practice Test
                            </button>
                            <button
                                className={styles.practiceBtn}
                                onClick={() => handleModeSelect("Attempt Test")}
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
                                onClick={() => alert("Test Started!")}
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
