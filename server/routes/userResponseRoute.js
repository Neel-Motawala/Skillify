const express = require('express');
const router = express.Router();

const { storeMcq } = require('../controller/userResponseController');

router.post('/mcq', storeMcq);


module.exports = router;