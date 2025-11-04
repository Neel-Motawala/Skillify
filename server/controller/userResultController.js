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


