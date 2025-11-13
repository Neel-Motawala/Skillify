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
            c.course_name,
            c.image_url,
            c.course_desc,
            c.template,
            c.timestamp AS course_created_at,
            ut.test_type,
            ut.test_mode,
            ut.stage,
            ut.timestamp AS test_created_at,
            GROUP_CONCAT(ual.status ORDER BY ual.timestamp ASC SEPARATOR ', ') AS all_statuses,
            latest.status AS latest_status,
            endlog.end_time
        FROM user_tests ut
        LEFT JOIN course c 
            ON ut.course_id = c.id
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
            WHERE status = 'complete' Or status = 'abort'
            GROUP BY user_test_id
        ) AS endlog 
            ON endlog.user_test_id = ut.id
        WHERE ut.user_id = ?
        GROUP BY ut.id
        ORDER BY ut.timestamp DESC;
    `;

    try {
        const [rows] = await pool.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching user tests:", err);
        res.status(500).json({ message: "Error fetching user tests" });
    }
};

exports.getCodeTestResult = async (req, res) => {
    try {
        const { id, codeTestId } = req.params; // id = courseId, codeTestId = user_test_id

        if (!id || !codeTestId) {
            return res.status(400).json({ error: "Missing parameters: courseId or codeTestId" });
        }

        // -----------------------------
        // Fetch test detail
        // -----------------------------
        const [testRows] = await pool.query(
            `SELECT id, user_id, course_id, test_type, test_mode, stage, timestamp
             FROM user_tests
             WHERE id = ? AND course_id = ?`,
            [codeTestId, id]
        );

        if (!testRows.length) {
            return res.status(404).json({ error: "Test not found for this course" });
        }

        const testDetail = testRows[0];

        // -----------------------------
        // Fetch all user code submissions + question details
        // -----------------------------
        const [codeRows] = await pool.query(
            `SELECT 
                uca.id,
                uca.question_id,
                cq.question_title,
                cq.question,
                uca.user_test_id,
                uca.user_id,
                uca.code_language,
                uca.user_code,
                uca.is_correct,
                uca.runtime_ms,
                uca.memory_kb,
                uca.result_summary,
                uca.timestamp
             FROM user_code_ans AS uca
             LEFT JOIN code_question AS cq ON cq.id = uca.question_id
             WHERE uca.user_test_id = ?
             ORDER BY uca.timestamp DESC`,
            [codeTestId]
        );

        if (!codeRows.length) {
            return res.status(404).json({ error: "No submissions found for this test" });
        }

        // -----------------------------
        // Parse result_summary safely
        // -----------------------------
        const formattedResults = codeRows.map((r) => {
            const lang = r.code_language?.toLowerCase() || "";

            // Frontend submissions don’t need JSON parsing
            if (["html", "css", "javascript"].includes(lang)) {
                return {
                    ...r,
                    result_summary: "Frontend submission (no backend evaluation)",
                };
            }

            // Attempt JSON parse for backend results
            let parsedSummary = null;
            try {
                parsedSummary = r.result_summary ? JSON.parse(r.result_summary) : null;
            } catch {
                parsedSummary = r.result_summary; // fallback to raw text
            }

            return { ...r, result_summary: parsedSummary };
        });

        // -----------------------------
        // Final response
        // -----------------------------
        return res.json({
            success: true,
            test: testDetail,
            submissions: formattedResults,
        });

    } catch (err) {
        console.error("Error fetching code test result:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};



