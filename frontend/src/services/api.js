import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

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
      console.log('Sending login request:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Server response:', response);
      return response;
    } catch (error) {
      console.error('API Error:', error.response);
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