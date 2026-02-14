import axios from "axios";
import API_BASE_URL from '../config/api.js';

// Login user
export const loginUser = async (userEmail, userPassword) => {
  try {
    const user = { userEmail, userPassword };
    const result = await axios.post(`${API_BASE_URL}/auth/login`, user);
    return result.data;
  } catch (error) {
    // Extract the server error message and re-throw it
    const message = error.response?.data?.error || "Login failed. Please try again.";
    throw new Error(message);
  }
};

// Register user
export const registerUser = async (formData) => {
  try {
    const result = await axios.post(
      `${API_BASE_URL}/auth/signup`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return result.data;
  } catch (error) {
    const message = error.response?.data?.error || "Registration failed. Please try again.";
    throw new Error(message);
  }
};

// Update user profile
export const updateUserProfile = async (userId, updateData) => {
  const result = await axios.put(`${API_BASE_URL}/authors/${userId}`, updateData);
  return result.data;
};

// Upload profile image
export const uploadProfileImage = async (selectedImage) => {
  const formData = new FormData();
  formData.append('image', selectedImage);
  const imageRes = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return imageRes.data.imageUrl;
};