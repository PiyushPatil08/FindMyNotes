import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead,
  setUnreadCount,
  clearLastNotification 
} from '../Redux/slices/notifications-slice';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.userData);
  const notifications = useSelector(state => state.notifications.list);
  const unreadCount = useSelector(state => state.notifications.unread);
  const lastNotification = useSelector(state => state.notifications.lastNotification);
  const loading = useSelector(state => state.notifications.loading);
  const error = useSelector(state => state.notifications.error);

  const loadNotifications = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const data = await notificationService.getNotifications(user._id);
      dispatch(setNotifications(data));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [user?._id, dispatch]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [dispatch]);

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      await notificationService.markAllAsRead(user._id);
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?._id, dispatch]);

  const getUnreadCount = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const count = await notificationService.getUnreadCount(user._id);
      dispatch(setUnreadCount(count));
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  }, [user?._id, dispatch]);

  const clearLastNotificationState = useCallback(() => {
    dispatch(clearLastNotification());
  }, [dispatch]);

  // Auto-load notifications when user changes
  useEffect(() => {
    if (user?._id) {
      loadNotifications();
      getUnreadCount();
    }
  }, [user?._id, loadNotifications, getUnreadCount]);

  return {
    notifications,
    unreadCount,
    lastNotification,
    loading,
    error,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearLastNotificationState,
    getUnreadCount
  };
};