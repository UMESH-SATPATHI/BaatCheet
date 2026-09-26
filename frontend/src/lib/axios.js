import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const axiosInstance = axios.create({
    baseURL: `${apiUrl}/api`,
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;