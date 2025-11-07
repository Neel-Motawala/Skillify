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

exports.getUserData = async (req, res) => {
    const { userId } = req.params;

    try {
        const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);

        if (userRows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        // Send user data
        return res.status(200).json({ success: true, user: userRows[0] });

    } catch (err) {
        console.error("Get User Data Error:", err);
        return res.status(500).json({ error: "Failed to retrieve user data." });
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


exports.editUserDetails = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;

        let field, value;

        // Case 1: Image uploaded
        if (req.file) {
            field = "profile_img";
            value = "/profile/" + req.file.filename;
        }
        // Case 2: Normal text field update
        else {
            field = Object.keys(data)[0];
            value = data[field];
        }

        const allowedFields = [
            "user_fullname",
            "user_name",
            "user_email",
            "user_contact",
            "profile_img"
        ];

        if (!allowedFields.includes(field)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid field update" });
        }

        const sql = `UPDATE users SET ${field} = ? WHERE id = ?`;
        const [result] = await pool.query(sql, [value, userId]);

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // fetch updated user
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        return res.json({
            success: true,
            message: "Profile updated successfully",
            user: rows[0]
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating profile"
        });
    }
};


