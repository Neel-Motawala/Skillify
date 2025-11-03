const pool = require('../config/db');
const axios = require("axios");

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

exports.storeTheory = async (req, res) => {
    try {
        const theoryData = req.body; // array of { user_test_id, question_id, user_answer, timestamp }

        if (!Array.isArray(theoryData) || theoryData.length === 0) {
            return res.status(400).json({ error: "No theory data provided" });
        }

        const user_test_id = theoryData[0].user_test_id; // same for all entries

        for (const entry of theoryData) {
            const { question_id, user_answer, timestamp } = entry;

            // 1. Fetch original answer
            const [originalRows] = await pool.execute(
                "SELECT answer FROM theory_answer WHERE question_id = ? LIMIT 1",
                [question_id]
            );

            if (originalRows.length === 0) {
                console.warn(`No reference answer found for question_id: ${question_id}`);
                continue;
            }

            const originalAnswer = originalRows[0].answer;

            // 2. Send both answers to Python AI model
            let aiScore = 0;
            try {
                const aiRes = await axios.post("http://localhost:5005/evaluate", {
                    originalAnswer: originalAnswer,
                    userAnswer: user_answer,
                });

                if (aiRes.data && aiRes.data.success) {
                    aiScore = aiRes.data.finalScore || 0;
                    console.log(`AI evaluation for Q${question_id}:`, aiRes.data.details);
                } else {
                    console.warn(`AI model returned unexpected response for Q${question_id}`);
                }
            } catch (err) {
                console.error("AI model error:", err.message);
                aiScore = 0;
            }

            // 3. Store user answer with AI score
            await pool.execute(
                `INSERT INTO user_theory_ans 
                (question_id, user_test_id, user_answer, answer_score, timestamp)
                VALUES (?, ?, ?, ?, ?)`,
                [question_id, user_test_id, user_answer, aiScore, timestamp]
            );
        }

        // 4. Log test completion once
        await pool.execute(
            `INSERT INTO user_activity_logs 
            (user_test_id, status, status_detail, timestamp)
            VALUES (?, ?, ?, ?)`,
            [user_test_id, "complete", "Test Completed Successfully", new Date()]
        );

        res.status(200).json({
            message: "Theory responses stored, evaluated, and activity logged successfully",
        });
    } catch (error) {
        console.error("Error storing theory response:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


