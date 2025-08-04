import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.VITE_API_URL || 'https://kikobackendmysql-production.up.railway.app'
  : 'https://kikobackendmysql-production.up.railway.app';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for session-based auth
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here (e.g., auth tokens if needed)
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`Making ${config.method?.toUpperCase()} request to ${fullUrl}`);
    console.log('Base URL:', config.baseURL);
    console.log('Request URL:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login or handle auth
          console.error('Unauthorized access');
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('Unexpected error:', error.response.status);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;