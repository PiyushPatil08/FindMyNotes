const express = require("express");
const router = express.Router();
const authController = require("../Controllers/AuthController");
const multer = require("multer");
const dotenv = require("dotenv");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Signup
router.post("/signup", upload.single("profileImage"), authController.signup);

// Upload profile image
router.post("/upload-image", upload.single("image"), authController.uploadImage);

// Login
router.post("/login", authController.login);

module.exports = router;