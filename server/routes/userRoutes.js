const express = require('express');
const router = express.Router();

const { getUsers, getUserCount, updateStatus, getUserData } = require('../controller/userController');

router.get("/", getUsers);
router.get("/count", getUserCount);

router.get("/:userId", getUserData);
router.put("/status/:id", updateStatus);

module.exports = router;