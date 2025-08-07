import axios from "axios";
import API_BASE_URL from '../config/api.js';

// Fetch all notes
export const fetchNotes = async () => {
  const response = await axios.get(`${API_BASE_URL}/notes/getFiles?`);
  return response.data;
};

// Fetch a single note by ID (by filtering all notes, as in NoteDetails)
export const fetchNoteById = async (id) => {
  const notes = await fetchNotes();
  return notes.find(n => n._id === id);
};

// Update a note by ID
export const updateNote = async (noteId, updateObj) => {
  return axios.put(`${API_BASE_URL}/notes/${noteId}`, updateObj);
};

// Delete a note by ID
export const deleteNote = async (noteId) => {
  return axios.delete(`${API_BASE_URL}/notes/${noteId}`);
};

// Like or unlike a note
export const likeNote = async (noteId, userId, liked) => {
  const url = `${API_BASE_URL}/notes/${noteId}/${liked ? "unlike" : "like"}`;
  return axios.post(url, { userId });
};

// Search notes by title
export const searchNotes = async (title) => {
  const response = await axios.get(`${API_BASE_URL}/notes/getFiles`, {
    params: { title },
  });
  return response.data.data;
};

// Fetch categories
export const fetchCategories = async () => {
  const response = await axios.get("http://localhost:6969/categories");
  return response.data;
};