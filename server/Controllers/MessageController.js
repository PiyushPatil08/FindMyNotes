const Message = require('../Models/Message');
const User = require('../Models/User');
const NotificationController = require('./NotificationController');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, content } = req.body;
        const message = new Message({ sender, receiver, content });
        await message.save();
        
        // Get sender info for notification
        const senderUser = await User.findById(sender).select('userName');
        
        // Notify receiver
        if (receiver !== sender) {
            await NotificationController.createNotification({
                user: receiver,
                type: 'message',
                relatedId: message._id,
                relatedType: 'Message',
                message: 'You have a new message.',
                senderName: senderUser?.userName
            });
        }
        res.status(201).json(message);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
    try {
        const { userId, authorId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: authorId },
                { sender: authorId, receiver: userId }
            ]
        }).sort('timestamp').populate('sender', 'userName profileImage').populate('receiver', 'userName profileImage');
        res.json(messages);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.query;
        const messages = await Message.find({
            $or: [
                { from: user1, to: user2 },
                { from: user2, to: user1 }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all conversations for a user (inbox)
exports.getInbox = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find all messages where user is sender or receiver
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).sort('-timestamp').populate('sender', 'userName profileImage').populate('receiver', 'userName profileImage');
        // Group by conversation (other user)
        const conversations = {};
        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
            if (!conversations[otherUser._id]) {
                conversations[otherUser._id] = {
                    user: otherUser,
                    lastMessage: msg
                };
            }
        });
        res.json(Object.values(conversations));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}; 