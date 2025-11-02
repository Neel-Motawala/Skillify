const pool = require("../config/db");

// controller/userTestController.js
exports.startTest = async (req, res) => {
    const { user_id, course_id, test_type, test_mode, stage } = req.body;

    if (!user_id || !course_id || !test_type || !test_mode || !stage) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const type = String(test_type).toLowerCase();
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1) Insert user_tests
        const [testResult] = await conn.query(
            `INSERT INTO user_tests (user_id, course_id, test_type, test_mode, stage, timestamp)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [user_id, course_id, type, test_mode, stage]
        );

        const userTestId = testResult.insertId;
        if (!userTestId) throw new Error("Failed to insert user_tests");

        // 2) Insert only "start" log
        await conn.query(
            `INSERT INTO user_activity_logs (user_test_id, status, status_detail, timestamp)
             VALUES (?, 'start', 'User started the test', NOW())`,
            [userTestId]
        );

        await conn.commit();

        res.status(201).json({
            message: "Test started successfully",
            user_test_id: userTestId,
        });
    } catch (error) {
        if (conn) {
            try { await conn.rollback(); } catch (e) { console.error("Rollback failed:", e); }
        }
        console.error("Error starting test:", error);
        res.status(500).json({ message: "Error starting test", error: error.message || error });
    } finally {
        if (conn) conn.release();
    }
};

exports.inProgress = async (req, res) => {
    const { user_test_id } = req.body;

    if (!user_test_id) {
        return res.status(400).json({ message: "Missing user_test_id" });
    }

    try {
        await pool.query(
            `INSERT INTO user_activity_logs (user_test_id, status, status_detail, timestamp)
             VALUES (?, 'in_progress', 'User is currently taking the test', NOW())`,
            [user_test_id]
        );

        res.status(201).json({ message: "In-progress status recorded successfully" });
    } catch (error) {
        console.error("Error recording in-progress status:", error);
        res.status(500).json({ message: "Error recording in-progress status", error });
    }
};

exports.getUserTestId = async (req, res) => {
    const { userTestId } = req.params;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM user_tests WHERE id = ?",
            [userTestId]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: "Test not found" });

        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching test:", err);
        res.status(500).json({ message: "Error fetching test" });
    }
};

exports.getUserTests = async (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT 
            ut.id,
            ut.user_id,
            ut.course_id,
            ut.test_type,
            ut.test_mode,
            ut.stage,
            ut.timestamp,
            GROUP_CONCAT(ual.status ORDER BY ual.timestamp ASC SEPARATOR ', ') AS all_statuses,
            latest.status AS latest_status,
            endlog.end_time
        FROM user_tests ut
        LEFT JOIN user_activity_logs ual 
            ON ual.user_test_id = ut.id
        LEFT JOIN (
            SELECT u1.user_test_id, u1.status
            FROM user_activity_logs u1
            INNER JOIN (
                SELECT user_test_id, MAX(timestamp) AS maxts
                FROM user_activity_logs
                GROUP BY user_test_id
            ) AS u2 
            ON u1.user_test_id = u2.user_test_id AND u1.timestamp = u2.maxts
        ) AS latest 
            ON latest.user_test_id = ut.id
        LEFT JOIN (
            SELECT user_test_id, MAX(timestamp) AS end_time
            FROM user_activity_logs
            WHERE status = 'complete'
            GROUP BY user_test_id
        ) AS endlog 
            ON endlog.user_test_id = ut.id
        WHERE ut.user_id = ?
        GROUP BY ut.id
        ORDER BY ut.timestamp DESC;
    `;

    try {
        const [rows] = await pool.query(sql, [userId]);
        // console.log(rows);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching user tests:", err);
        res.status(500).json({ message: "Error fetching user tests" });
    }
};

