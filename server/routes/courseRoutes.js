const express = require('express');
const router = express.Router();
// Placeholder for course controller functions
const { getCourses, createCourse } = require('../controller/courseController');


router.get('/', getCourses);
// router.post('/', createCourse);

module.exports = router;