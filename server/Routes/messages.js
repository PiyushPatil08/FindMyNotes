const express = require('express');
const router = express.Router();
const MessageController = require('../Controllers/MessageController');

// Send a message
router.post('/', MessageController.sendMessage);

// Get all conversations for a user
router.get('/inbox/:userId', MessageController.getInbox);

// Get conversation between two users
router.get('/:userId/:authorId', MessageController.getConversation);

module.exports = router; 