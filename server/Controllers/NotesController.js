const express = require("express");
const dotenv = require("dotenv");
const Notes = require("../Models/Notes");
const multer = require("multer");
const path = require("path");
const User = require('../Models/User');
const NotificationController = require('./NotificationController');
const axios = require('axios');

dotenv.config();

const storage = multer.memoryStorage();
var upload = multer({ storage: storage });

const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl, getCloudinaryDetails } = require('../utils/uploadHelper');
const cloudinary = require('../utils/cloudinary');

// Upload a note
const uploadNote = async (req, res) => {
    try {
        const { title, description, tags, category, userId } = req.body;

        let fileUrl = '';
        let thumbnailUrl = '';
        let filePublicId = '';
        let originalFileName = '';

        if (req.files && req.files.file) {
            const fileResult = await uploadToCloudinary(req.files.file[0].buffer, 'findmynotes/pdfs', 'raw');
            fileUrl = fileResult.secure_url;
            filePublicId = fileResult.public_id;
            originalFileName = req.files.file[0].originalname;
        }

        if (req.files && req.files.thumbnail) {
            const thumbResult = await uploadToCloudinary(req.files.thumbnail[0].buffer, 'findmynotes/thumbnails', 'image');
            thumbnailUrl = thumbResult.secure_url;
        }

        const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        const newNote = new Notes({
            fileName: title,
            fileDescription: description,
            tags: tagsArray,
            category,
            files: fileUrl,
            thumbnail: thumbnailUrl,
            uploadedBy: userId,
            publicId: filePublicId,
            originalFileName: originalFileName
        });
        await newNote.save();

        // Get uploader info for potential notifications to followers
        const uploader = await User.findById(userId).select('userName');
        console.log(`New note uploaded by ${uploader?.userName}: ${title}`);

        res.status(201).json(newNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all notes with optional filters
const getNotes = async (req, res) => {
    try {
        const { title, tag, category } = req.query;
        let query = {};
        if (title) {
            query.fileName = { $regex: title, $options: 'i' };
        }
        if (tag) {
            query.tags = { $regex: tag, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        const notes = await Notes.find(query).populate('uploadedBy', 'userName profileImage');
        res.json(notes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single note by ID
const getNoteByID = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Notes.findById(id).populate('uploadedBy', 'userName profileImage');
        res.json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Notes.findById(id);
        if (!note) return res.status(404).json({ error: "Note not found" });

        const update = {};
        if (typeof req.body.fileName !== 'undefined') update.fileName = req.body.fileName;
        if (typeof req.body.fileDescription !== 'undefined') update.fileDescription = req.body.fileDescription;
        if (typeof req.body.tags !== 'undefined') {
            update.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());
        }
        if (typeof req.body.category !== 'undefined') update.category = req.body.category;

        if (req.files && req.files.file) {
            // Delete old file if exists
            if (note.files) {
                await deleteFromCloudinary(note.files, 'raw');
            }
            const fileResult = await uploadToCloudinary(req.files.file[0].buffer, 'findmynotes/pdfs', 'raw');
            update.files = fileResult.secure_url;
            update.publicId = fileResult.public_id;
            update.originalFileName = req.files.file[0].originalname;
        }

        if (req.files && req.files.thumbnail) {
            // Delete old thumbnail if exists
            if (note.thumbnail) {
                await deleteFromCloudinary(note.thumbnail, 'image');
            }
            const thumbResult = await uploadToCloudinary(req.files.thumbnail[0].buffer, 'findmynotes/thumbnails', 'image');
            update.thumbnail = thumbResult.secure_url;
        }

        const updatedNote = await Notes.findByIdAndUpdate(id, update, { new: true });
        res.json(updatedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Notes.findById(id);
        if (!note) return res.status(404).json({ error: "Note not found" });

        // Delete files from Cloudinary
        if (note.files) {
            await deleteFromCloudinary(note.files, 'raw');
        }
        if (note.thumbnail) {
            await deleteFromCloudinary(note.thumbnail, 'image');
        }

        await Notes.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Like a note
const likeNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const note = await Notes.findByIdAndUpdate(
            id,
            { $addToSet: { likes: userId } },
            { new: true }
        );

        // Get liker info for notification
        const liker = await User.findById(userId).select('userName');

        // Notify note owner
        if (note && note.uploadedBy.toString() !== userId) {
            await NotificationController.createNotification({
                user: note.uploadedBy,
                type: 'like',
                relatedId: note._id,
                relatedType: 'Note',
                message: 'Your note was liked.',
                senderName: liker?.userName
            });
        }
        res.json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Unlike a note
const unlikeNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const note = await Notes.findByIdAndUpdate(
            id,
            { $pull: { likes: userId } },
            { new: true }
        );
        res.json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Download a note (Proxy Method)
const downloadNote = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Method: downloadNote] Proxying download for ID: ${id}`);

        const note = await Notes.findById(id);
        if (!note || !note.files) {
            return res.status(404).json({ error: "File not found" });
        }

        // Determine Filename
        let filename = note.fileName.replace(/[^a-zA-Z0-9-]/g, '_');
        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }

        // Fetch file from Cloudinary
        const response = await axios({
            method: 'GET',
            url: note.files,
            responseType: 'stream'
        });

        // Set Headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers['content-type']);

        // Pipe the stream
        response.data.pipe(res);

    } catch (error) {
        console.error("[Method: downloadNote] Proxy Error:", error.message);
        // Fallback to redirect if proxy fails
        const note = await Notes.findById(req.params.id);
        if (note && note.files) {
            return res.redirect(note.files);
        }
        res.status(500).json({ error: "Download failed" });
    }
};

module.exports = { uploadNote, getNotes, getNoteByID, updateNote, deleteNote, likeNote, unlikeNote, downloadNote };