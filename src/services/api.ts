import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.VITE_API_URL || 'https://kikobackendmysql-production.up.railway.app'
  : 'https://kikobackendmysql-production.up.railway.app';

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
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
    console.log(`🚀 Making request to: ${fullUrl}`);
    
    // Add timestamp for performance tracking
    (config as any).startTime = new Date();
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = new Date().getTime() - (response.config as any).startTime?.getTime();
    console.log(`✅ Response received in ${duration}ms from: ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      duration: error.config?.startTime ? 
        new Date().getTime() - error.config.startTime.getTime() : 'unknown'
    });

    // Retry logic for network errors and 5xx server errors
    if (
      !originalRequest._retry && 
      (error.code === 'ECONNABORTED' || 
       error.message?.includes('timeout') ||
       error.message?.includes('network') ||
       (error.response?.status >= 500 && error.response?.status < 600))
    ) {
      originalRequest._retry = true;
      
      // Exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, originalRequest._retryCount || 0), 10000);
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      console.log(`🔄 Retrying request in ${retryDelay}ms (attempt ${originalRequest._retryCount})`);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;