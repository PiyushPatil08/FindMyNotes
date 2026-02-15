// API Configuration for different environments
// When deployed on Vercel, set VITE_API_URL in Environment Variables
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:6969/api").replace(/\/$/, "");
export default API_BASE_URL;