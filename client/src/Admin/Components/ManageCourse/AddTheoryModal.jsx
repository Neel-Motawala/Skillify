import React, { useState } from "react";
import axios from "axios";
import styles from "../../Styles/ManageCourse/AddTheoryModal.module.css";

export default function AddTheoryModal({ courseId, stage: initialStage, onClose, onAdded }) {
    const [stage, setStage] = useState(initialStage || "");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/questions/add-theory", {
                course_id: courseId,
                stage,
                question,
                answer,
            });
            onAdded();
            onClose();
        } catch (err) {
            console.error("Error adding theory question:", err);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>Add Theory Question</h3>
                <form onSubmit={handleSubmit}>
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
                        placeholder="Enter theory question"
                        required
                    />

                    <label>Answer</label>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter correct answer or key points"
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
