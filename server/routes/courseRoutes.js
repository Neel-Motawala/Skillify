const express = require('express');
const router = express.Router();
const { getCourses, getCourseDetail, getCourseCount, updateCourseDetail } = require('../controller/courseController');

// ✅ Order matters — specific routes first
router.get('/count', getCourseCount);
router.get('/', getCourses);

// API: GET http://localhost:5000/api/course/:id
router.get('/:id', getCourseDetail);

router.put('/:id', updateCourseDetail); // Placeholder for updateCourse controller

module.exports = router;
