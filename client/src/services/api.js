import axios from "axios";

// Normalize the API base URL to ensure it always targets the /api route prefix
// without creating duplicates like /api/api
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanUrl = envUrl.trim().replace(/\/+$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;