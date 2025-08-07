import axios from "axios";
import API_BASE_URL from '../config/api.js';

// Fetch comments for a note
export const fetchCommentsByNoteId = async (noteId) => {
  const response = await axios.get(`${API_BASE_URL}/comments/${noteId}`);
  return response.data;
};

// Post a new comment to a note
export const postComment = async (noteId, userId, text) => {
  await axios.post(`${API_BASE_URL}/comments/${noteId}`, { userId, text });
};

// Fetch all comments (optionally filter by user in component)
export const fetchAllComments = async () => {
  const response = await axios.get(`${API_BASE_URL}/comments`);
  return response.data;
};