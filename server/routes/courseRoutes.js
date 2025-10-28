const express = require('express');
const router = express.Router();
// Placeholder for course controller functions
const { getCourses, getCourseDetail } = require('../controller/courseController');


router.get('/', getCourses);
router.get('/:id', getCourseDetail);

module.exports = router;