import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../Styles/Dashboard/Settings.module.css";

export default function Settings() {
    const [user, setUser] = useState(null);
    const [editField, setEditField] = useState(null); // which field is being edited
    const [editValue, setEditValue] = useState("");   // current editable value
    const navigate = useNavigate();

    const handleEditClick = (fieldName, currentValue) => {
        setEditField(fieldName);
        setEditValue(currentValue);
    };

    const handleSave = async () => {
        try {
            const userId = localStorage.getItem("id");
            await axios.put(
                `http://localhost:5000/api/users/edit-profile/${userId}`,
                { [editField]: editValue }
            );

            setUser({ ...user, [editField]: editValue });  // update UI
            setEditField(null);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleCancel = () => {
        setEditField(null);
    };

    const handleProfileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("profile_img", file);

            const userId = localStorage.getItem("id");

            const res = await axios.put(
                `http://localhost:5000/api/users/edit-profile/${userId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            // Update UI
            setUser(res.data.user);

        } catch (err) {
            console.error("Profile image upload error:", err);
        }
    };


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = localStorage.getItem("id");
                if (!userId) return;

                const res = await axios.get(
                    `http://localhost:5000/api/users/${userId}`
                );

                setUser(res.data.user || null);
            } catch (err) {
                console.error("Failed to load user:", err);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { replace: true });
    };

    return (
        <div className={styles.pageContainer}>

            {/* Header */}
            <div className={styles.headerRow}>
                <button className={styles.backBtn} onClick={() => window.history.back()}>
                    Back
                </button>
                <span className={styles.divider}>|</span>
                <h2 className={styles.pageTitle}>Settings</h2>
            </div>

            {/* ✅ Two-Column Layout */}
            <div className={styles.grid}>

                {/* ✅ Profile Section */}
                <div className={styles.card}>
                    <h3 className={styles.sectionTitle}>Profile</h3>

                    <div className={styles.profileGrid}>

                        {/* Avatar */}
                        <div className={styles.avatarBlock}>
                            <img
                                src={user?.profile_img
                                    ? `http://localhost:5000${user.profile_img}`
                                    : "/Images/avtar/bear.png"}
                                alt="avatar"
                                className={styles.avatar}
                            />

                            <span
                                className={styles.editIcon}
                                onClick={() => document.getElementById("profileUploader").click()}
                            >
                                ✎
                            </span>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                id="profileUploader"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => handleProfileChange(e)}
                            />
                        </div>


                        {/* Column 1 */}
                        <div className={styles.infoColumn}>

                            {/* Username */}
                            <div className={styles.infoRow}>
                                <label>Username</label>
                                <div className={styles.valueRow}>
                                    {editField === "user_name" ? (
                                        <div className={styles.editBox}>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                            <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                                            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={styles.displayText}>{user?.user_name}</p>
                                            <span
                                                className={styles.editIconSmall}
                                                onClick={() => handleEditClick("user_name", user.user_name)}
                                            >
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className={styles.infoRow}>
                                <label>Email</label>
                                <div className={styles.valueRow}>
                                    {editField === "user_email" ? (
                                        <div className={styles.editBox}>
                                            <input
                                                type="email"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                            <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                                            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={styles.displayText}>{user?.user_email}</p>
                                            <span
                                                className={styles.editIconSmall}
                                                onClick={() => handleEditClick("user_email", user.user_email)}
                                            >
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Column 2 */}
                        <div className={styles.infoColumn}>

                            {/* Full Name */}
                            <div className={styles.infoRow}>
                                <label>Full Name</label>
                                <div className={styles.valueRow}>
                                    {editField === "user_fullname" ? (
                                        <div className={styles.editBox}>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                            <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                                            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={styles.displayText}>{user?.user_fullname}</p>
                                            <span
                                                className={styles.editIconSmall}
                                                onClick={() => handleEditClick("user_fullname", user.user_fullname)}
                                            >
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Contact */}
                            <div className={styles.infoRow}>
                                <label>Contact</label>
                                <div className={styles.valueRow}>
                                    {editField === "user_contact" ? (
                                        <div className={styles.editBox}>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                            />
                                            <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                                            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className={styles.displayText}>{user?.user_contact}</p>
                                            <span
                                                className={styles.editIconSmall}
                                                onClick={() => handleEditClick("user_contact", user.user_contact)}
                                            >
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>

                </div>


                {/* ✅ Security */}
                <div className={styles.card}>
                    <h3 className={styles.sectionTitle}>Security</h3>

                    <div className={styles.infoRow}>
                        <label>Current Password</label>
                        <input type="password" placeholder="••••••••" />
                    </div>

                    <div className={styles.inlineRow}>
                        <div className={styles.inlineInput}>
                            <label>New Password</label>
                            <input type="password" placeholder="Enter new password" />
                        </div>

                        <div className={styles.inlineInput}>
                            <label>Confirm Password</label>
                            <input type="password" placeholder="Confirm password" />
                        </div>
                    </div>

                    <button className={styles.primaryBtn}>Update Password</button>
                </div>

                {/* ✅ Account */}
                <div className={styles.card}>
                    <h3 className={styles.sectionTitle}>Account</h3>

                    <div className={styles.btnGroup}>
                        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                        <button className={styles.deleteBtn}>Delete Account</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
