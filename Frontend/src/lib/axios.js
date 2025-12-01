import axios from 'axios';

// Sesuaikan dengan URL Backend Anda
// Jika backend jalan di port 3000 local:
const BASE_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Setiap request keluar, otomatis tempel Token
axiosInstance.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage (kita akan simpan dengan nama 'accessToken')
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-refresh-token'] = refreshToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle jika Token Expired (401)
axiosInstance.interceptors.response.use(
  (response) => {
    const newAccessToken = response.headers['x-new-access-token'];
    const newRefreshToken = response.headers['x-new-refresh-token'];

    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Session expired, please login again.");
      try {
        // clear local tokens to avoid repeated 401 loops
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch {
        // ignore
      }

      // dispatch a DOM event the app can listen to
      try {
        window.dispatchEvent(new CustomEvent('auth:expired'));
      } catch {
        // ignore if CustomEvent fails
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
