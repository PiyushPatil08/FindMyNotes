const Notification = require('../Models/Notification');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user: userId })
      .sort('-createdAt')
      .populate('relatedId', 'fileName userName content')
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({ user: userId, read: false });
    res.json({ count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Utility: Create notification with enhanced messaging
exports.createNotification = async ({ user, type, relatedId, relatedType, message, senderName = null }) => {
  try {
    let notificationMessage = message;
    
    // Enhanced message formatting based on type
    switch (type) {
      case 'message':
        notificationMessage = senderName 
          ? `New message from ${senderName}`
          : 'You have a new message';
        break;
      case 'comment':
        notificationMessage = senderName 
          ? `${senderName} commented on your note`
          : 'New comment on your note';
        break;
      case 'like':
        notificationMessage = senderName 
          ? `${senderName} liked your note`
          : 'Your note was liked';
        break;
      case 'upload':
        notificationMessage = senderName 
          ? `${senderName} uploaded a new note`
          : 'New note uploaded';
        break;
      case 'follow':
        notificationMessage = senderName 
          ? `${senderName} started following you`
          : 'New follower';
        break;
      default:
        notificationMessage = message || 'New notification';
    }

    const notification = await Notification.create({ 
      user, 
      type, 
      relatedId, 
      relatedType, 
      message: notificationMessage 
    });

    // Populate the notification for real-time sending
    const populatedNotification = await Notification.findById(notification._id)
      .populate('relatedId', 'fileName userName content')
      .populate('user', 'userName profileImage');

    return populatedNotification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 