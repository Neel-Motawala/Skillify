const express = require('express');
const router = express.Router();

const { getUsers, getUserCount } = require('../controller/adminUserController');

router.get("/", getUsers);
router.get("/count", getUserCount);
module.exports = router;