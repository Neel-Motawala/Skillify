import React, { useMemo, useCallback, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import styles from "../../Styles/ManageCourse/CourseOption.module.css";

import AddMCQModal from "./AddMCQModal";
import AddTheoryModal from "./AddTheoryModal";
import AddCodeModal from "./AddCodeModal";

export default function CourseOption({ courseId, courseName }) {
    const navigate = useNavigate();

    // Options Menu
    const options = useMemo(
        () => [
            { label: "MCQs", icon: "bi bi-list-check", value: "mcq" },
            { label: "Theory", icon: "bi bi-journal-text", value: "theory" },
            { label: "Code", icon: "bi bi-code-slash", value: "code" },
        ],
        []
    );

    const [selected, setSelected] = useState(options[0]);   // default MCQ
    const [stages, setStages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [courseData, setCourseData] = useState({
        course_name: "",
        image_url: "",
        course_desc: "",
        template: ""
    });

    const loadCourse = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/course/${courseId}`);
            setCourseData(res.data);
            setShowEditModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const updateCourse = async () => {
        try {
            await axios.put(`http://localhost:5000/api/course/${courseId}`, courseData);
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * ✅ Fetch Stages According to Selected Option
     */
    const fetchStages = useCallback(
        async (option) => {
            try {
                // ✅ For Code Questions
                if (option.value === "code") {
                    const res = await axios.get(
                        `http://localhost:5000/api/code/stages/${courseId}`
                    );
                    setStages(res.data?.stages || []);
                }

                // ✅ For MCQ + Theory 
                else {
                    const res = await axios.get(
                        `http://localhost:5000/api/questions/${courseId}?type=${option.value}`
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

    /**
     * ✅ Load Default (MCQ) on First Render
     */
    useEffect(() => {
        if (options.length) {
            fetchStages(options[0]);
        }
    }, [fetchStages, options]);

    /**
     * ✅ When User Selects MCQ / Theory / Code
     */
    const handleSelect = async (option) => {
        setSelected(option);
        await fetchStages(option);
    };

    /**
     * ✅ Refresh Stage List After Adding New Question
     */
    const refreshStages = async () => {
        if (!selected) return;

        await fetchStages(selected);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <div className={styles.container}>

            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate("/admin-dashboard/manage-courses", { replace: true })}>
                    <i className="bi bi-arrow-left-circle"></i>
                    <span>Back</span>
                </button>

                <div className={styles.headerText}>
                    <h2 className={styles.pageTitle}>Course Management</h2>

                    <button
                        className={styles.editBtn}
                        onClick={loadCourse}
                    >
                        Edit Course
                    </button>
                </div>

            </div>

            {/* Course Info */}
            <div className={styles.courseInfo}>
                <h3 className={styles.courseName}>
                    {courseName || `Course ID: ${courseId}`}
                </h3>
                <div className={styles.divider}></div>
            </div>

            {/* Option Cards */}
            <div className={styles.optionGrid}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        className={`${styles.optionCard} ${selected?.value === option.value ? styles.selected : ""
                            }`}
                        onClick={() => handleSelect(option)}
                    >
                        <div className={styles.iconWrapper}>
                            <i className={`${option.icon} ${styles.icon}`}></i>
                        </div>
                        <h5 className={styles.label}>{option.label}</h5>
                    </div>
                ))}
            </div>

            {/* Stage Listing */}
            {selected && (
                <div className={styles.stageSection}>
                    <div className={styles.stageHeader}>
                        <h4 className={styles.stageTitle}>
                            Available Stages ({selected.label})
                        </h4>

                        <button
                            className={styles.addBtn}
                            onClick={() => setShowModal(true)}
                        >
                            Add {selected.label} Question
                        </button>
                    </div>


                    {stages.length > 0 ? (
                        <div className={styles.stageGrid}>
                            {stages.map((s, index) => (
                                <div
                                    key={index}
                                    className={styles.stageCard}
                                    onClick={() =>
                                        navigate(
                                            `/admin-dashboard/manage-courses/${courseId}/add?stage=${s.stage}&type=${selected.value}`,
                                            { replace: true }
                                        )
                                    }
                                >
                                    <span>Stage {s.stage}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noStages}>
                            No stages found for this question type.
                        </p>
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

            {showModal && selected?.value === "code" && (
                <AddCodeModal
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

            {showEditModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalBox}>
                        <h3>Edit Course</h3>

                        <input
                            type="text"
                            value={courseData.course_name}
                            onChange={e => setCourseData({ ...courseData, course_name: e.target.value })}
                            placeholder="Course Name"
                        />

                        <input
                            type="text"
                            value={courseData.image_url}
                            onChange={e => setCourseData({ ...courseData, image_url: e.target.value })}
                            placeholder="Image URL"
                        />

                        <textarea
                            value={courseData.course_desc}
                            onChange={e => setCourseData({ ...courseData, course_desc: e.target.value })}
                            placeholder="Description"
                        />

                        <textarea
                            value={courseData.template}
                            onChange={e => setCourseData({ ...courseData, template: e.target.value })}
                            placeholder="Template JSON"
                        />

                        <div className={styles.modalActions}>
                            <button onClick={() => setShowEditModal(false)}>Close</button>
                            <button onClick={updateCourse}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
