const express = require('express');
const router = express.Router();

const { getMcqResult, getUserProgress, getProfileData, getCodeTestResults } = require('../controller/userResultController');

router.get('/:userTestId', getMcqResult);

// Api: http://localhost:5000/api/results/progress/:userId
router.get('/progress/:userId', getUserProgress);


// Api: http://localhost:5000/api/results/profile/:userId
router.get('/profile/:userId', getProfileData);


// Api: http://localhost:5000/api/results/user-code/:userTestId
router.get("/user-code/:userTestId", getCodeTestResults);

module.exports = router;