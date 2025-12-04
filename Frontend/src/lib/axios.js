import axios from 'axios';

// Sesuaikan dengan URL Backend Anda
// Jika backend jalan di port 3000 local:
const BASE_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies (httpOnly) are sent with requests to the backend
  withCredentials: true,
});
// Note: Auth uses httpOnly cookies. Do not attach Authorization header from localStorage.
// Do not attach Authorization header from localStorage when using httpOnly cookies.

// Interceptor: Handle jika Token Expired (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika token hangus, paksa logout atau redirect ke login
      console.error("Session expired, please login again.");
      try {
        const reqUrl = (error.config && error.config.url) || '';
        // Avoid dispatching for login/refresh endpoints to prevent loops
        if (!reqUrl.includes('/login') && !reqUrl.includes('/refresh')) {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      } catch (e) {
        console.error('Failed to dispatch auth:expired', e);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
