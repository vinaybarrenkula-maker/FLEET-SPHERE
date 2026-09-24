import axios from 'axios';
import toast from 'react-hot-toast';

const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fs_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || 'An error occurred.';
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('fs_token');
      localStorage.removeItem('fs_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('Access denied. You do not have permission.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;
