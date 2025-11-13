const pool = require("../config/db");
const bcrypt = require("bcryptjs")

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

exports.updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_password, new_password } = req.body;

        if (!id || !current_password || !new_password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 1. Fetch user from DB
        const [rows] = await pool.query(
            "SELECT user_password FROM users WHERE id = ?",
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];

        // 2. Verify current password
        const isMatch = await bcrypt.compare(current_password, user.user_password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // 4. Update in DB
        await pool.query(
            "UPDATE users SET user_password = ? WHERE id = ?",
            [hashedPassword, id]
        );

        return res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};