const express = require("express");
const router = express.Router();
const { registerUser, loginUser, adminLogin } = require("../controller/authController");
const auth = require("../middleware/auth");

// super admin registers owner
// router.post("/register-user", auth("admin"), registerUser);

// owner login
router.post("/login-user", loginUser);
router.post("/register-user", registerUser);
router.post("/login-admin", adminLogin);

module.exports = router;