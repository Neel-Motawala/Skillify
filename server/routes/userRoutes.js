const express = require('express');
const router = express.Router();

const { getUsers, getUserCount, updateStatus } = require('../controller/userController');

router.get("/", getUsers);
router.get("/count", getUserCount);
router.put("/status/:id", updateStatus);

module.exports = router;