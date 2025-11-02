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
                ua.is_correct
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
                ta.answer AS correct_answer
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
