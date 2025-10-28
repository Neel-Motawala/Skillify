const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.registerUser = async (req, res) => {
    try {
        const { user_fullname, user_name, user_email, user_contact, user_password } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(user_password, 10);

        // Insert user into database
        const [result] = await pool.query(
            "INSERT INTO users (user_fullname, user_name, user_email, user_contact, user_password) VALUES (?, ?, ?, ?, ?)",
            [user_fullname, user_name, user_email, user_contact, hashedPassword]
        );

        // Return success response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId,
        });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({
            success: false,
            error: "Registration failed. " + err.message,
        });
    }
};



exports.loginUser = async (req, res) => {
    try {
        const { user_name, user_password } = req.body;

        if (!user_name || !user_password) {
            return res.status(400).json({ success: false, error: "Username and password are required." });
        }

        // Fetch user
        const [rows] = await pool.query("SELECT * FROM users WHERE user_name = ?", [user_name]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ success: false, error: "User Not Found or Invalid Username" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(user_password, user.user_password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Invalid Username or password. " });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            role: "user",
            userId: user.id,
            userName: user.user_fullname,
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, error: err.message || "Internal server error." });
    }
};


exports.adminLogin = async (req, res) => {
    try {
        const { admin_email, admin_password } = req.body;
        const [rows] = await pool.query("SELECT * FROM admin WHERE admin_email = ?", [admin_email]);
        const admin = rows[0];
        if (!admin) return res.status(400).json({ error: "Admin Not found" });

        const match = await bcrypt.compare(admin_password, admin.admin_password);
        if (!match) return res.status(400).json({ error: "Password Not match" });

        const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.json({
            success: true,
            message: "Login Successful Welcome Admin",
            token,
            role: "admin",
            adminId: admin.id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};