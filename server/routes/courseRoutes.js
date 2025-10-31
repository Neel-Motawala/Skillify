const express = require('express');
const router = express.Router();
const { getCourses, getCourseDetail, getCourseCount } = require('../controller/courseController');

// ✅ Order matters — specific routes first
router.get('/count', getCourseCount);
router.get('/', getCourses);
router.get('/:id', getCourseDetail);

module.exports = router;
