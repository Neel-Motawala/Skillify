const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/profile");
    },
    filename: (req, file, cb) => {
        cb(null, "profile_" + Date.now() + path.extname(file.originalname));
    }
});


// Upload middleware
const upload = multer({ storage });

// Import controller functions
const { updateStatus, getUserData, editUserDetails, updateUserPassword } = require('../controller/userController');

// Routes

// Api: http://localhost:5000/api/users/:userId
router.get("/:userId", getUserData);

// Api: http://localhost:5000/api/users/status/:id
router.put("/status/:id", updateStatus);

// Api: http://localhost:5000/api/users/edit-profile/:userId
router.put("/edit-profile/:userId", upload.single("profile_img"), editUserDetails);

// Api: http://localhost:5000/api/users/update-password/:id
router.put("/update-password/:id", updateUserPassword);


module.exports = router;
