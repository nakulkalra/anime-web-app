import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for any additional headers or modifications
api.interceptors.request.use(
  (config) => {
    // You can add any additional headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases here if needed
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 