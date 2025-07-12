import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    unread: 0,
    loading: false,
    error: null,
    lastNotification: null,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload;
      state.unread = action.payload.filter(n => !n.read).length;
    },
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unread += 1;
      state.lastNotification = action.payload;
    },
    markAsRead: (state, action) => {
      const notif = state.list.find(n => n._id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unread = state.list.filter(n => !n.read).length;
      }
    },
    markAllAsRead: (state) => {
      state.list.forEach(n => n.read = true);
      state.unread = 0;
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unread = 0;
      state.lastNotification = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUnreadCount: (state, action) => {
      state.unread = action.payload;
    },
    clearLastNotification: (state) => {
      state.lastNotification = null;
    },
  },
});

export const { 
  setNotifications, 
  addNotification, 
  markAsRead, 
  markAllAsRead,
  clearNotifications, 
  setLoading, 
  setError,
  setUnreadCount,
  clearLastNotification
} = notificationsSlice.actions;

export default notificationsSlice.reducer; 