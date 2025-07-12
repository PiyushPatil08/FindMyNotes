const express = require('express');
const router = express.Router();
const userController = require('../Controllers/UserController');

// Get all authors (users)
router.get('/', userController.getAllAuthors);

// Search users by name or email
router.get('/search', userController.searchUsers);

// Get author profile and their notes
router.get('/:id', userController.getAuthorProfile);

// Update author profile
router.put('/:id', userController.updateUserProfile);

module.exports = router; 