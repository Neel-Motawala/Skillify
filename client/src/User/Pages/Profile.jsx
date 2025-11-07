import React, { useEffect, useState } from "react";
import styles from "../Styles/TestPage/Profile.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem("id");
                const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
                setUser(res.data.user || null);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!user) return <div className={styles.error}>User data not found.</div>;

    return (
        <div className={styles.profilePage}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <button className={styles.backButton} onClick={() => navigate("/", { replace: true })}>
                    ← Back
                </button>
                <h2 className={styles.navTitle}>Profile Overview</h2>
            </nav>

            {/* Profile Card */}
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileLeft}>
                        <img
                            src="/images/avtar/bear.png"
                            alt="User Avatar"
                            className={styles.profilePic}
                        />
                        <div className={styles.profileText}>
                            <h2 className={styles.fullName}>{user.user_fullname}</h2>
                            <p className={styles.username}>@{user.user_name}</p>
                            <span
                                className={`${styles.status} ${user.status?.toLowerCase() === "active"
                                    ? styles.active
                                    : styles.inactive
                                    }`}
                            >
                                {user.status?.toLowerCase() === "active"
                                    ? "Active User"
                                    : "Inactive"}
                            </span>
                        </div>
                    </div>
                    <button
                        className={styles.editButton}
                        onClick={() => navigate("/dashboard/settings", { replace: true })}
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Vertical Info Section */}
                <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>Account Information</h3>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <label>Full Name</label>
                            <p>{user.user_fullname}</p>
                        </div>

                        <div className={styles.infoItem}>
                            <label>Username</label>
                            <p>{user.user_name}</p>
                        </div>

                        <div className={styles.infoItem}>
                            <label>Email</label>
                            <p>{user.user_email}</p>
                        </div>

                        <div className={styles.infoItem}>
                            <label>Contact</label>
                            <p>{user.user_contact}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
