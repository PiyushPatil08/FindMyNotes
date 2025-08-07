import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationIconWithBadge } from './NotificationIcon';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification, setUnreadCount } from '../Redux/slices/notifications-slice';
import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api.js';

// Use the same base URL for socket connection but without the /api path
const SOCKET_URL = API_BASE_URL.replace('/api', '');

const LiveNotifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.userData);
  const socketRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    lastNotification,
    markNotificationAsRead,
    clearLastNotificationState,
    getUnreadCount
  } = useNotifications();

  // Connect to socket for real-time notifications
  useEffect(() => {
    if (!user?._id) return;
    
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
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
      console.log('Received real-time notification:', notification);
      dispatch(addNotification(notification));
      
      // Show toast notification
      const toastMessage = getToastMessage(notification);
      toast.info(toastMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => handleNotificationClick(notification),
        onClose: () => clearLastNotificationState()
      });
    });
    
    // Listen for unread count updates
    socketRef.current.on('notification_count', ({ count }) => {
      console.log('Received notification count update:', count);
      dispatch(setUnreadCount(count));
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?._id, dispatch, clearLastNotificationState]);
  
  // Handle new notifications with toast (for non-socket notifications)
  useEffect(() => {
    if (lastNotification) {
      // Show toast notification
      const toastMessage = getToastMessage(lastNotification);
      toast.info(toastMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => handleNotificationClick(lastNotification),
        onClose: () => clearLastNotificationState()
      });

      // Auto-mark as read after showing toast
      setTimeout(() => {
        if (lastNotification._id) {
          markNotificationAsRead(lastNotification._id);
        }
      }, 1000);
    }
  }, [lastNotification, markNotificationAsRead, clearLastNotificationState]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    markNotificationAsRead(notification._id);
    
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

  const getToastMessage = (notification) => {
    return notification.message || 'New notification';
  };

  if (!notifications) return null;

  return (
    <div className="relative">
      {/* Notification Bell - Direct Navigation */}
      <button
        onClick={() => navigate('/notifications')}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        aria-label="View all notifications"
        title="View all notifications"
      >
        <NotificationIconWithBadge 
          type="notification" 
          unreadCount={unreadCount}
          className="w-6 h-6" 
        />
      </button>
    </div>
  );
};

export default LiveNotifications;