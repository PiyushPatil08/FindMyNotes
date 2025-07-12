const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['message', 'comment', 'like'], required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  relatedType: { type: String, enum: ['Note', 'Message', 'Comment'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema); 