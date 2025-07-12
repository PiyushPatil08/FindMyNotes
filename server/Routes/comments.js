const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/CommentController');

// Add a comment to a note
router.post('/:noteId', commentController.addComment);

// Get all comments for a note
router.get('/:noteId', commentController.getComments);

// Delete a comment
router.delete('/:commentId', commentController.deleteComment);

module.exports = router; 