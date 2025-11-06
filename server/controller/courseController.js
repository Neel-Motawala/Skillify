// controller/courseController.js
const e = require("express");
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

exports.updateCourseDetail = async (req, res) => {
    const id = req.params.id;
    const { course_name, image_url, course_desc, template } = req.body;

    try {
        if (!course_name || !image_url || !course_desc) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const sql = `
            UPDATE course 
            SET course_name = ?, image_url = ?, course_desc = ?, template = ?
            WHERE id = ?
        `;

        await pool.query(sql, [
            course_name,
            image_url,
            course_desc,
            template || "",
            id
        ]);

        return res.json({ message: "Course updated" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

