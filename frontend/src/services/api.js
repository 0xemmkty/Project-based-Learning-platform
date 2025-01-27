import axios from 'axios';

// 明确定义 API URL
const API_URL = 'https://18.117.98.24:5000';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request:', {
      method: config.method,
      url: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: `${error.config?.baseURL}${error.config?.url}`,
        data: error.config?.data,
        headers: error.config?.headers
      }
    });
    return Promise.reject(error);
  }
);

// 导出 auth API 方法
export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('Login attempt:', {
        url: `${API_URL}/api/auth/login`,
        credentials: { ...credentials, password: '[HIDDEN]' }
      });

      const response = await axiosInstance.post('/api/auth/login', credentials);
      
      console.log('Login successful:', {
        status: response.status,
        user: response.data.user,
        hasToken: !!response.data.token
      });

      return response;
    } catch (error) {
      console.error('Login failed:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        request: {
          method: error.config?.method,
          url: `${error.config?.baseURL}${error.config?.url}`,
          headers: error.config?.headers
        },
        isNetworkError: error.message === 'Network Error',
        isTimeout: error.code === 'ECONNABORTED'
      });

      // 重新抛出错误，但添加更多上下文
      throw {
        ...error,
        friendlyMessage: getFriendlyErrorMessage(error)
      };
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

// 获取友好的错误消息
function getFriendlyErrorMessage(error) {
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'The request took too long to complete. Please try again.';
  }
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid email or password.';
      case 403:
        return 'Access denied. Please check your credentials.';
      case 404:
        return 'Server endpoint not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Server error (${error.response.status}). Please try again.`;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

export default axiosInstance; 