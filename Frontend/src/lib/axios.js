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
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle jika Token Expired (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika token hangus, paksa logout atau redirect ke login
      console.error("Session expired, please login again.");
      // Opsional: localStorage.removeItem('accessToken');
      // Opsional: window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
