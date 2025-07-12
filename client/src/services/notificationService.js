import axios from 'axios';
import API_BASE_URL from '../config/api.js';

export const notificationService = {
  // Get all notifications for a user
  getNotifications: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread/${userId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/notifications/read/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/notifications/read-all/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Poll for new notifications (for real-time updates)
  pollNotifications: async (userId, lastNotificationId = null) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
      const notifications = response.data;
      
      if (lastNotificationId && notifications.length > 0) {
        const newNotifications = notifications.filter(n => 
          n._id !== lastNotificationId && !n.read
        );
        return newNotifications;
      }
      
      return notifications.filter(n => !n.read);
    } catch (error) {
      console.error('Error polling notifications:', error);
      return [];
    }
  }
}; 