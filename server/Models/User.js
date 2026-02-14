const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
    },
    userBio: {
        type: String,
        default: "",
        trim: true,
    },
    userEmail: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    userMobile: {
        type: Number,
        default: null,
    },
    userName: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
    },
    userPassword: {
        type: String,
        required: [true, "Password is required"],
    },
    profileImage: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);