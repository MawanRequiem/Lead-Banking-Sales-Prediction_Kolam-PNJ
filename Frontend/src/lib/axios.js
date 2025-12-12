import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies (httpOnly) are sent with requests to the backend
  withCredentials: true,
});
// Note: Auth uses httpOnly cookies. Do not attach Authorization header from localStorage.
// Do not attach Authorization header from localStorage when using httpOnly cookies.

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

// Interceptor: Handle jika Token Expired (401)
axiosInstance.interceptors.response.use(
  //fix dead code from merge
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Avoid intercepting login/refresh endpoints
      const reqUrl = originalRequest.url || '';
      if (reqUrl.includes('/login') || reqUrl.includes('/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: () => resolve(axiosInstance(originalRequest)), reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Trigger your refresh flow by dispatching event or hitting refresh endpoint
      return new Promise((resolve, reject) => {
        const refreshRequest = axiosInstance.post('/refresh'); // backend rotates tokens
        refreshRequest
          .then(() => {
            isRefreshing = false;
            processQueue();
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            isRefreshing = false;
            processQueue(err);
            window.dispatchEvent(new CustomEvent('auth:expired'));
            reject(err);
          });
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
