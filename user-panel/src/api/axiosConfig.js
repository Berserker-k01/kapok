import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// URL Backend
axios.defaults.baseURL = 'https://e-assime.com/api';
// axios.defaults.baseURL = 'http://localhost:5000/api';

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
