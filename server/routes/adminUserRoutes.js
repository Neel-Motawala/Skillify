const express = require('express');
const router = express.Router();

const { getUsers, getUserCount, getUserTestResult } = require('../controller/adminUserController');

router.get("/", getUsers);
router.get("/count", getUserCount);

// Api: http://localhost:5000/api/admin/users/user-tests/:userId/result/:userTestId
router.get("/user-tests/:userId/result/:userTestId", getUserTestResult);

module.exports = router;