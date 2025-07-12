import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationIconWithBadge } from './NotificationIcon';

const LiveNotifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    lastNotification,
    markNotificationAsRead,
    clearLastNotificationState
  } = useNotifications();

  // Handle new notifications with toast
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