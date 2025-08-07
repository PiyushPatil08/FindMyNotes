import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  setNotifications, 
  markAsRead, 
  markAllAsRead,
  setLoading,
  setError,
  addNotification,
  setUnreadCount
} from '../Redux/slices/notifications-slice';
import { notificationService } from '../services/notificationService';
import NotificationIcon from '../components/NotificationIcon';
import { io } from 'socket.io-client';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user.userData);
  const notifications = useSelector(state => state.notifications.list);
  const loading = useSelector(state => state.notifications.loading);
  const error = useSelector(state => state.notifications.error);
  
  const [filter, setFilter] = useState('all'); // all, unread, messages, comments, likes

  const socketRef = useRef(null);

  // Connect to socket for real-time notifications
  useEffect(() => {
    if (!user?._id) return;
    
    // Initialize socket connection
    socketRef.current = io(notificationService.socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      path: '/socket.io'
    });

    // Join user's room
    socketRef.current.emit('join', user._id);
    
    // Subscribe to notifications
    socketRef.current.emit('subscribe_notifications', user._id);
    
    // Listen for new notifications
    socketRef.current.on('notification_received', (notification) => {
      console.log('Received real-time notification in NotificationsPage:', notification);
      dispatch(addNotification(notification));
    });
    
    // Listen for unread count updates
    socketRef.current.on('notification_count', ({ count }) => {
      console.log('Received notification count update in NotificationsPage:', count);
      dispatch(setUnreadCount(count));
    });
    
    // Load initial notifications
    loadNotifications();
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  const loadNotifications = async () => {
    try {
      dispatch(setLoading(true));
      const data = await notificationService.getNotifications(user._id);
      dispatch(setNotifications(data));
    } catch (error) {
      dispatch(setError('Failed to load notifications'));
      console.error('Error loading notifications:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user._id);
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        navigate('/inbox');
        break;
      case 'comment':
      case 'like':
        if (notification.relatedId?.fileName) {
          navigate(`/notes/${notification.relatedId._id}`);
        }
        break;
      case 'upload':
        navigate('/notes');
        break;
      default:
        break;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'messages':
        return notifications.filter(n => n.type === 'message');
      case 'comments':
        return notifications.filter(n => n.type === 'comment');
      case 'likes':
        return notifications.filter(n => n.type === 'like');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view notifications</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with instant notifications for new messages, comments, or uploads.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'unread' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
        <button
          onClick={() => setFilter('messages')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'messages' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Messages ({notifications.filter(n => n.type === 'message').length})
        </button>
        <button
          onClick={() => setFilter('comments')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'comments' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Comments ({notifications.filter(n => n.type === 'comment').length})
        </button>
        <button
          onClick={() => setFilter('likes')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'likes' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Likes ({notifications.filter(n => n.type === 'like').length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadNotifications}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">
              <NotificationIcon type="notification" className="w-16 h-16 mx-auto text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You're all caught up! Check back later for new notifications."
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <NotificationIcon 
                      type={notification.type} 
                      className="w-6 h-6" 
                      color={!notification.read ? "text-blue-600" : "text-gray-500"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-gray-800`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;