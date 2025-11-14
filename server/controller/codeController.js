const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db"); // MySQL2 connection pool


// Helper: safely delete temp directory
async function cleanup(dir) {
    try {
        await fs.remove(dir);
    } catch { }
}

async function runInDocker(code, stdin = "", language) {
    language = language.toLowerCase();

    const jobId = uuidv4();
    const tempDir = path.join(__dirname, "..", "temp", jobId);
    await fs.ensureDir(tempDir);

    const inputPath = path.join(tempDir, "input.txt");
    await fs.writeFile(inputPath, stdin || "");

    let fileName = "";
    let runScript = "";

    try {
        switch (language) {
            case "java":
                fileName = "Main.java";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    javac Main.java 2>&1
                    /usr/bin/time -v java Main < input.txt
                `;
                break;

            case "python":
                fileName = "main.py";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    /usr/bin/time -v python3 main.py < input.txt
                `;
                break;

            case "c":
                fileName = "main.c";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    gcc main.c -o main.out 2>&1
                    /usr/bin/time -v ./main.out < input.txt
                `;
                break;

            case "cpp":
                fileName = "main.cpp";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    g++ main.cpp -o main.out 2>&1
                    /usr/bin/time -v ./main.out < input.txt
                `;
                break;

            case "php":
                fileName = "index.php";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    /usr/bin/time -v php index.php < input.txt
                `;
                break;

            case "javascript":
                fileName = "main.js";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    /usr/bin/time -v node main.js < input.txt
                `;
                break;

            case "html":
                fileName = "index.html";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    echo "HTML executed"
                    cat index.html
                `;
                break;

            case "css":
                fileName = "style.css";
                await fs.writeFile(path.join(tempDir, fileName), code);
                runScript = `
                    #!/bin/sh
                    cd /sandbox
                    echo "CSS executed"
                    cat style.css
                `;
                break;

            default:
                await cleanup(tempDir);
                return { stdout: "", stderr: "Unsupported language" };
        }

        const scriptPath = path.join(tempDir, "run.sh");
        await fs.writeFile(scriptPath, runScript);
        await fs.chmod(scriptPath, 0o755);

        const cmd = `docker run --rm --network none --memory=256m --cpus=0.5 \
            -v "${tempDir}:/sandbox" skillify-runner sh /sandbox/run.sh`;

        const start = Date.now();

        return await new Promise((resolve) => {
            exec(cmd, { timeout: 10000 }, async (err, stdout, stderr) => {
                const end = Date.now();
                await cleanup(tempDir);

                // Extract memory (kbytes)
                const memMatch = stderr.match(/Maximum resident set size.*?:\s*(\d+)/i);
                let memoryKB = memMatch ? parseInt(memMatch[1]) : 0;

                // Remove /usr/bin/time report to get REAL error
                const cleanError = stderr
                    .replace(/Command being timed:[\s\S]*/gi, "") // remove full time block
                    .trim();

                resolve({
                    stdout: stdout?.trim() || "",
                    stderr: cleanError, // only real error
                    time_ms: end - start,
                    memory_kb: memoryKB
                });
            });
        });

    } catch (error) {
        await cleanup(tempDir);
        return { stdout: "", stderr: "Execution error: " + error.message };
    }
}



exports.runCode = async (req, res) => {
    try {
        let { language, code, stdin } = req.body;
        language = (language || "").toLowerCase();

        if (!language || !code) {
            return res.status(400).json({ error: "Missing language or code" });
        }

        const supported = ["java", "python", "c", "cpp", "php", "javascript", "html", "css"];
        if (!supported.includes(language)) {
            return res.status(400).json({ error: `Unsupported language: ${language}` });
        }

        const result = await runInDocker(code, stdin || "", language);

        return res.json(result);

    } catch (err) {
        console.error("Run error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};



exports.submitCode = async (req, res) => {
    try {
        let { language, code, question_id, user_id, user_test_id } = req.body;
        language = (language || "").toLowerCase();

        if (!language || !code || !question_id || !user_id || !user_test_id) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const [testCases] = await pool.query(
            "SELECT input, expected_output FROM code_test_case WHERE question_id = ?",
            [question_id]
        );

        if (!testCases.length) {
            return res.json({ message: "No test cases found", results: [] });
        }

        let allPassed = true;
        const results = [];

        for (const tc of testCases) {
            const input = (tc.input || "").trim();
            const expected = (tc.expected_output || "").trim();

            const { stdout, stderr, time_ms, memory_kb } =
                await runInDocker(code, input, language);

            const passed = !stderr && stdout === expected;
            if (!passed) allPassed = false;

            results.push({
                input,
                expected,
                output: stdout,
                error: stderr || null,
                passed,
                runtime_ms: time_ms,
                memory_kb
            });
        }

        const summary = {
            total_tests: results.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length
        };

        const avgRuntime = Math.round(results.reduce((a, b) => a + b.runtime_ms, 0) / results.length);
        const avgMemory = Math.round(results.reduce((a, b) => a + b.memory_kb, 0) / results.length);

        if (allPassed) {
            await pool.query(
                `INSERT INTO user_code_ans 
                (question_id, user_test_id, user_id, code_language, user_code, is_correct, runtime_ms, memory_kb, result_summary)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    question_id,
                    user_test_id,
                    user_id,
                    language,
                    code,
                    1,
                    avgRuntime,
                    avgMemory,
                    JSON.stringify(summary)
                ]
            );
        }

        let message;
        if (results.some(r => r.error)) {
            const firstErr = results.find(r => r.error);
            message = `Runtime or compilation error: ${firstErr.error}`;
        } else if (!allPassed) {
            message = `Some test cases failed (${summary.failed}/${summary.total_tests}).`;
        } else {
            message = "Code is correct — all test cases passed.";
        }

        return res.json({
            success: allPassed,
            message,
            summary,
            results
        });

    } catch (err) {
        console.error("Submit error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};




exports.getCodeQuestion = async (req, res) => {
    try {
        const { courseId, stage } = req.params;

        if (!courseId || !stage) {
            return res.status(400).json({ error: "courseId and stage are required" });
        }

        // ✅ 1. Fetch code questions for this course + stage
        const [questions] = await pool.query(
            `
            SELECT *
            FROM code_question
            WHERE course_id = ? AND stage = ?
            ORDER BY id ASC
            `,
            [courseId, stage]
        );

        if (questions.length === 0) {
            return res.json({ success: true, questions: [] });
        }

        // ✅ 2. Fetch test cases for each question
        for (const q of questions) {
            const [testCases] = await pool.query(
                `
                SELECT id, input, expected_output, rule_type, rule_value, is_sample
                FROM code_test_case
                WHERE question_id = ?
                ORDER BY id ASC
                `,
                [q.id]
            );

            q.test_cases = testCases;
        }

        // ✅ 3. Send response
        return res.json({
            success: true,
            questions
        });

    } catch (err) {
        console.error("Get code question error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


exports.getSpecificCodeQuestion = async (req, res) => {
    try {
        const { courseId, stage, questionId } = req.params;

        if (!courseId || !stage || !questionId) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // ✅ Fetch specific question
        const [rows] = await pool.query(
            `SELECT *
             FROM code_question
             WHERE id = ? AND course_id = ? AND stage = ?
             LIMIT 1`,
            [questionId, courseId, stage]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Question not found" });
        }

        const question = rows[0];

        // ✅ Fetch its test cases
        const [testCases] = await pool.query(
            `SELECT id, input, expected_output, rule_type, rule_value, is_sample
             FROM code_test_case
             WHERE question_id = ?
             ORDER BY id ASC`,
            [questionId]
        );

        question.test_cases = testCases;

        return res.json({
            success: true,
            question
        });

    } catch (err) {
        console.error("Get specific code question error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


exports.getCodeStages = async (req, res) => {
    try {
        const { courseId } = req.params;

        const [rows] = await pool.query(
            "SELECT stage, COUNT(*) AS total FROM code_question WHERE course_id = ? GROUP BY stage ORDER BY stage ASC",
            [courseId]
        );

        return res.json({ stages: rows });
    } catch (err) {
        console.error("Get code stages error:", err);
        res.status(500).json({ error: "Server error" });
    }
};


exports.addCodeQuestion = async (req, res) => {
    try {
        const {
            course_id,
            stage,
            question_title,
            question,
            require_import,
            function_template,
            user_input,
            return_type,
            time_limit_ms,
            memory_limit_kb,
            html_template,
            css_template,
            js_template
        } = req.body;

        if (!course_id || !stage || !question_title || !question) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const sql = `
            INSERT INTO code_question 
            (
                course_id, stage, question_title, question,
                require_import, function_template, user_input,
                return_type, time_limit_ms, memory_limit_kb,
                html_template, css_template, js_template, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const params = [
            course_id,
            stage,
            question_title,
            question,
            require_import || "",
            function_template || "",
            user_input || "",
            return_type || "",
            time_limit_ms || 2000,
            memory_limit_kb || 128000,
            html_template || "",
            css_template || "",
            js_template || ""
        ];

        const [result] = await pool.query(sql, params);

        return res.json({
            success: true,
            message: "Code question added",
            question_id: result.insertId
        });

    } catch (err) {
        console.error("Add code_question error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


exports.addTestCode = async (req, res) => {
    try {
        const { question_id, test_cases } = req.body;

        if (!question_id || !Array.isArray(test_cases) || test_cases.length === 0) {
            return res.status(400).json({ error: "Invalid test case data" });
        }

        const sql = `
            INSERT INTO code_test_case 
            (question_id, input, expected_output, rule_type, rule_value, is_sample, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        for (const tc of test_cases) {
            const params = [
                question_id,
                tc.input || "",
                tc.expected_output || "",
                tc.rule_type || "",
                tc.rule_value || "",
                tc.is_sample || 0
            ];

            await pool.query(sql, params);
        }

        return res.json({
            success: true,
            message: "Test cases added successfully"
        });

    } catch (err) {
        console.error("Add test cases error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


exports.codeTestComplete = async (req, res) => {
    try {
        const { userTestId } = req.params;

        if (!userTestId) {
            return res.status(400).json({ error: "Missing userTestId" });
        }

        // Insert activity log
        await pool.query(
            `INSERT INTO user_activity_logs 
             (user_test_id, status, status_detail, timestamp) 
             VALUES (?, ?, ?, now())`,
            [userTestId, "complete", "Test Completed Successfully"]
        );

        return res.json({
            success: true,
            message: "Test completion recorded"
        });

    } catch (err) {
        console.error("Test complete error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};


exports.submitFrontendCode = async (req, res) => {
    try {
        const { question_id, language, code, user_id, user_test_id } = req.body;

        if (!question_id || !language || !code || !user_id || !user_test_id) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // ✅ Check for existing record
        const [existing] = await pool.execute(
            `SELECT id FROM user_code_ans 
             WHERE user_id = ? AND user_test_id = ? AND question_id = ?`,
            [user_id, user_test_id, question_id]
        );

        if (existing.length > 0) {
            // ✅ Update existing record
            await pool.execute(
                `UPDATE user_code_ans 
                 SET user_code = ?, 
                     code_language = ?, 
                     is_correct = 1, 
                     runtime_ms = 0, 
                     memory_kb = 0, 
                     result_summary = 'Frontend submission saved',
                     timestamp = NOW()
                 WHERE id = ?`,
                [code, language, existing[0].id]
            );
        } else {
            // ✅ Insert new record
            await pool.execute(
                `INSERT INTO user_code_ans 
                 (question_id, user_test_id, user_id, code_language, user_code, is_correct, runtime_ms, memory_kb, result_summary, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    question_id,
                    user_test_id,
                    user_id,
                    language,
                    code,
                    1,               // Mark as correct by default (frontend check)
                    0,               // runtime_ms default
                    0,               // memory_kb default
                    "Frontend code stored successfully"
                ]
            );
        }

        return res.json({
            success: true,
            message: "✅ Frontend code saved successfully.",
        });
    } catch (err) {
        console.error("Error saving frontend code:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

