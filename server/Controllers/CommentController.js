const Comment = require('../Models/Comment');
const Notes = require('../Models/Notes');
const User = require('../Models/User');
const NotificationController = require('./NotificationController');

// Add a comment to a note
exports.addComment = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { userId, text } = req.body;
        const comment = new Comment({ note: noteId, user: userId, text });
        await comment.save();
        
        // Increment commentsCount in Notes
        await Notes.findByIdAndUpdate(noteId, { $inc: { commentsCount: 1 } });
        
        // Get commenter info for notification
        const commenter = await User.findById(userId).select('userName');
        
        // Notify note owner
        const note = await Notes.findById(noteId);
        if (note && note.uploadedBy.toString() !== userId) {
            await NotificationController.createNotification({
                user: note.uploadedBy,
                type: 'comment',
                relatedId: comment._id,
                relatedType: 'Comment',
                message: 'New comment on your note.',
                senderName: commenter?.userName
            });
        }
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all comments for a note
exports.getComments = async (req, res) => {
    try {
        const { noteId } = req.params;
        const comments = await Comment.find({ note: noteId }).populate('user', 'userName profileImage');
        res.json(comments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findByIdAndDelete(commentId);
        if (comment) {
            await Notes.findByIdAndUpdate(comment.note, { $inc: { commentsCount: -1 } });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 