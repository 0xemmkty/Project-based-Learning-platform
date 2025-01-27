import axios from 'axios';

// 创建一个新的 axios 实例
const api = axios.create({
  baseURL: 'http://18.117.98.24:5000',
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
      // 打印完整的请求 URL
      const fullUrl = `${api.defaults.baseURL}/api/auth/login`;
      console.log('Full request URL:', fullUrl);
      
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
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw error.response?.data || { error: 'Registration failed' };
    }
  },
  logout: () => api.post('/auth/logout')
};

export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/profile', userData)
};

export default api; 