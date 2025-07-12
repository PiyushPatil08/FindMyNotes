const express = require("express");
const dotenv = require("dotenv");
const Notes = require("../Models/Notes");
const multer = require("multer");
const path = require("path");
const User = require('../Models/User');
const NotificationController = require('./NotificationController');

dotenv.config();

const storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// Upload a note
const uploadNote = async (req, res) => {
    try {
        const { title, description, tags, category, userId } = req.body;
        const file = req.files && req.files.file ? req.files.file[0].filename : null;
        const thumbnail = req.files && req.files.thumbnail ? req.files.thumbnail[0].filename : '';
        const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        const newNote = new Notes({
            fileName: title,
            fileDescription: description,
            tags: tagsArray,
            category,
            files: file,
            thumbnail,
            uploadedBy: userId
        });
        await newNote.save();
        
        // Get uploader info for potential notifications to followers
        const uploader = await User.findById(userId).select('userName');
        
        // TODO: Add notification to followers when follow system is implemented
        // For now, we'll just log the upload
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
        const update = {};
        if (typeof req.body.fileName !== 'undefined') update.fileName = req.body.fileName;
        if (typeof req.body.fileDescription !== 'undefined') update.fileDescription = req.body.fileDescription;
        if (typeof req.body.tags !== 'undefined') {
            update.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());
        }
        if (typeof req.body.category !== 'undefined') update.category = req.body.category;
        if (req.files && req.files.file) {
            update.files = req.files.file[0].filename;
        }
        if (req.files && req.files.thumbnail) {
            update.thumbnail = req.files.thumbnail[0].filename;
        }
        const note = await Notes.findByIdAndUpdate(id, update, { new: true });
        res.json(note);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
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

module.exports = { uploadNote, getNotes, getNoteByID, updateNote, deleteNote, likeNote, unlikeNote };