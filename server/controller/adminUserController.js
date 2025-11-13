const pool = require("../config/db");

exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query("SELECT * FROM users");
        res.status(200).json(users);
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ error: "Failed to retrieve users." });
    }
};

exports.getUserCount = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT COUNT(*) AS count FROM users");
        res.status(200).json({ count: result[0].count });
    } catch (err) {
        console.error("Get User Count Error:", err);
        res.status(500).json({ error: "Failed to retrieve user count." });
    }
};