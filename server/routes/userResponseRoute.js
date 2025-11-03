const express = require('express');
const router = express.Router();

const { storeMcq, storeTheory } = require('../controller/userResponseController');

router.post('/mcq', storeMcq);
router.post('/theory', storeTheory);


module.exports = router;