const express = require('express');
const router = express.Router();

const { getMcqResult } = require('../controller/userResultController');

router.get('/:userTestId', getMcqResult);

module.exports = router;