import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // 后端API地址

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器处理token
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

export const authAPI = {
  
  login: async (credentials) => {
    console.log('Sending login credentials:', credentials);
    //credentials.email = 'alice@example.com';
    //credentials.password = 'password123';
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
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