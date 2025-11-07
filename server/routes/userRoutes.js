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
const {
    getUsers,
    getUserCount,
    updateStatus,
    getUserData,
    editUserDetails
} = require('../controller/userController');

// Routes
router.get("/", getUsers);
router.get("/count", getUserCount);
router.get("/:userId", getUserData);
router.put("/status/:id", updateStatus);

// ✅ Correct multer usage + correct function reference
router.put(
    "/edit-profile/:userId",
    upload.single("profile_img"),   // ✅ THIS IS MULTER
    editUserDetails                 // ✅ Direct function (not userController)
);

module.exports = router;
