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
