const express = require('express');
const router = express.Router();
const notificationController = require('../Controllers/NotificationController');

// Get all notifications for a user
router.get('/:userId', notificationController.getNotifications);

// Get unread notification count
router.get('/unread/:userId', notificationController.getUnreadCount);

// Mark notification as read
router.put('/read/:id', notificationController.markAsRead);

// Mark all notifications as read for a user
router.put('/read-all/:userId', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router; 