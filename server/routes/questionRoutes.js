const express = require('express');
const router = express.Router();

const { getStage, getQuestions, addMCQ, addTheory } = require('../controller/questionController');

// Specific routes first
router.post("/add-mcq", addMCQ);
router.post("/add-theory", addTheory);
router.get("/:courseId/questions", getQuestions);
router.get("/:courseId", getStage);

module.exports = router;
