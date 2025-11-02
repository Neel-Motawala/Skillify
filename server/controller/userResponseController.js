const pool = require('../config/db');

exports.storeMcq = async (req, res) => {
    try {
        const answers = req.body; // array of user_mcq_ans records
        if (!Array.isArray(answers) || answers.length === 0)
            return res.status(400).json({ error: "No answers provided." });

        const user_test_id = answers[0].user_test_id;

        for (const ans of answers) {
            // fetch correct option from mcq_option table
            const [rows] = await pool.query(
                "SELECT option_text FROM mcq_option WHERE question_id = ? AND is_correct = 1 LIMIT 1",
                [ans.question_id]
            );

            const correctOption = rows.length > 0 ? rows[0].option_text : null;
            const isCorrect = correctOption && ans.user_answer === correctOption;

            // store in user_mcq_ans table
            await pool.query(
                `INSERT INTO user_mcq_ans 
                (user_test_id, question_id, user_answer, is_correct, answered_at) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    ans.user_test_id,
                    ans.question_id,
                    ans.user_answer || null,
                    isCorrect ? 1 : 0,
                    ans.answered_at || new Date(),
                ]
            );
        }

        // Log user activity after successful test submission
        await pool.query(
            `INSERT INTO user_activity_logs 
            (user_test_id, status, status_detail, timestamp)
            VALUES (?, ?, ?, ?)`,
            [user_test_id, "complete", "Test Completed Successfully", new Date()]
        );

        res.status(200).json({ message: "MCQ answers stored successfully and activity logged." });
    } catch (error) {
        console.error("Error saving MCQ answers:", error);
        res.status(500).json({ error: "Failed to store MCQ answers." });
    }
};

