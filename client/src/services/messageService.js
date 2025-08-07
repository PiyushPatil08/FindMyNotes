import axios from "axios";
import API_BASE_URL from '../config/api.js';

// Fetch messages for a conversation
export const fetchMessages = async (userId, conversationId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/${userId}/${conversationId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a message via HTTP API (fallback when socket is not available)
export const sendMessage = async (sender, receiver, content) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/messages`, { sender, receiver, content });
    return res.data;
  } catch (error) {
    console.error('Error sending message via HTTP:', error);
    throw error;
  }
};

// Get user's inbox (conversations)
export const getInbox = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/messages/inbox/${userId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching inbox:', error);
    throw error;
  }
};