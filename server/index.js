const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./Models/Message');
const Notification = require('./Models/Notification');

const authRoutes = require("./Routes/auth");
const noteRoutes = require("./Routes/notes");
const notificationsRoute = require('./Routes/notifications');

const app = express();
const PORT = process.env.PORT || 6969;

dotenv.config();

// CORS setup
// Read allowed origins from environment variable `ALLOWED_ORIGINS`
// (comma-separated) so you can update allowed frontends without changing code.
const defaultAllowedOrigins = [
  'https://findmynotes-platform.vercel.app',
  'http://localhost:5173'
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : defaultAllowedOrigins;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);

    // Support wildcard '*' in env to allow any origin
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('CORS blocked for origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connection Successful");
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.send("Server Is Running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
// app.use("/api/files", express.static("files")); // Removed for Cloudinary migration
app.use("/api/comments", require("./Routes/comments"));
app.use("/api/categories", require("./Routes/categories"));
app.use("/api/messages", require("./Routes/messages"));
app.use("/api/authors", require("./Routes/authors"));
app.use('/api/notifications', notificationsRoute);


// Socket.io logic for real-time chat
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io'
});

// Export io instance for use in other modules
module.exports.io = io;

const onlineUsers = new Map();
const userConversations = new Map(); // Track which conversations a user is in
const userNotificationRooms = new Map(); // Track notification rooms for users

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    // Join user's notification room
    const notificationRoom = `notifications:${userId}`;
    socket.join(notificationRoom);
    userNotificationRooms.set(userId, notificationRoom);

    io.emit('user_status', {
      userId: userId,
      status: 'online'
    });
    console.log(`User ${userId} connected with socket ${socket.id} and joined notification room`);

    // Send unread notification count on join
    Notification.countDocuments({ user: userId, read: false })
      .then(count => {
        socket.emit('notification_count', { count });
      })
      .catch(err => console.error('Error getting notification count:', err));
  });

  socket.on('join_conversation', ({ userId, conversationId }) => {
    const roomName = `conversation:${conversationId}`;
    socket.join(roomName);

    // Track which conversations this user is in
    if (!userConversations.has(userId)) {
      userConversations.set(userId, new Set());
    }
    userConversations.get(userId).add(conversationId);

    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { sender, receiver, content } = data;
      const message = await Message.create({ sender, receiver, content });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'userName profileImage')
        .populate('receiver', 'userName profileImage');

      // Send to conversation room if it exists
      const roomName = `conversation:${receiver}`;
      io.to(roomName).emit('receive_message', populatedMessage);

      // Also send directly to receiver's socket if they're online
      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', populatedMessage);
      }

      // Send confirmation back to sender
      socket.emit('message_sent', populatedMessage);

      console.log(`Message sent from ${sender} to ${receiver}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', {
        error: error.message,
        messageData: data // Send back the original message data for retry
      });
    }
  });

  socket.on('typing', ({ from, to }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { userId: from });
    }
  });

  // Listen for notification subscription
  socket.on('subscribe_notifications', (userId) => {
    const notificationRoom = `notifications:${userId}`;
    socket.join(notificationRoom);
    userNotificationRooms.set(userId, notificationRoom);
    console.log(`User ${userId} subscribed to notifications`);
  });

  // Handle new notification event
  socket.on('new_notification', async (notification) => {
    try {
      const { userId } = notification;
      const notificationRoom = userNotificationRooms.get(userId);

      if (notificationRoom) {
        io.to(notificationRoom).emit('notification_received', notification);
        console.log(`Notification sent to user ${userId}`);
      }

      // Update unread count
      const count = await Notification.countDocuments({ user: userId, read: false });
      io.to(notificationRoom).emit('notification_count', { count });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);

      // Leave all conversation rooms
      const userConvs = userConversations.get(socket.userId);
      if (userConvs) {
        userConvs.forEach(convId => {
          const roomName = `conversation:${convId}`;
          socket.leave(roomName);
        });
        userConversations.delete(socket.userId);
      }

      // Leave notification room
      const notificationRoom = userNotificationRooms.get(socket.userId);
      if (notificationRoom) {
        socket.leave(notificationRoom);
        userNotificationRooms.delete(socket.userId);
      }

      io.emit('user_status', {
        userId: socket.userId,
        status: 'offline'
      });

      console.log(`User ${socket.userId} disconnected`);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Only listen if not in Vercel environment
server.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});

module.exports = app;