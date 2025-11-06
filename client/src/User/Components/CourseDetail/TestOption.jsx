import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaListUl, FaFileAlt, FaCode } from "react-icons/fa";
import axios from "axios";
import styles from "../../Styles/CourseDetail/TestOption.module.css";

export default function TestOption({ courseId, courseName }) {
    const [course, setCourse] = useState(null);
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

    const userId = localStorage.getItem("user_id") || 1;

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/course/${courseId}`);
                setCourse(response.data || null);
            } catch (error) {
                console.error("Error fetching course:", error);
                setCourse(null);
            }
        };
        if (courseId) fetchCourse();
    }, [courseId]);

    const fetchStages = useCallback(
        async (type) => {
            try {
                let res;

                if (type === "code") {
                    // ✅ NEW → Fetch code stages
                    res = await axios.get(`http://localhost:5000/api/code/stages/${courseId}`);
                    setStages(res.data?.stages || []);
                } else {
                    // ✅ Existing MCQ + Theory API
                    res = await axios.get(
                        `http://localhost:5000/api/questions/${courseId}?type=${type}`
                    );
                    setStages(res.data || []);
                }

            } catch (err) {
                console.error("Error fetching stages:", err);
                setStages([]);
            }
        },
        [courseId]
    );


    useEffect(() => {
        fetchStages("mcq");
    }, [fetchStages]);

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

    const handleStartTest = async () => {
        try {
            const testRes = await axios.post("http://localhost:5000/api/user-test/start", {
                user_id: userId,
                course_id: courseId,
                test_type: selected,
                test_mode: testMode,
                stage: selectedStage,
            });

            const userTestId = testRes.data?.user_test_id;
            if (!userTestId) throw new Error("Invalid response: missing user_test_id");

            await axios.post("http://localhost:5000/api/user-test/progress", {
                user_test_id: userTestId,
            });

            setConfirmModal(false);

            if (selected === "code") {
                navigate(`/dashboard/course/${courseId}/code/${userTestId}`);
            } else {
                navigate(`/dashboard/course/${courseId}/test/${userTestId}`);
            }

        } catch (err) {
            console.error("Error starting test:", err);
            alert("Failed to start test. Please try again.");
        }
    };


    return (
        <div className={styles.pageContainer}>
            {/* Header Section */}
            <div className={styles.titleContainer}>
                <button
                    className="btn btn-outline-secondary mb-3"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <h2 className={styles.courseTitle}>
                    {course?.course_name || courseName || "Course"}
                </h2>
                <p className={styles.courseDescription}>
                    {course?.course_desc || "No description available."}
                </p>
            </div>

            {/* Type Options */}
            <div className={styles.optionContainer}>
                {options.map((opt) => (
                    <div
                        key={opt.value}
                        className={`${styles.optionBox} ${selected === opt.value ? styles.selected : ""
                            }`}
                        onClick={() => handleTypeSelect(opt.value)}
                    >
                        {opt.value === "mcq" && <FaListUl className={styles.icon} />}
                        {opt.value === "theory" && <FaFileAlt className={styles.icon} />}
                        {opt.value === "code" && <FaCode className={styles.icon} />}
                        {opt.label}
                    </div>
                ))}
            </div>

            {/* Stage List */}
            {selected && (
                <div className={styles.stageContainer}>
                    <h4 className={styles.stageTitle}>Available Stages ({selected})</h4>
                    {stages.length > 0 ? (
                        <div className={styles.stageGrid}>
                            {stages.map((s) => (
                                <div key={s.stage} className={styles.stageCard} onClick={() => openStageModal(s.stage)}>
                                    Stage {s.stage}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noStage}>No stages found for this type.</p>
                    )}
                </div>
            )}

            {/* Mode Selection Modal */}
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
                                className={styles.attemptBtn}
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
