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

exports.getUserTestResult = async (req, res) => {
    try {
        const { userId, userTestId } = req.params;

        if (!userId || !userTestId) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        // -----------------------------
        // Fetch Test Details
        // -----------------------------
        const [testRows] = await pool.query(
            `SELECT * FROM user_tests WHERE id = ? AND user_id = ?`,
            [userTestId, userId]
        );

        if (!testRows.length) {
            return res.status(404).json({ error: "Test not found" });
        }

        const test = testRows[0];

        // -----------------------------
        // Fetch Course Name
        // -----------------------------
        const [courseRows] = await pool.query(
            `SELECT course_name FROM course WHERE id = ?`,
            [test.course_id]
        );

        test.course_name = courseRows.length ? courseRows[0].course_name : "Unknown";

        // -----------------------------
        // Fetch Timeline
        // -----------------------------
        const [logs] = await pool.query(
            `SELECT status, status_detail, timestamp 
             FROM user_activity_logs 
             WHERE user_test_id = ?
             ORDER BY timestamp ASC`,
            [userTestId]
        );

        // Prepare placeholders
        let mcqAns = [], mcqQuestions = [];
        let theoryAns = [], theoryQuestions = [];
        let codeAns = [], codeQuestions = [];

        // -----------------------------
        // Fetch MCQ Answers + Questions
        // -----------------------------
        if (test.test_type === "mcq") {
            [mcqAns] = await pool.query(
                `SELECT * FROM user_mcq_ans WHERE user_test_id = ?`,
                [userTestId]
            );

            if (mcqAns.length > 0) {
                const ids = mcqAns.map(a => a.question_id);
                const [qs] = await pool.query(
                    `SELECT * FROM questions WHERE id IN (${ids.join(",")})`
                );
                mcqQuestions = qs;
            }
        }

        // -----------------------------
        // Fetch Theory Answers + Questions
        // -----------------------------
        if (test.test_type === "theory") {
            [theoryAns] = await pool.query(
                `SELECT * FROM user_theory_ans WHERE user_test_id = ?`,
                [userTestId]
            );

            if (theoryAns.length > 0) {
                const ids = theoryAns.map(a => a.question_id);
                const [qs] = await pool.query(
                    `SELECT * FROM questions WHERE id IN (${ids.join(",")})`
                );
                theoryQuestions = qs;
            }
        }

        // -----------------------------
        // Fetch Code Answers + Questions
        // -----------------------------
        if (test.test_type === "code") {
            [codeAns] = await pool.query(
                `SELECT * FROM user_code_ans WHERE user_test_id = ?`,
                [userTestId]
            );

            if (codeAns.length > 0) {
                const ids = codeAns.map(a => a.question_id);
                const [qs] = await pool.query(
                    `SELECT * FROM code_question WHERE id IN (${ids.join(",")})`
                );
                codeQuestions = qs;

                // Format frontend submissions
                codeAns = codeAns.map(row => {
                    const lang = row.code_language?.toLowerCase();
                    if (["html", "css", "javascript"].includes(lang)) {
                        return {
                            ...row,
                            result_summary: "Frontend code – no backend evaluation"
                        };
                    }

                    try {
                        return {
                            ...row,
                            result_summary: row.result_summary
                                ? JSON.parse(row.result_summary)
                                : null
                        };
                    } catch {
                        return row;
                    }
                });
            }
        }

        // -----------------------------
        // Final JSON Response
        // -----------------------------
        return res.json({
            test,
            logs,
            mcq: { answers: mcqAns, questions: mcqQuestions },
            theory: { answers: theoryAns, questions: theoryQuestions },
            code: { answers: codeAns, questions: codeQuestions }
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

