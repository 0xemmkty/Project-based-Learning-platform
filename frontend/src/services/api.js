import axios from 'axios';

// 先打印检查 API_URL
const API_URL = 'https://18.117.98.24:5000';
console.log('API_URL is:', API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 立即检查实例配置
console.log('Axios instance baseURL:', axiosInstance.defaults.baseURL);

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      // 打印完整 URL
      const fullUrl = `${axiosInstance.defaults.baseURL}/api/auth/login`;
      console.log('Full request URL:', fullUrl);
      
      const response = await axiosInstance.post('/api/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Login error:', {
        baseURL: axiosInstance.defaults.baseURL,
        requestUrl: error.config?.url,
        fullUrl: error.config?.baseURL + error.config?.url
      });
      throw error;
    }
  },
  register: async (userData) => {
    try {
      console.log('Sending registration request:', userData);
      const response = await axiosInstance.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw error.response?.data || { error: 'Registration failed' };
    }
  },
  logout: () => axiosInstance.post('/auth/logout')
};

export const userAPI = {
  getCurrentUser: () => axiosInstance.get('/users/me'),
  updateProfile: (userData) => axiosInstance.put('/users/profile', userData)
};

export default axiosInstance; 