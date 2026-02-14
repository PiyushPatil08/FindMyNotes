const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Notes = require('./Models/Notes');
const User = require('./Models/User');
const { uploadToCloudinary } = require('./utils/uploadHelper');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connected for Migration"))
    .catch(err => {
        console.error("DB Connection Error:", err);
        process.exit(1);
    });

const backupDir = path.join(__dirname, 'backup');
const filesDir = path.join(__dirname, 'files');
const imagesDir = path.join(__dirname, 'images');

// Ensure backup dirs exist
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
if (!fs.existsSync(path.join(backupDir, 'files'))) fs.mkdirSync(path.join(backupDir, 'files'));
if (!fs.existsSync(path.join(backupDir, 'images'))) fs.mkdirSync(path.join(backupDir, 'images'));

const migrate = async () => {
    try {
        console.log("Starting Migration...");

        // --- 1. Backup ---
        console.log("Backing up files...");
        if (fs.existsSync(filesDir)) {
            const files = fs.readdirSync(filesDir);
            for (const file of files) {
                fs.copyFileSync(path.join(filesDir, file), path.join(backupDir, 'files', file));
            }
        }
        if (fs.existsSync(imagesDir)) {
            const images = fs.readdirSync(imagesDir);
            for (const image of images) {
                fs.copyFileSync(path.join(imagesDir, image), path.join(backupDir, 'images', image));
            }
        }
        console.log("Backup complete.");

        // --- 2. Migrate Notes ---
        console.log("Migrating Notes...");
        const notes = await Notes.find({});
        for (const note of notes) {
            let updated = false;

            // Migrate PDF
            if (note.files && !note.files.toString().startsWith('http')) {
                const filePath = path.join(filesDir, note.files);
                if (fs.existsSync(filePath)) {
                    console.log(`Uploading PDF for note: ${note.fileName}`);
                    try {
                        const buffer = fs.readFileSync(filePath);
                        const result = await uploadToCloudinary(buffer, 'findmynotes/pdfs', 'raw');
                        note.files = result.secure_url;
                        updated = true;
                    } catch (e) {
                        console.error(`Failed to upload PDF ${note.files}:`, e.message);
                    }
                } else {
                    console.warn(`File not found locally: ${note.files}`);
                }
            }

            // Migrate Thumbnail
            if (note.thumbnail && !note.thumbnail.toString().startsWith('http')) {
                const thumbPath = path.join(filesDir, note.thumbnail); // Thumbnails are in 'files' folder based on Notes routes
                if (fs.existsSync(thumbPath)) {
                    console.log(`Uploading Thumbnail for note: ${note.fileName}`);
                    try {
                        const buffer = fs.readFileSync(thumbPath);
                        const result = await uploadToCloudinary(buffer, 'findmynotes/thumbnails', 'image');
                        note.thumbnail = result.secure_url;
                        updated = true;
                    } catch (e) {
                        console.error(`Failed to upload thumbnail ${note.thumbnail}:`, e.message);
                    }
                }
            }

            if (updated) {
                await note.save();
                console.log(`Updated Note: ${note.fileName}`);
            }
        }

        // --- 3. Migrate Users ---
        console.log("Migrating Users...");
        const users = await User.find({});
        for (const user of users) {
            let updated = false;

            if (user.profileImage && !user.profileImage.startsWith('http')) {
                const imagePath = path.join(imagesDir, user.profileImage); // Profile images in 'images' folder
                if (fs.existsSync(imagePath)) {
                    console.log(`Uploading Profile Image for user: ${user.userName}`);
                    try {
                        const buffer = fs.readFileSync(imagePath);
                        const result = await uploadToCloudinary(buffer, 'findmynotes/profile-images', 'image');
                        user.profileImage = result.secure_url;
                        updated = true;
                    } catch (e) {
                        console.error(`Failed to upload image ${user.profileImage}:`, e.message);
                    }
                }
            }

            if (updated) {
                await user.save();
                console.log(`Updated User: ${user.userName}`);
            }
        }

        console.log("Migration Completed Successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};

migrate();
