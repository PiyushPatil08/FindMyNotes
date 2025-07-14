const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const authRoutes = require("./Routes/auth");
const noteRoutes = require("./Routes/notes");
const notificationsRoute = require('./Routes/notifications');

const app = express();
const PORT = process.env.PORT || 6969;

dotenv.config();

// CORS setup
const allowedOrigins = [
  'https://yourproject.vercel.app', // TODO: Replace with your actual Vercel URL
  'http://localhost:5173'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connection Successful");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
};

connectDB();

app.get("/", (req, res) => {
    res.send("Server Is Running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/files", express.static("files"));
app.use("/api/comments", require("./Routes/comments"));
app.use("/api/categories", require("./Routes/categories"));
app.use("/api/messages", require("./Routes/messages"));
app.use("/api/authors", require("./Routes/authors"));
app.use('/api/notifications', notificationsRoute);

// Only listen if not in Vercel environment

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});

module.exports = app;