import axios from 'axios';

// 确保 API_URL 不要重复包含 /api
const API_URL = process.env.REACT_APP_API_URL ;

console.log('All env variables:', process.env);
console.log('API URL:', process.env.REACT_APP_API_URL);


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加调试日志
console.log('API instance created with baseURL:', api.defaults.baseURL);

// 请求拦截器
api.interceptors.request.use(
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
api.interceptors.response.use(
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
      // 这里只需要使用一次 /api 前缀
      const response = await api.post('/api/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        config: error.config,
        baseURL: api.defaults.baseURL
      });
      throw error;
    }
  },
  register: async (userData) => {
    try {
      console.log('Sending registration request:', userData);
      const response = await api.post('/api/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw error.response?.data || { error: 'Registration failed' };
    }
  },
  logout: () => api.post('/api/auth/logout')
};

export const userAPI = {
  getCurrentUser: () => api.get('/api/users/me'),
  updateProfile: (userData) => api.put('/api/users/profile', userData)
};

export default api; 