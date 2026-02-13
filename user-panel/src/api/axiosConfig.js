import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// URL Backend — configurable via VITE_API_URL (défaut: /api pour Docker)
const isDev = import.meta.env.DEV;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || (isDev ? '/api' : '/api');

// --- REQUEST INTERCEPTOR ---
// Attach Token automatically
axios.interceptors.request.use(
    (config) => {
        // Access store directly (works outside components)
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
// Handle 401/403 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Optional: Trigger logout if session expired
            // useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default axios;
