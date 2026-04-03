// src/api/axiosInstance.ts
import axios from 'axios';

// إنشاء نسخة مخصصة من Axios
const axiosInstance = axios.create({
  // Vite يستخدم import.meta.env لجلب المتغيرات
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://hama-chamber-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة Response Interceptor لفك التغليف التلقائي للبيانات القادمة من الـ Backend
axiosInstance.interceptors.response.use(
  (response) => {
    // التحقق مما إذا كانت الخلفية قد غلفت الرد بالشكل { success, data, timestamp }
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      // استبدال هيكل Axios بالبيانات الفعلية فقط لتجنب انهيار الواجهة
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// هنا يمكننا مستقبلاً إضافة الـ Interceptors (مثل وضع الـ Token تلقائياً في كل طلب)
/*
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/

export default axiosInstance;