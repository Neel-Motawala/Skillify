const express = require('express');
const router = express.Router();

const { startTest, inProgress, getUserTestId, getUserTests } = require('../controller/userTestController.js');

// Get specific test by testId
router.get('/test/:userTestId', getUserTestId);

// Get all tests by userId
router.get('/user/:userId', getUserTests);

// Start a new test
router.post('/start', startTest);

// Update in-progress test
router.post('/progress', inProgress);

module.exports = router;
