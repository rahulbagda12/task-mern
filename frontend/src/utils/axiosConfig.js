import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Add a request interceptor to include the auth token in every request
axios.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Error parsing user from localStorage', err);
      }
    }
    // Also enable credentials for cookie support
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors (e.g., token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Use useAuthStore.getState() to access the store outside components
      const { logout } = useAuthStore.getState();
      logout();
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
