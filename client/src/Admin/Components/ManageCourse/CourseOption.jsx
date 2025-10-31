import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/ManageCourse/CourseOption.module.css";
import AddMCQModal from "./AddMCQModal";
import AddTheoryModal from "./AddTheoryModal";

export default function CourseOption({ courseId, courseName }) {
    const navigate = useNavigate();

    const options = [
        { label: "MCQs", icon: "bi bi-list-check", value: "mcq" },
        { label: "Theory", icon: "bi bi-journal-text", value: "theory" },
        { label: "Code", icon: "bi bi-code-slash", value: "code" },
    ];

    const [selected, setSelected] = useState(options[0]); // default MCQ
    const [stages, setStages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchStages = async (option) => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/questions/${courseId}?type=${option.value}`
            );
            setStages(res.data || []);
        } catch (err) {
            console.error("Error fetching stages:", err);
            setStages([]);
        }
    };

    useEffect(() => {
        // load MCQ stages by default
        fetchStages(options[0]);
    }, [courseId]);

    const handleSelect = async (option) => {
        setSelected(option);
        await fetchStages(option);
    };

    const refreshStages = async () => {
        if (!selected) return;
        await fetchStages(selected);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left-circle"></i>
                    <span>Back</span>
                </button>
                <div className={styles.headerText}>
                    <h2 className={styles.pageTitle}>Course Management</h2>
                </div>
            </div>

            {/* Course Info */}
            <div className={styles.courseInfo}>
                <h3 className={styles.courseName}>{courseName || `Course ID: ${courseId}`}</h3>
                <div className={styles.divider}></div>
            </div>

            {/* Option Cards */}
            <div className={styles.optionGrid}>
                {options.map((option) => (
                    <div
                        key={option.label}
                        className={`${styles.optionCard} ${selected?.label === option.label ? styles.selected : ""}`}
                        onClick={() => handleSelect(option)}
                    >
                        <div className={styles.iconWrapper}>
                            <i className={`${option.icon} ${styles.icon}`}></i>
                        </div>
                        <h5 className={styles.label}>{option.label}</h5>
                    </div>
                ))}
            </div>

            {/* Stages Display */}
            {selected && (
                <div className={styles.stageSection}>
                    <div className={styles.stageHeader}>
                        <h4 className={styles.stageTitle}>Available Stages ({selected.label})</h4>
                        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                            Add {selected.value.charAt(0).toUpperCase() + selected.value.slice(1)} Question
                        </button>
                    </div>

                    {stages.length > 0 ? (
                        <div className={styles.stageGrid}>
                            {stages.map((s) => (
                                <div
                                    key={s.stage}
                                    className={styles.stageCard}
                                    onClick={() =>
                                        navigate(
                                            `/admin-dashboard/manage-courses/${courseId}/add?stage=${s.stage}&type=${selected.value}`
                                        )
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    <span>Stage {s.stage}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noStages}>No stages found for this course type.</p>
                    )}
                </div>
            )}

            {/* Modals */}
            {showModal && selected?.value === "mcq" && (
                <AddMCQModal
                    courseId={courseId}
                    onClose={() => setShowModal(false)}
                    onAdded={refreshStages}
                />
            )}
            {showModal && selected?.value === "theory" && (
                <AddTheoryModal
                    courseId={courseId}
                    onClose={() => setShowModal(false)}
                    onAdded={refreshStages}
                />
            )}

            {/* Success Popup */}
            {showSuccess && (
                <div className={styles.successPopup}>
                    <p>Question added successfully!</p>
                </div>
            )}
        </div>
    );
}
