const pool = require('../config/db');

exports.getStage = async (req, res) => {
    const { courseId } = req.params;
    const { type } = req.query;

    try {
        const [rows] = await pool.query(
            `SELECT stage, type 
            FROM questions 
            WHERE course_id = ? AND LOWER(type) = LOWER(?) 
            GROUP BY stage, type`,
            [courseId, type]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching stages:", error);
        res.status(500).json({ message: "Error fetching stages" });
    }
};


exports.getQuestions = async (req, res) => {
    const { courseId } = req.params;
    const { type, stage } = req.query;

    if (!type || !["mcq", "theory", "code"].includes(type.toLowerCase())) {
        return res.status(400).json({ error: "Invalid question type" });
    }

    try {
        // Fetch base questions
        const [questions] = await pool.query(
            "SELECT * FROM questions WHERE course_id = ? AND type = ? AND stage = ?",
            [courseId, type.toLowerCase(), stage]
        );

        if (type.toLowerCase() === "mcq") {
            // MCQ type
            for (const q of questions) {
                const [options] = await pool.query(
                    "SELECT option_text, is_correct FROM mcq_option WHERE question_id = ?",
                    [q.id]
                );
                q.options = options;
            }
        } else if (type.toLowerCase() === "theory") {
            // Theory type
            for (const q of questions) {
                const [ans] = await pool.query(
                    "SELECT answer FROM theory_answer WHERE question_id = ? LIMIT 1",
                    [q.id]
                );
                q.answer = ans[0]?.answer || null;
            }
        }

        res.json({ questions });
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ error: "Error fetching questions" });
    }
};



exports.addMCQ = async (req, res) => {
    const { course_id, stage, question, options, answer } = req.body;

    try {
        // Step 1: Insert question into "questions" table
        const [questionResult] = await pool.query(
            "INSERT INTO questions (course_id, question, type, stage, created_at) VALUES (?, ?, ?, ?, NOW())",
            [course_id, question, "mcq", stage] // 1 = MCQ type
        );

        const questionId = questionResult.insertId;

        // Step 2: Insert all options into "mcq_option" table
        for (const opt of options) {
            const isCorrect = opt.trim() === answer.trim() ? 1 : 0;
            await pool.query(
                "INSERT INTO mcq_option (question_id, option_text, is_correct, timestamp) VALUES (?, ?, ?, NOW())",
                [questionId, opt, isCorrect]
            );
        }

        res.status(201).json({ message: "MCQ added successfully" });
    } catch (err) {
        console.error("Error adding MCQ:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.addTheory = async (req, res) => {
    try {
        const { course_id, stage, question, answer } = req.body;

        if (!course_id || !stage || !question || !answer) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Insert into questions table
        const [questionResult] = await pool.query(
            "INSERT INTO questions (course_id, question, type, stage, created_at) VALUES (?, ?, ?, ?, NOW())",
            [course_id, question, "theory", stage]
        );

        const question_id = questionResult.insertId;

        // Insert into theory_answer table
        await pool.query(
            "INSERT INTO theory_answer (question_id, answer, timestamp) VALUES (?, ?, NOW())",
            [question_id, answer]
        );

        res.status(201).json({ message: "Theory question added successfully" });
    } catch (err) {
        console.error("Error adding theory question:", err);
        res.status(500).json({ error: "Server error" });
    }
};