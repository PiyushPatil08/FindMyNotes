// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:6969/api";
export default API_BASE_URL;