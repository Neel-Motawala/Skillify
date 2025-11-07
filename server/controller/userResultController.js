const pool = require('../config/db');

exports.getMcqResult = async (req, res) => {
    const { userTestId } = req.params;

    try {
        // Fetch MCQ results
        const [mcqResults] = await pool.query(
            `SELECT 
                q.id AS question_id,
                q.question,
                q.type,
                ua.user_answer,
                mo.option_text AS correct_answer,
                ua.is_correct,
                NULL AS answer_score
            FROM user_mcq_ans ua
            JOIN questions q ON ua.question_id = q.id
            LEFT JOIN mcq_option mo 
                ON mo.question_id = q.id AND mo.is_correct = 1
            WHERE ua.user_test_id = ?`,
            [userTestId]
        );

        // Fetch Theory results
        const [theoryResults] = await pool.query(
            `SELECT 
                q.id AS question_id,
                q.question,
                q.type,
                uta.user_answer,
                ta.answer AS correct_answer,
                NULL AS is_correct,
                uta.answer_score
             FROM user_theory_ans uta
             JOIN questions q ON uta.question_id = q.id
             LEFT JOIN theory_answer ta ON ta.question_id = q.id
             WHERE uta.user_test_id = ?`,
            [userTestId]
        );

        // Combine results
        const allResults = [...mcqResults, ...theoryResults];

        res.status(200).json(allResults);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch user results.' });
    }
};


exports.getUserProgress = async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Fetch all user test IDs
        const [tests] = await pool.query(
            `SELECT id FROM user_tests WHERE user_id = ?`,
            [userId]
        );
        if (!tests.length)
            return res.json({
                mcq_average: 0,
                mcq_accuracy: 0,
                theory_average: 0,
                theory_accuracy: 0,
                code_average: 0,
                code_accuracy: 0,
            });

        const testIds = tests.map(t => t.id);

        // 2. MCQ
        const [mcqResults] = await pool.query(
            `SELECT user_test_id,
                    COUNT(*) AS total,
                    SUM(is_correct = 1) AS correct
             FROM user_mcq_ans
             WHERE user_test_id IN (?)
             GROUP BY user_test_id`,
            [testIds]
        );

        const mcq_average = mcqResults.length
            ? mcqResults.reduce((sum, r) => sum + r.correct, 0) / mcqResults.length
            : 0;

        const mcq_accuracy = mcqResults.length
            ? mcqResults.reduce((sum, r) => sum + (r.correct / r.total) * 100, 0) / mcqResults.length
            : 0;

        // 3. THEORY
        const [theoryResults] = await pool.query(
            `SELECT user_test_id, AVG(answer_score) AS avg_score
             FROM user_theory_ans
             WHERE user_test_id IN (?)
             GROUP BY user_test_id`,
            [testIds]
        );

        // Each score 1–10 → convert to percentage by *10
        const theory_average = theoryResults.length
            ? theoryResults.reduce((sum, r) => sum + r.avg_score, 0) / theoryResults.length
            : 0;

        const theory_accuracy = theoryResults.length
            ? theoryResults.reduce((sum, r) => sum + (r.avg_score * 10), 0) / theoryResults.length
            : 0;

        // 4. CODE
        const [codeResults] = await pool.query(
            `SELECT user_test_id,
                    COUNT(*) AS total,
                    SUM(is_correct = 1) AS correct
             FROM user_code_ans
             WHERE user_test_id IN (?)
             GROUP BY user_test_id`,
            [testIds]
        );

        const code_average = codeResults.length
            ? codeResults.reduce((sum, r) => sum + r.correct, 0) / codeResults.length
            : 0;

        const code_accuracy = codeResults.length
            ? codeResults.reduce((sum, r) => sum + (r.correct / r.total) * 100, 0) / codeResults.length
            : 0;

        res.json({
            mcq_average: parseFloat(mcq_average.toFixed(2)),
            mcq_accuracy: parseFloat(mcq_accuracy.toFixed(2)),
            theory_average: parseFloat(theory_average.toFixed(2)),
            theory_accuracy: parseFloat(theory_accuracy.toFixed(2)),
            code_average: parseFloat(code_average.toFixed(2)),
            code_accuracy: parseFloat(code_accuracy.toFixed(2)),
        });
    } catch (err) {
        console.error("Error fetching user progress:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getProfileData = async (req, res) => {
    const { userId } = req.params;

    try {
        // 1) Fetch all user tests grouped by course
        const [userCourses] = await pool.query(
            `SELECT DISTINCT course_id FROM user_tests WHERE user_id = ?`,
            [userId]
        );

        if (!userCourses.length) {
            return res.json({ courses: [] });
        }

        const courseIds = userCourses.map(c => c.course_id);

        // 2) Fetch course details for those IDs
        const [courses] = await pool.query(
            `SELECT id, course_name, image_url
             FROM course
             WHERE id IN (?)`,
            [courseIds]
        );

        const result = [];

        for (const c of courses) {
            // total questions for the course
            const [[{ total_questions }]] = await pool.query(
                `SELECT COUNT(*) AS total_questions FROM questions WHERE course_id = ?`,
                [c.id]
            );

            // user's test IDs and stages for this course
            const [userTests] = await pool.query(
                `SELECT id, stage FROM user_tests WHERE user_id = ? AND course_id = ?`,
                [userId, c.id]
            );

            const userTestIds = userTests.map(t => t.id);
            const completedStages = new Set(userTests.map(t => t.stage)).size;

            let attemptedQ = 0;

            if (userTestIds.length && total_questions > 0) {
                const [rows] = await pool.query(
                    `
                    SELECT COUNT(DISTINCT question_id) AS attempted
                    FROM (
                        SELECT question_id FROM user_mcq_ans WHERE user_test_id IN (?)
                        UNION ALL
                        SELECT question_id FROM user_theory_ans WHERE user_test_id IN (?)
                        UNION ALL
                        SELECT question_id FROM user_code_ans WHERE user_test_id IN (?)
                    ) AS combined
                    `,
                    [userTestIds, userTestIds, userTestIds]
                );

                attemptedQ = parseInt(rows[0].attempted || 0, 10);
            }

            const progressPercent =
                total_questions > 0
                    ? parseFloat(((attemptedQ / total_questions) * 100).toFixed(2))
                    : 0;

            result.push({
                course_id: c.id,
                course_name: c.course_name,
                image_url: c.image_url,
                total_questions,
                attempted_questions: attemptedQ,
                progress_percent: progressPercent,
                completed_stages: completedStages,
            });
        }

        res.json({ courses: result });
    } catch (err) {
        console.error("Error fetching profile data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getCodeTestResults = async (req, res) => {
    try {
        const userTestId = req.params.userTestId;

        if (!userTestId) {
            return res.status(400).json({ error: "Missing userTestId" });
        }

        // -----------------------------
        // Fetch test detail
        // -----------------------------
        const [testRows] = await pool.query(
            `SELECT id, user_id, course_id, test_type, test_mode, stage, timestamp
             FROM user_tests
             WHERE id = ?`,
            [userTestId]
        );

        if (!testRows.length) {
            return res.status(404).json({ error: "Test not found" });
        }

        const testDetail = testRows[0];

        // -----------------------------
        // Fetch all user code attempts
        // -----------------------------
        const [codeRows] = await pool.query(
            `SELECT 
                id,
                question_id,
                user_test_id,
                user_id,
                code_language,
                user_code,
                is_correct,
                runtime_ms,
                memory_kb,
                result_summary,
                timestamp
             FROM user_code_ans
             WHERE user_test_id = ?
             ORDER BY timestamp DESC`,
            [userTestId]
        );

        // Parse JSON summary safely
        const submissions = codeRows.map(r => ({
            ...r,
            result_summary: r.result_summary ? JSON.parse(r.result_summary) : null
        }));

        // -----------------------------
        // Response
        // -----------------------------
        return res.json({
            test: testDetail,
            submissions
        });

    } catch (err) {
        console.error("Fetch code results error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

exports.userTestAborted = async (req, res) => {
    try {
        const { userTestId } = req.params;
        const { status, status_detail } = req.body;

        const sql = `
            INSERT INTO user_activity_logs 
                (user_test_id, status, status_detail, timestamp)
            VALUES (?, ?, ?, ?)
        `;

        await pool.query(sql, [
            userTestId,
            status,
            status_detail,
            new Date()
        ]);

        return res.json({ success: true });
    } catch (err) {
        console.error("Abort log error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

exports.getUserCodeTestResults = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: "Missing userId" });
        }

        // -------------------------------------
        // ✅ Fetch all user test attempts of type "code"
        // -------------------------------------
        const [tests] = await pool.query(
            `
            SELECT 
                id, user_id, course_id, test_type, test_mode, stage, timestamp
            FROM user_tests
            WHERE user_id = ? AND test_type = 'code'
            ORDER BY timestamp DESC
            `,
            [userId]
        );

        if (!tests.length) {
            return res.json([]);
        }

        const finalResponse = [];

        // -------------------------------------
        // ✅ For each test, fetch coding submissions
        // -------------------------------------
        for (const test of tests) {
            const [submissions] = await pool.query(
                `
                SELECT 
                    uca.id,
                    uca.question_id,
                    uca.user_test_id,
                    uca.user_id,
                    uca.code_language,
                    uca.user_code,
                    uca.is_correct,
                    uca.runtime_ms,
                    uca.memory_kb,
                    uca.result_summary,
                    uca.timestamp,
                    cq.question_title
                FROM user_code_ans uca
                JOIN code_question cq ON cq.id = uca.question_id
                WHERE uca.user_test_id = ?
                ORDER BY uca.timestamp DESC
                `,
                [test.id]
            );

            finalResponse.push({
                test: {
                    id: test.id,
                    user_id: test.user_id,
                    course_id: test.course_id,
                    test_type: test.test_type,
                    test_mode: test.test_mode,
                    stage: test.stage,
                    timestamp: test.timestamp,
                },
                submissions: submissions.map((s) => ({
                    id: s.id,
                    question_id: s.question_id,
                    question_title: s.question_title,
                    is_correct: s.is_correct,
                    code_language: s.code_language,
                    runtime_ms: s.runtime_ms,
                    memory_kb: s.memory_kb,
                    result_summary: s.result_summary
                        ? JSON.parse(s.result_summary)
                        : null,
                    timestamp: s.timestamp,
                })),
            });
        }

        return res.json(finalResponse);

    } catch (err) {
        console.error("Fetch code test results error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
