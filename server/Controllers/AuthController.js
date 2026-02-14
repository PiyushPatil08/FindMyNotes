const dotenv = require("dotenv");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const { uploadToCloudinary } = require('../utils/uploadHelper');

dotenv.config();

// Signup Route
const signup = async (req, res) => {
    try {
        const { firstName, lastName, userBio, userEmail, userMobile, userName, userPassword } = req.body;

        // --- Input validation ---
        if (!firstName || !firstName.trim()) {
            return res.status(400).json({ error: "First name is required" });
        }
        if (!lastName || !lastName.trim()) {
            return res.status(400).json({ error: "Last name is required" });
        }
        if (!userEmail || !userEmail.trim()) {
            return res.status(400).json({ error: "Email is required" });
        }
        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        if (!userName || !userName.trim()) {
            return res.status(400).json({ error: "Username is required" });
        }
        if (userName.trim().length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters" });
        }
        if (!userPassword) {
            return res.status(400).json({ error: "Password is required" });
        }
        if (userPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        // --- Check for existing user by email ---
        const existingEmail = await User.findOne({ userEmail });
        if (existingEmail) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }

        // --- Check for existing username ---
        const existingUsername = await User.findOne({ userName });
        if (existingUsername) {
            return res.status(409).json({ error: "This username is already taken" });
        }

        // --- Handle profile image (optional) ---
        let profileImageUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(firstName + " " + lastName) + "&background=random&size=200";

        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer, 'findmynotes/profile-images', 'image');
                profileImageUrl = result.secure_url;
            } catch (uploadError) {
                console.log("Image upload failed, using default avatar:", uploadError.message);
                // Continue with default avatar — don't block signup
            }
        }

        // --- Hash password ---
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const encryptedPassword = await bcrypt.hash(userPassword, salt);

        // --- Create user ---
        const newUser = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            userBio: userBio ? userBio.trim() : "",
            userEmail: userEmail.trim().toLowerCase(),
            userMobile: userMobile || null,
            userName: userName.trim(),
            userPassword: encryptedPassword,
            profileImage: profileImageUrl
        });

        await newUser.save();

        // Return user data WITHOUT the password
        const userResponse = newUser.toObject();
        delete userResponse.userPassword;

        return res.status(201).json({
            status: "Ok",
            message: "Account created successfully",
            user: userResponse
        });

    } catch (error) {
        console.log("Signup error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};

const login = async (req, res) => {
    try {
        const { userEmail, userPassword } = req.body;

        // --- Input validation ---
        if (!userEmail || !userEmail.trim()) {
            return res.status(400).json({ status: "Error", error: "Email is required" });
        }
        if (!userPassword) {
            return res.status(400).json({ status: "Error", error: "Password is required" });
        }

        // --- Find user ---
        const user = await User.findOne({ userEmail: userEmail.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({
                status: "Error",
                error: "No account found with this email"
            });
        }

        // --- Check password ---
        const passwordMatch = await bcrypt.compare(userPassword, user.userPassword);
        if (!passwordMatch) {
            return res.status(401).json({
                status: "Error",
                error: "Incorrect password"
            });
        }

        // --- Return user WITHOUT password ---
        const userResponse = user.toObject();
        delete userResponse.userPassword;

        return res.status(200).json(userResponse);

    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ status: "Error", error: "Something went wrong. Please try again." });
    }
};

// Upload profile image
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image provided" });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'findmynotes/profile-images', 'image');

        res.json({
            imageUrl: result.secure_url,
            message: "Image uploaded successfully"
        });

    } catch (error) {
        console.log("Image upload error:", error);
        res.status(500).json({ error: "Failed to upload image. Please try again." });
    }
};

module.exports = { signup, login, uploadImage };