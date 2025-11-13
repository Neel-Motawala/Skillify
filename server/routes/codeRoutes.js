const express = require("express");
const router = express.Router();

const {
    runCode,
    submitCode,
    getCodeQuestion,
    addCodeQuestion,
    addTestCode,
    getCodeStages,
    getSpecificCodeQuestion,
    codeTestComplete,
    submitFrontendCode
} = require("../controller/codeController");


// ======================
// ✅ GET ROUTES
// ======================

// 1. Get all stages for a course
// API: GET http://localhost:5000/api/code/stages/:courseId
router.get("/code/stages/:courseId", getCodeStages);

// 2. Get all code questions for a stage
// API: GET http://localhost:5000/api/code/:courseId/:stage
router.get("/code/:courseId/:stage", getCodeQuestion);


// 3. Get specific code questions for a stage
// API: GET http://localhost:5000/api/code/:courseId/:stage/:questionId
router.get("/code/:courseId/:stage/:questionId", getSpecificCodeQuestion);

// router.get("/code/result/:userTestId/:questionId",);


// ======================
// ✅ POST ROUTES
// ======================

// 3. Add a new code question
router.post("/code/add_code", addCodeQuestion);

// 4. Add test cases for a question
router.post("/code/add_test_code", addTestCode);

// 5. Run code (live run)
router.post("/run", runCode);

// 6. Submit code (evaluate test cases)
router.post("/submit", submitCode);

// POST http://localhost:5000/api/code/submit_frontend_code
router.post("/code/submit_frontend_code", submitFrontendCode);

// POST http://localhost:5000/api/code/test-complete/:userTestId
router.post("/code/test-complete/:userTestId", codeTestComplete);

module.exports = router;
