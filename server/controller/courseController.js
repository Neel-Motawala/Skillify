// controller/courseController.js
const pool = require("../config/db"); // mysql2/promise pool

// Get all courses
exports.getCourses = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM course");
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getCourseDetail = async (req, res) => {
    try {
        const [results] = await pool.query(
            "SELECT * FROM course WHERE id = ?",
            [req.params.id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json(results[0]); // ✅ Return a single course object
    } catch (err) {
        console.error("Get Course Detail Error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getCourseCount = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT COUNT(*) AS count FROM course");
        res.json({ count: results[0].count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
