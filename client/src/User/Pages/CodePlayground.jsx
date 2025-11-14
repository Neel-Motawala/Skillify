// client/src/Pages/CodePlayground.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import CodeEditor from "../Components/CodeEditor/CodeEditor";
import styles from "../Styles/CodePlayground/CodePlayground.module.css";

import prettier from "prettier/standalone";
import * as prettierPluginBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettierPluginHTML from "prettier/plugins/html";
import * as prettierPluginPostCSS from "prettier/plugins/postcss";
import * as prettierPluginTypeScript from "prettier/plugins/typescript";
import pluginJava from "prettier-plugin-java";

// ----------------------------------------
// Monaco language mapping
// ----------------------------------------
const monacoLanguageMap = {
    html: "html",
    css: "css",
    javascript: "javascript",
    java: "java",
    python: "python",
    php: "php",
    c: "c",
    cpp: "cpp",
};

// ----------------------------------------
// Prettier config by language
// ----------------------------------------
const getPrettierConfigForLanguage = (lang) => {
    const commonPlugins = [
        prettierPluginBabel,
        prettierPluginEstree,
        prettierPluginHTML,
        prettierPluginPostCSS,
        prettierPluginTypeScript,
    ];

    switch (lang) {
        case "java":
            return { parser: "java", plugins: [pluginJava], printWidth: 100, tabWidth: 4 };
        case "javascript":
            return { parser: "babel", plugins: commonPlugins };
        case "typescript":
            return { parser: "typescript", plugins: commonPlugins };
        case "html":
            return { parser: "html", plugins: commonPlugins };
        case "css":
            return { parser: "css", plugins: commonPlugins };
        default:
            return null; // Unsupported languages (python,c,cpp,php)
    }
};

export default function CodePlayground() {
    const { courseId, userTestId, questionId } = useParams();
    const navigate = useNavigate();

    const [stage, setStage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [question, setQuestion] = useState(null);
    const [courseLang, setCourseLang] = useState("javascript");

    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const monacoLang = monacoLanguageMap[courseLang] || "plaintext";
    const previewRef = useRef(null); // for iframe preview

    // ---------------------------------------------------
    // Fetch stage and user_id
    // ---------------------------------------------------
    useEffect(() => {
        const loadStage = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user-test/test/${userTestId}`);
                setStage(res.data.stage);
                setUserId(res.data.user_id);
            } catch {
                setError("Failed to load stage");
            }
        };
        if (userTestId) loadStage();
    }, [userTestId]);

    // ---------------------------------------------------
    // Fetch course + question + prepare template
    // ---------------------------------------------------
    useEffect(() => {
        const loadQuestion = async () => {
            try {
                const courseRes = await axios.get(`http://localhost:5000/api/course/${courseId}`);

                let language = courseRes.data.course_name.toLowerCase();
                if (language.includes("c++")) language = "cpp";
                else if (language.includes("c language")) language = "c";
                else if (language === "c-lang") language = "c";
                else if (language === "cpp-lang") language = "cpp";

                setCourseLang(language);

                const template = courseRes.data?.template || "";

                const qRes = await axios.get(
                    `http://localhost:5000/api/code/${courseId}/${stage}/${questionId}`
                );

                const q = qRes.data.question;
                setQuestion(q);

                // =======================================================
                // FRONTEND LANGUAGES (HTML / CSS / JAVASCRIPT)
                // =======================================================
                if (["html", "css", "javascript"].includes(language)) {
                    // Merge all code parts into the full HTML template
                    let finalCode = template
                        .replace("__HTML__", q.html_template || "")
                        .replace("__CSS__", q.css_template || "")
                        .replace("__JS__", q.js_template || "");

                    // Format the entire HTML document
                    try {
                        finalCode = await prettier.format(finalCode, {
                            parser: "html",
                            plugins: [
                                prettierPluginBabel,
                                prettierPluginEstree,
                                prettierPluginHTML,
                                prettierPluginPostCSS,
                                prettierPluginTypeScript,
                            ],
                            tabWidth: 4,
                            printWidth: 100,
                        });
                    } catch {
                        // If formatting fails, still show raw code
                    }

                    setCode(finalCode);
                    return;
                }

                // =======================================================
                // BACKEND LANGUAGES (C, C++, JAVA, PYTHON, PHP, ETC.)
                // =======================================================
                let finalCode = template
                    .replace("__IMPORT_CLASSES__", q.require_import || "")
                    .replace("__USER_INPUT__", q.user_input || "")
                    .replace("__FUNCTION_TEMPLATE__", q.function_template || "");

                let formatted = finalCode;
                const cfg = getPrettierConfigForLanguage(language);

                if (cfg) {
                    try {
                        formatted = await prettier.format(finalCode, cfg);
                    } catch {
                        formatted = finalCode;
                    }
                }

                setCode(formatted);
                if (q.test_cases?.length > 0) setInput(q.test_cases[0].input);

            } catch {
                setError("Failed to load question");
            }
        };

        if (courseId && stage && questionId) loadQuestion();
    }, [courseId, stage, questionId]);




    // ---------------------------------------------------
    // Format Code
    // ---------------------------------------------------
    const handleFormat = async () => {
        const cfg = getPrettierConfigForLanguage(courseLang);
        if (!cfg) return;

        try {
            const formatted = await prettier.format(code, cfg);
            setCode(formatted);
        } catch {
            /* ignore formatting error */
        }
    };

    // ---------------------------------------------------
    // Run Code (backend + frontend logic)
    // ---------------------------------------------------
    const handleRun = async () => {
        setLoading(true);
        setOutput("");

        // -----------------------------
        // Frontend languages (HTML, CSS, JS)
        // -----------------------------
        if (["html", "css", "javascript"].includes(courseLang)) {
            const iframe = previewRef.current;
            if (!iframe) {
                setLoading(false);
                return;
            }

            // The "code" already contains full HTML template with CSS + JS placeholders replaced
            // Just run the complete code directly
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(code);
            iframeDoc.close();

            setOutput("✅ Executed in browser preview");
            setLoading(false);
            return;
        }

        // -----------------------------
        // Backend languages (C, C++, Java, Python, PHP)
        // -----------------------------
        const normalizedLang = courseLang === "c language" ? "c" : courseLang;

        try {
            const res = await axios.post("http://localhost:5000/api/run", {
                language: normalizedLang,
                code,
                stdin: input,
            });
            setOutput(res.data.stdout || res.data.stderr || "No output");
        } catch {
            setOutput("Error running code");
        } finally {
            setLoading(false);
        }
    };


    // ---------------------------------------------------
    // Submit Code (backend + frontend)
    // ---------------------------------------------------
    const handleSubmit = async () => {
        setLoading(true);
        setOutput("");

        // Direct frontend submit simulation
        if (["html", "css", "javascript"].includes(courseLang)) {
            const normalizedLang = courseLang === "c language" ? "c" : courseLang;
            try {
                await axios.post("http://localhost:5000/api/code/submit_frontend_code", {
                    question_id: questionId,
                    language: normalizedLang,
                    code,
                    user_id: userId,
                    user_test_id: userTestId,
                });

                setOutput("✅ Frontend code saved successfully.");
                setTimeout(() => {
                    navigate(`/dashboard/course/${courseId}/code/${userTestId}`, { replace: true });
                }, 1000);
            } catch {
                setOutput("❌ Failed to save frontend code.");
            } finally {
                setLoading(false);
            }
            return;
        }


        // Backend submission
        const normalizeLanguage = (lang) => {
            const lower = lang.toLowerCase().trim();

            if (lower === "c language" || lower === "c") return "c";
            if (lower === "cpp" || lower === "c++" || lower === "c++ language") return "cpp";
            if (lower === "javascript" || lower === "js") return "javascript";
            if (lower === "python" || lower === "py") return "python";

            return lower; // fallback
        };

        const normalizedLang = normalizeLanguage(courseLang);

        try {
            const res = await axios.post("http://localhost:5000/api/submit", {
                question_id: questionId,
                language: normalizedLang,
                code,
                user_id: userId,
                user_test_id: userTestId,
            });

            // Backend error
            if (res.data.error) {
                setOutput(`⚠ ${res.data.error}`);
                return;
            }

            const { success, message, results } = res.data;

            // Runtime or Compilation error in one of the testcases
            if (results?.some((r) => r.error)) {
                const firstErr = results.find((r) => r.error)?.error || "Runtime error";
                setOutput(`⚠ Runtime/Compilation Error:\n${firstErr}`);
                return;
            }

            // Some testcases failed
            if (!success) {
                setOutput(`❌ ${message}`);
                return;
            }

            // All passed
            setOutput(`✅ ${message}`);

            setTimeout(() => {
                navigate(`/dashboard/course/${courseId}/code/${userTestId}`, { replace: true });
            }, 1000);

        } catch (err) {
            setOutput(err.response?.data?.error || "Unexpected Error");
        } finally {
            setLoading(false);
        }

    };

    // ---------------------------------------------------
    // Render
    // ---------------------------------------------------
    if (error) return <p className={styles.error}>{error}</p>;
    if (!stage || !question) return <p className={styles.loading}>Loading...</p>;

    return (
        <div className={styles.layout}>
            <div className={styles.headerRow}>
                <button
                    className={styles.backBtn}
                    onClick={() =>
                        navigate(`/dashboard/course/${courseId}/code/${userTestId}`, { replace: true })
                    }
                >
                    ← Back
                </button>

                <div className={styles.titleBox}>
                    <h2 className={styles.title}>{question.question_title}</h2>
                    <p className={styles.desc}>{question.question}</p>
                </div>

                <div className={styles.formatRow}>
                    <button className={styles.formatBtn} onClick={handleFormat}>
                        Format
                    </button>
                </div>
            </div>

            <div className={styles.editorLayout}>
                <div
                    className={`${styles.leftPane} ${["html", "css", "javascript"].includes(courseLang)
                        ? styles.wideEditor
                        : styles.normalEditor
                        }`}
                >
                    <CodeEditor
                        code={code}
                        language={monacoLang}
                        onChange={(v) => setCode(v ?? "")}
                    />
                </div>

                <div
                    className={`${styles.rightPane} ${["html", "css", "javascript"].includes(courseLang)
                        ? styles.previewMode
                        : styles.outputMode
                        }`}
                >

                    {!["html", "css", "javascript"].includes(courseLang) && (
                        <>
                            <div className={styles.inputBox}>
                                <h4>Input</h4>
                                <textarea
                                    className={styles.textarea}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                            </div>
                            <div className={styles.outputBox}>
                                <h4>Output</h4>
                                <textarea
                                    className={`${styles.textarea} ${styles.outputArea}`}
                                    readOnly
                                    value={loading ? "Running..." : output}
                                />
                            </div>
                        </>
                    )}

                    {["html", "css", "javascript"].includes(courseLang) && (
                        <div className={styles.previewBox}>
                            <h4>Preview</h4>
                            <iframe
                                title="preview"
                                className={styles.previewFrame}
                                sandbox="allow-scripts allow-same-origin"
                                ref={previewRef}
                            />
                        </div>
                    )}
                </div>
            </div>



            <div className={styles.buttonContainer}>
                <button className={styles.button} disabled={loading} onClick={handleRun}>
                    Run
                </button>
                <button className={styles.button} disabled={loading} onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    );
}
