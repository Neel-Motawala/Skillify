const pool = require("../config/db");

// ✅ Get all users (returns array)
exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query("SELECT * FROM users");
        res.status(200).json(users);
    } catch (err) {
        console.error("Get Users Error:", err);
        res.status(500).json({ error: "Failed to retrieve users." });
    }
};

// ✅ Get total user count (returns object)
exports.getUserCount = async (req, res) => {
    try {
        const [result] = await pool.query("SELECT COUNT(*) AS count FROM users");
        res.status(200).json({ count: result[0].count });
    } catch (err) {
        console.error("Get User Count Error:", err);
        res.status(500).json({ error: "Failed to retrieve user count." });
    }
};

// ✅ Update user status (returns consistent success/error response)
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const [result] = await pool.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "Status updated successfully." });
    } catch (err) {
        console.error("Update Status Error:", err);
        res.status(500).json({ success: false, message: "Failed to update user status." });
    }
};
