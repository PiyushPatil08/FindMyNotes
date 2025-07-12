const mongoose = require("mongoose");

const NoteSchema = mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    fileDescription: {
        type: String,
        required: true,
    },
    tags: [{
        type: String
    }],
    category: {
        type: String,
        required: true,
    },
    files: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: ''
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notes", NoteSchema);