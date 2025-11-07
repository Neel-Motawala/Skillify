const express = require('express');
const router = express.Router();

const { getMcqResult, getUserProgress, getProfileData, getCodeTestResults, userTestAborted, getUserCodeTestResults } = require('../controller/userResultController');

router.get('/:userTestId', getMcqResult);

// Api: http://localhost:5000/api/results/progress/:userId
router.get('/progress/:userId', getUserProgress);


// Api: http://localhost:5000/api/results/profile/:userId
router.get('/profile/:userId', getProfileData);


// Api: http://localhost:5000/api/results/user-code/:userTestId
router.get("/user-code/:userTestId", getCodeTestResults);

// Api: http://localhost:5000/api/results/user-code/all/:userId
router.get("/user-code/all/:userId", getUserCodeTestResults);


// Api: http://localhost:5000/api/results/test-aborted/:userTestId
router.post('/test-aborted/:userTestId', userTestAborted);

module.exports = router;