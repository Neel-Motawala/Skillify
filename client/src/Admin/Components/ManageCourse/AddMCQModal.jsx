import React, { useState } from "react";
import axios from "axios";
import styles from "../../Styles/ManageCourse/AddMCQModal.module.css";

export default function AddMCQModal({ courseId, stage: initialStage, onClose, onAdded }) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [answer, setAnswer] = useState("");
    const [stage, setStage] = useState(initialStage || "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/questions/add-mcq", {
                course_id: courseId,
                stage,
                question,
                options,
                answer,
            });
            onAdded();
            onClose();
        } catch (err) {
            console.error("Error adding MCQ:", err);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>Add MCQ Question</h3>
                <form onSubmit={handleSubmit}>
                    {/* Stage Field */}
                    <label>Stage</label>
                    <input
                        type="number"
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        placeholder="Enter stage number"
                        required
                    />

                    <label>Question</label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />

                    <label>Options</label>
                    {options.map((opt, i) => (
                        <input
                            key={i}
                            type="text"
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) =>
                                setOptions(
                                    options.map((o, idx) => (idx === i ? e.target.value : o))
                                )
                            }
                            required
                        />
                    ))}

                    <label>Correct Answer</label>
                    <input
                        type="text"
                        placeholder="Correct Option Text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        required
                    />

                    <div className={styles.actions}>
                        <button type="submit" className={styles.saveBtn}>Save</button>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
