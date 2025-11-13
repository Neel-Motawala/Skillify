const express = require('express');
const router = express.Router();

const { startTest, inProgress, getUserTestId, getUserTests, getCodeTestResult } = require('../controller/userTestController.js');

// Get specific test by testId
router.get('/test/:userTestId', getUserTestId);

// Get all tests by userId
router.get('/user/:userId', getUserTests);

// GEt Code result API: http://localhost:5000/api/user-test/code-result/:id/ut/:codeTestId
router.get('/code-result/:id/ut/:codeTestId', getCodeTestResult);

// Start a new test
router.post('/start', startTest);

// Update in-progress test
router.post('/progress', inProgress);



module.exports = router;
