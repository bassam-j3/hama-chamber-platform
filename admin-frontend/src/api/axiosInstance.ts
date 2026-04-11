import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hama-chamber-api.onrender.com/api/v1',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/admin')) {
         // Optionally, redirect to login if you prefer
      } else if (window.location.pathname.startsWith('/admin')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;